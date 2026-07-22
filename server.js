require("dotenv").config();
const express = require("express");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const Anthropic = require("@anthropic-ai/sdk");
const { SYSTEM_PROMPT } = require("./lib/systemPrompt");
const { renderForm } = require("./lib/renderForm");
const { personaReportSchema } = require("./lib/schema");
const { renderReport } = require("./lib/renderReport");
const { getProfile } = require("./lib/profiles");

const app = express();
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const PORT = process.env.PORT || 3000;
const MODEL = process.env.CLAUDE_MODEL || "claude-sonnet-4-6";

function getClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set.");
  return new Anthropic({ apiKey });
}

app.get("/", (req, res) => res.send(renderForm()));
app.get("/healthz", (req, res) => res.json({ ok: true }));

app.post("/generate", upload.single("linkedinPdf"), async (req, res) => {
  const { fullName, organization, linkedinUrl, additionalLinks, pastedMaterial } = req.body;

  if (!fullName || !organization) {
    return res.status(400).send(renderForm({ error: "Full name and organization are required." }));
  }

  try {
    const client = getClient();

    // 1. Check pre-loaded profile store
    let sourceMaterial = getProfile(fullName);
    if (sourceMaterial) console.log("[Profile] Found stored profile for:", fullName);

    // 2. Extract text from uploaded PDF if present
    if (!sourceMaterial && req.file && req.file.buffer) {
      try {
        const parsed = await pdfParse(req.file.buffer);
        sourceMaterial = parsed.text.trim();
        console.log("[PDF] Extracted", sourceMaterial.length, "chars");
      } catch (e) {
        console.warn("[PDF] Parse failed:", e.message);
      }
    }

    // 3. Fall back to pasted text
    if (!sourceMaterial) sourceMaterial = (pastedMaterial && pastedMaterial.trim()) || "";

    const hasMaterial = sourceMaterial.length > 0;

    const userMessage = hasMaterial
      ? `TARGET INDIVIDUAL
Full Name: ${fullName}
Current Organization: ${organization}
LinkedIn URL: ${linkedinUrl || "Not provided"}
Additional Links: ${additionalLinks || "None"}

SOURCE MATERIAL (use only this, do not invent anything beyond it):
"""
${sourceMaterial}
"""

Call the emit_persona_report tool with the complete 8-section structure.`
      : `TARGET INDIVIDUAL
Full Name: ${fullName}
Current Organization: ${organization}
LinkedIn URL: ${linkedinUrl || "Not provided"}
Additional Links: ${additionalLinks || "None"}

Search the web now to gather everything publicly available about this person. Run multiple searches:
- "${fullName} ${organization}"
- "${fullName} LinkedIn"
- "${fullName} site:linkedin.com"
- "${fullName} interview OR profile OR bio"

Gather all you can find — LinkedIn bio, experience, company page, press, interviews — then call the emit_persona_report tool with the complete 8-section structure.`;

    const tools = hasMaterial
      ? [personaReportSchema]
      : [{ type: "web_search_20250305", name: "web_search" }, personaReportSchema];

    const requestParams = {
      model: MODEL,
      max_tokens: 8000,
      system: SYSTEM_PROMPT,
      tools,
      messages: [{ role: "user", content: userMessage }],
    };

    if (hasMaterial) {
      requestParams.tool_choice = { type: "tool", name: "emit_persona_report" };
    }

    const response = await client.messages.create(requestParams);

    const toolUse = response.content.find(
      (c) => c.type === "tool_use" && c.name === "emit_persona_report"
    );
    if (!toolUse) throw new Error("Model did not return a structured report. Try again.");

    res.send(renderReport(toolUse.input));
  } catch (err) {
    console.error(err);
    res.status(500).send(renderForm({ error: `Error generating report: ${err.message}` }));
  }
});

app.listen(PORT, () => console.log(`Practus Persona Agent listening on port ${PORT}`));
