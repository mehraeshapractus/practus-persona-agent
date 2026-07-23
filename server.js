require("dotenv").config();
const express = require("express");
const Anthropic = require("@anthropic-ai/sdk");
const nodemailer = require("nodemailer");
const { SYSTEM_PROMPT } = require("./lib/systemPrompt");
const { renderForm } = require("./lib/renderForm");
const { personaReportSchema } = require("./lib/schema");
const { renderReport } = require("./lib/renderReport");
const { getProfile } = require("./lib/profiles");

const app = express();
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

const PORT = process.env.PORT || 3000;
const MODEL = process.env.CLAUDE_MODEL || "claude-sonnet-4-6";
const SEARCH_MODEL = "claude-haiku-4-5-20251001";

function getClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set.");
  return new Anthropic({ apiKey });
}

app.get("/", (req, res) => res.send(renderForm()));
app.get("/healthz", (req, res) => res.json({ ok: true }));

app.post("/generate", async (req, res) => {
  const { fullName, organization } = req.body;

  if (!fullName || !organization) {
    return res.status(400).send(renderForm({ error: "Full name and organization are required." }));
  }

  try {
    const client = getClient();

    // 1. Check pre-loaded profile store
    let sourceMaterial = getProfile(fullName);
    if (sourceMaterial) console.log("[Profile] Found stored profile for:", fullName);

    // 2. If no stored profile — search the web first, then force the report
    if (!sourceMaterial) {
      console.log("[Search] No stored profile, running web search for:", fullName);

      const searchResponse = await client.messages.create({
        model: SEARCH_MODEL,
        max_tokens: 2000,
        tools: [{ type: "web_search_20250305", name: "web_search" }],
        messages: [{
          role: "user",
          content: `Find everything publicly available about ${fullName} who works at ${organization}. Search for:
- "${fullName} ${organization}"
- "${fullName} site:linkedin.com"
- "${fullName} ${organization} LinkedIn"
- "${fullName} profile OR bio OR career"

Return a detailed summary of their career history, current role, education, skills, and any notable achievements or quotes you find.`,
        }],
      });

      sourceMaterial = searchResponse.content
        .filter((c) => c.type === "text")
        .map((c) => c.text)
        .join("\n")
        .trim();

      console.log("[Search] Gathered", sourceMaterial.length, "chars");
    }

    // 3. Force emit_persona_report with whatever source we have
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 5000,
      system: SYSTEM_PROMPT,
      tools: [personaReportSchema],
      tool_choice: { type: "tool", name: "emit_persona_report" },
      messages: [{
        role: "user",
        content: `TARGET INDIVIDUAL
Full Name: ${fullName}
Current Organization: ${organization}

SOURCE MATERIAL:
"""
${sourceMaterial || "No specific data found — use your general knowledge about this person and their organization."}
"""

Call the emit_persona_report tool with the complete 8-section structure.`,
      }],
    });

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

app.post("/send-email", async (req, res) => {
  try {
    const { reportDataJson, personName } = req.body;
    if (!reportDataJson) return res.json({ ok: false, error: "No report data" });

    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    if (!emailUser || !emailPass) {
      console.warn("[Email] EMAIL_USER / EMAIL_PASS not configured");
      return res.json({ ok: false, error: "Email not configured" });
    }

    const data = JSON.parse(reportDataJson);
    const reportHtml = renderReport(data);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: emailUser, pass: emailPass },
    });

    await transporter.sendMail({
      from: emailUser,
      to: "yashwin.pamecha@roibypractus.com",
      subject: `Persona Brief: ${personName || "Unknown"}`,
      html: reportHtml,
    });

    console.log("[Email] Sent persona brief for", personName);
    res.json({ ok: true });
  } catch (err) {
    console.error("[Email] Error:", err.message);
    res.json({ ok: false, error: err.message });
  }
});

app.listen(PORT, () => console.log(`Practus Persona Agent listening on port ${PORT}`));
