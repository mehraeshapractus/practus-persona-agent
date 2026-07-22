require("dotenv").config();
const express = require("express");
const Anthropic = require("@anthropic-ai/sdk");
const { SYSTEM_PROMPT } = require("./lib/systemPrompt");
const { renderForm } = require("./lib/renderForm");

const app = express();
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

const PORT = process.env.PORT || 3000;
const MODEL = process.env.CLAUDE_MODEL || "claude-sonnet-5";

function getClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Add it as an environment variable on Railway (Project → Variables)."
    );
  }
  return new Anthropic({ apiKey });
}

app.get("/", (req, res) => {
  res.send(renderForm());
});

app.get("/healthz", (req, res) => res.json({ ok: true }));

app.get("/sample", (req, res) => {
  res.send(renderSample());
});

app.post("/generate", async (req, res) => {
  const { fullName, organization, linkedinUrl, additionalLinks, pastedMaterial } = req.body;

  if (!fullName || !organization) {
    return res
      .status(400)
      .send(renderForm({ error: "Full name and organization are required." }));
  }

  const autoSearch = !pastedMaterial || !pastedMaterial.trim();

  const userMessage = autoSearch
    ? `TARGET INDIVIDUAL
Full Name: ${fullName}
Current Organization: ${organization}
LinkedIn Profile URL: ${linkedinUrl || "Not provided"}
Additional Links: ${additionalLinks || "None provided"}

No source material was pasted. Search the web for this person — look for their LinkedIn profile, press mentions, interviews, company bio, and any public content. Use what you find as the source material, then produce the complete persona 1-pager following the 8-section structure in your instructions. Label everything you find as Observed, and flag anything you cannot find as Gap.`
    : `TARGET INDIVIDUAL
Full Name: ${fullName}
Current Organization: ${organization}
LinkedIn Profile URL: ${linkedinUrl || "Not provided"}
Additional Links: ${additionalLinks || "None provided"}

SOURCE MATERIAL (this is the ONLY information you may use — do not invent anything beyond it):
"""
${pastedMaterial}
"""

Now produce the complete persona 1-pager following the 8-section structure in your instructions.`;

  try {
    const client = getClient();

    const requestParams = {
      model: MODEL,
      max_tokens: 8000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    };

    if (autoSearch) {
      requestParams.tools = [{ type: "web_search_20250305", name: "web_search" }];
    }

    const response = await client.messages.create(requestParams);

    const textBlock = response.content.find((c) => c.type === "text");
    if (!textBlock) {
      throw new Error("Model did not return a report. Try again.");
    }

    res.send(renderTextReport(fullName, organization, textBlock.text));
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .send(
        renderForm({
          error: `Something went wrong generating the report: ${err.message}`
        })
      );
  }
});

function renderSample() {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
<title>Sample — Practus Persona 1-Pager</title>
<style>
:root{--navy:#123250;--navy2:#1a4570;--gold:#FDB81A;--teal:#228899;--green:#3d7a2e;--amber:#a05f00;--bg:#EEF1F5;--surface:#ffffff;--border:#D8DDE5;--text:#1a1a1a;--muted:#5a6270;--obs-bg:#eef6eb;--obs-txt:#2a5a1e;--inf-bg:#e6f4f6;--inf-txt:#155f6a;--gap-bg:#fef3e2;--gap-txt:#7a4800;}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;background:var(--bg);color:var(--text);font-size:13.5px;line-height:1.6;}
.topbar{background:var(--navy);padding:10px 24px;display:flex;justify-content:space-between;align-items:center;}
.topbar-brand{font-family:Georgia,serif;font-size:13px;font-weight:700;color:var(--gold);letter-spacing:0.08em;text-transform:uppercase;}
.topbar-actions{display:flex;gap:8px;}
.topbar-actions a{font-size:11.5px;color:rgba(255,255,255,0.7);text-decoration:none;padding:5px 11px;border:1px solid rgba(255,255,255,0.2);border-radius:5px;font-weight:600;}
.topbar-actions a:hover{background:rgba(255,255,255,0.1);}
.topbar-actions .btn-print{background:var(--gold);color:var(--navy);border-color:var(--gold);}
.page{max-width:920px;margin:0 auto;padding:24px 20px 48px;}
.hero{background:linear-gradient(135deg,var(--navy) 0%,var(--navy2) 100%);border-radius:14px;padding:28px 32px;margin-bottom:16px;display:flex;align-items:flex-start;gap:22px;}
.avatar{width:58px;height:58px;border-radius:50%;background:var(--gold);display:flex;align-items:center;justify-content:center;font-family:Georgia,serif;font-size:21px;font-weight:700;color:var(--navy);flex-shrink:0;}
.hero-info{flex:1;}
.hero-info h1{font-family:Georgia,serif;font-size:22px;font-weight:700;color:#fff;margin-bottom:3px;}
.hero-info .role{font-size:13px;color:rgba(255,255,255,0.75);margin-bottom:12px;}
.badges{display:flex;flex-wrap:wrap;gap:6px;}
.badge{font-size:10.5px;font-weight:700;padding:3px 10px;border-radius:20px;letter-spacing:0.02em;text-transform:uppercase;}
.badge-teal{background:var(--teal);color:#fff;}
.badge-gold{background:var(--gold);color:var(--navy);}
.badge-ghost{background:rgba(255,255,255,0.12);color:rgba(255,255,255,0.85);border:1px solid rgba(255,255,255,0.2);}
.source-banner{background:#e8f4f2;border:1px solid #aad3cc;border-radius:10px;padding:12px 18px;margin-bottom:16px;font-size:12px;color:#1b5e57;display:flex;gap:10px;align-items:flex-start;}
.card{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:20px 24px;margin-bottom:14px;}
.section-title{font-family:Georgia,serif;font-size:13.5px;font-weight:700;color:var(--navy);text-transform:uppercase;letter-spacing:0.06em;border-bottom:2.5px solid var(--gold);padding-bottom:8px;margin-bottom:16px;display:flex;align-items:center;gap:8px;}
.section-num{display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;background:var(--navy);color:var(--gold);border-radius:50%;font-size:10px;font-weight:700;font-family:system-ui,sans-serif;flex-shrink:0;}
.sub{font-size:10.5px;font-weight:700;color:var(--teal);text-transform:uppercase;letter-spacing:0.08em;margin:14px 0 6px;}
.sub:first-child{margin-top:0;}
.note{font-size:11.5px;color:var(--muted);font-style:italic;margin-bottom:10px;line-height:1.5;}
.lbl{display:inline-block;font-size:9.5px;font-weight:700;padding:1.5px 6px;border-radius:3px;text-transform:uppercase;letter-spacing:0.05em;margin-right:5px;vertical-align:middle;}
.o{background:var(--obs-bg);color:var(--obs-txt);}
.i{background:var(--inf-bg);color:var(--inf-txt);}
.g{background:var(--gap-bg);color:var(--gap-txt);}
ul.b{padding-left:18px;margin:4px 0 8px;}
ul.b li{margin-bottom:7px;font-size:13px;line-height:1.6;}
ul.b li strong{color:var(--navy);}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:20px;}
@media(max-width:600px){.grid2{grid-template-columns:1fr;}}
.tl{border-left:2px solid var(--teal);margin:10px 0 4px 8px;padding-left:18px;}
.tl-item{position:relative;margin-bottom:14px;}
.tl-item::before{content:'';position:absolute;left:-24px;top:5px;width:9px;height:9px;border-radius:50%;background:var(--gold);border:2px solid var(--teal);}
.tl-date{font-size:10.5px;color:var(--teal);font-weight:700;margin-bottom:1px;font-variant-numeric:tabular-nums;}
.tl-role{font-size:13px;font-weight:700;color:var(--navy);}
.tl-firm{font-size:12px;color:var(--muted);}
.tags{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0 10px;}
.tag{font-size:11.5px;font-weight:600;padding:4px 11px;border-radius:20px;background:#e4f1f3;color:#155f6a;}
.hook{border-left:3px solid var(--teal);background:#f5fbfc;border-radius:0 7px 7px 0;padding:10px 14px;margin:9px 0;font-size:12.5px;line-height:1.6;}
.hook-title{font-weight:700;color:var(--navy);font-size:11px;text-transform:uppercase;letter-spacing:0.04em;margin-bottom:4px;}
.hook-sub{font-size:11.5px;color:var(--muted);margin-top:4px;font-style:italic;}
.tmpl-flag{display:inline-block;font-size:9.5px;font-weight:700;background:#fff3cc;color:#7a5000;border:1px solid #f0d070;padding:2px 7px;border-radius:3px;text-transform:uppercase;letter-spacing:0.04em;margin-bottom:5px;}
.tmpl{background:#fafbfc;border:1px solid var(--border);border-radius:7px;padding:10px 14px;margin:7px 0;font-size:12.5px;line-height:1.6;font-style:italic;color:#2a2a2a;}
.avoid-row{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0;}
.avoid{font-size:11px;font-weight:600;padding:4px 11px;border-radius:20px;background:#fce8e8;color:#7a2020;}
.sc{background:#f8fafc;border:1px solid var(--border);border-radius:9px;padding:14px 16px;margin-bottom:10px;}
.sc h4{font-family:Georgia,serif;font-size:13px;color:var(--navy);margin-bottom:6px;}
.sc p{font-size:12.5px;color:#444;line-height:1.55;margin-bottom:8px;}
.sc-q{font-size:12px;color:var(--teal);font-style:italic;line-height:1.55;padding:5px 0 2px;border-top:1px dashed #cce0e4;margin-top:4px;}
.risk-ok{display:inline-block;font-size:12px;font-weight:600;color:#2a5a1e;background:#eef6eb;padding:8px 14px;border-radius:7px;margin-top:8px;}
.rflag{border-left:3px solid #c0392b;padding:8px 12px;margin:7px 0;font-size:12.5px;background:#fdf5f5;border-radius:0 6px 6px 0;line-height:1.55;}
.conf-overall{font-size:16px;font-weight:700;color:var(--navy);font-family:Georgia,serif;margin-bottom:14px;}
.conf-row{display:flex;align-items:center;gap:10px;margin:8px 0;}
.conf-lbl{font-size:12px;color:var(--text);min-width:160px;}
.bar-track{flex:1;height:7px;background:#e8ecf0;border-radius:4px;overflow:hidden;}
.bar-fill{height:100%;border-radius:4px;}
.conf-rating{font-size:11px;color:var(--muted);min-width:72px;text-align:right;}
.opt-hdr{font-size:10.5px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:0.08em;text-align:center;margin:6px 0 14px;position:relative;}
.opt-hdr::before{content:'';display:block;height:1px;background:var(--border);position:absolute;top:50%;left:0;right:0;z-index:0;}
.opt-hdr span{background:var(--bg);padding:0 12px;position:relative;z-index:1;}
.page-footer{font-size:10px;color:var(--muted);text-align:center;padding-top:18px;border-top:1px solid var(--border);margin-top:8px;}
.demo-banner{background:#fff8e1;border:1px solid #ffe082;border-radius:8px;padding:9px 16px;margin-bottom:16px;font-size:12px;color:#7a5000;text-align:center;font-weight:600;}
@media print{.topbar,.demo-banner{display:none;}body{background:#fff;}.card{break-inside:avoid;}}
</style></head><body>
<div class="topbar">
  <span class="topbar-brand">Practus &middot; Research Intelligence</span>
  <div class="topbar-actions">
    <a href="/">&larr; New Persona</a>
    <a href="#" class="btn-print" onclick="window.print();return false;">Print / PDF</a>
  </div>
</div>
<div class="page">
<div class="demo-banner">&#9432; Sample output &mdash; fictional individual (Rajiv Menon). Illustrates the full 8-section format with observed / inferred / gap labels.</div>

<div class="hero">
  <div class="avatar">RM</div>
  <div class="hero-info">
    <h1>Rajiv Menon</h1>
    <div class="role">Managing Director &amp; Head of Portfolio Operations &middot; Apex Capital Partners</div>
    <div class="badges">
      <span class="badge badge-teal">MD / Principal Level</span>
      <span class="badge badge-gold">Portfolio Operations</span>
      <span class="badge badge-ghost">Mid-Market PE</span>
      <span class="badge badge-ghost">Mumbai</span>
    </div>
  </div>
</div>

<div class="source-banner">
  <div>&#10003;</div>
  <div>Analysis based solely on supplied material: career summary, 4 LinkedIn content items (1 authored article, 1 reshare, 2 comments), and 1 speaking engagement reference (India PE Summit 2024). No live browsing performed. A 2019&ndash;2021 career gap is present and cannot be filled from this material.</div>
</div>

<div class="card">
  <div class="section-title"><span class="section-num">1</span> Professional Snapshot</div>
  <div class="grid2">
    <div>
      <div class="sub">Role &amp; Scope</div>
      <ul class="b">
        <li><span class="lbl o">Observed</span> MD &amp; Head of Portfolio Operations, Apex Capital Partners (since 2021). Mid-market PE, AUM ~USD&nbsp;1.2bn, Mumbai-based.</li>
        <li><span class="lbl i">Inferred</span> Owns the operational improvement agenda across the portfolio &mdash; 100-day plans, EBITDA programs, value creation execution across portcos.</li>
        <li><span class="lbl i">Inferred</span> Primary decision-maker and gatekeeper for operational consulting spend at Apex. Key internal champion for execution mandates.</li>
        <li><span class="lbl o">Observed</span> Speaker at India PE Summit 2024 &mdash; recognized voice in mid-market PE operational improvement.</li>
      </ul>
      <div class="sub">Functional Expertise</div>
      <ul class="b">
        <li><span class="lbl o">Observed</span> Operations transformation, post-merger integration, working capital management, PE value creation.</li>
        <li><span class="lbl o">Observed</span> 6 years McKinsey Operations &amp; Transformation &mdash; direct exposure to post-acquisition integration and 100-day planning.</li>
      </ul>
    </div>
    <div>
      <div class="sub">Decision-Making Level</div>
      <ul class="b">
        <li><span class="lbl i">Inferred</span> Functional lead with C-suite adjacency. Key buyer and internal champion for operational consulting across portfolio.</li>
        <li><span class="lbl i">Inferred</span> Direct engagement with portco management teams &mdash; not purely oversight advisory.</li>
      </ul>
      <div class="sub">Career Trajectory</div>
      <ul class="b">
        <li><span class="lbl o">Observed</span> Finance Analyst &rarr; Strategy/Ops Consulting &rarr; PE Portfolio Operations. Deliberate, accelerating arc.</li>
        <li><span class="lbl i">Inferred</span> Move from McKinsey EM to MD-level PE signals seniority jump and shift from advisory to accountability.</li>
        <li><span class="lbl g">Gap</span> 2019&ndash;2021 career gap not accounted for in supplied material.</li>
      </ul>
    </div>
  </div>
  <div class="sub" style="margin-top:16px">Career Timeline</div>
  <div class="tl">
    <div class="tl-item"><div class="tl-date">2021 &ndash; Present</div><div class="tl-role">MD &amp; Head of Portfolio Operations</div><div class="tl-firm">Apex Capital Partners</div></div>
    <div class="tl-item"><div class="tl-date">2013 &ndash; 2019</div><div class="tl-role">Engagement Manager, Operations &amp; Transformation</div><div class="tl-firm">McKinsey &amp; Company</div></div>
    <div class="tl-item"><div class="tl-date">2010 &ndash; 2013</div><div class="tl-role">Finance Analyst</div><div class="tl-firm">ICICI Bank</div></div>
    <div class="tl-item"><div class="tl-date">2013</div><div class="tl-role">MBA</div><div class="tl-firm">IIM Ahmedabad</div></div>
    <div class="tl-item"><div class="tl-date">2010</div><div class="tl-role">B.Tech, Mechanical Engineering</div><div class="tl-firm">IIT Bombay</div></div>
  </div>
</div>

<div class="card">
  <div class="section-title"><span class="section-num">2</span> Content &amp; Engagement Analysis</div>
  <div class="note">Data limitation: only 4 discrete LinkedIn content items provided (1 original article, 1 reshare, 2 comments). Directional only &mdash; not statistically representative.</div>
  <div class="grid2">
    <div>
      <div class="sub">Content Themes</div>
      <div class="tags">
        <span class="tag">Post-acquisition integration</span><span class="tag">100-day planning</span><span class="tag">Working capital</span><span class="tag">Revenue vs. cost sequencing</span><span class="tag">Operational alpha in PE</span><span class="tag">Transformation framing</span>
      </div>
      <div class="sub" style="margin-top:12px">Content Type Preference</div>
      <ul class="b">
        <li><span class="lbl o">Observed</span> Mix of original thought leadership and curated resharing/commenting. Quality-over-quantity signals.</li>
        <li><span class="lbl i">Inferred</span> Low-to-moderate posting frequency; content is substantive when it appears &mdash; no promotional or motivational posts observed.</li>
      </ul>
    </div>
    <div>
      <div class="sub">Engagement Behaviour</div>
      <ul class="b">
        <li><span class="lbl o">Observed</span> Authored article with defined POV: <em>&ldquo;The biggest mistake is treating integration as a project, not a transformation.&rdquo;</em></li>
        <li><span class="lbl o">Observed</span> Reshared McKinsey NWC piece with endorsement of 15&ndash;20% improvement thesis in manufacturing portcos.</li>
        <li><span class="lbl o">Observed</span> Comment on Bain Capital post reflects counter-balancing view on revenue vs. cost indexing &mdash; engages critically, not just supportively.</li>
        <li><span class="lbl i">Inferred</span> Analytical, practitioner-grounded tone. Not self-promotional.</li>
      </ul>
      <div class="sub">Influencer Alignment</div>
      <ul class="b"><li><span class="lbl o">Observed</span> Engages with McKinsey, Bain Capital content. India PE Summit &mdash; domestic mid-market PE community.</li></ul>
    </div>
  </div>
</div>

<div class="card">
  <div class="section-title"><span class="section-num">3</span> Thought Process &amp; Persona Inference</div>
  <div class="note">All bullets are inferred from patterns in the supplied material &mdash; not direct statements.</div>
  <div class="grid2">
    <div>
      <div class="sub">Core Priorities &amp; Decision Style</div>
      <ul class="b">
        <li><span class="lbl i">Inferred</span> <strong>Outcome accountability</strong> &mdash; moved from advisory to PE to own results, not just recommend them.</li>
        <li><span class="lbl i">Inferred</span> <strong>Analytical-practitioner hybrid</strong> &mdash; McKinsey-trained structure with real operational accountability. Data-demanding but not theoretical.</li>
        <li><span class="lbl i">Inferred</span> <strong>Contrarian intellectual confidence</strong> &mdash; publicly dissents from received PE wisdom on revenue vs. cost sequencing. Not afraid to push back.</li>
      </ul>
    </div>
    <div>
      <div class="sub">Leadership &amp; Communication Style</div>
      <ul class="b">
        <li><span class="lbl i">Inferred</span> <strong>Operator-coach</strong> &mdash; hands-on enough to challenge portco management teams but works through them, not around them.</li>
        <li><span class="lbl i">Inferred</span> <strong>Direct, insight-first</strong> communication. Will respond better to concise, evidence-backed messaging than relationship-led small talk.</li>
        <li><span class="lbl i">Inferred</span> <strong>System-builder mindset</strong> &mdash; portfolio operations is fundamentally about creating scalable playbooks, not deal-by-deal improvisation.</li>
      </ul>
    </div>
  </div>
</div>

<div class="card">
  <div class="section-title"><span class="section-num">4</span> Key Interests &amp; Conversation Hooks</div>
  <div class="sub">High-Probability Interest Areas</div>
  <div class="tags">
    <span class="tag">100-day planning effectiveness</span><span class="tag">Working capital optimization</span><span class="tag">Revenue acceleration in PE</span><span class="tag">Operational transformation depth</span><span class="tag">Repeatable value creation playbooks</span><span class="tag">Operational alpha vs. peers</span><span class="tag">Portco management capability build</span>
  </div>
  <div class="sub" style="margin-top:14px">Ready-to-Use Conversation Hooks</div>
  <div class="hook"><div class="hook-title">His authored article &mdash; integration framing</div>&ldquo;You wrote that the biggest mistake in post-acquisition integration is treating it as a project, not a transformation &mdash; we see exactly that dynamic in our work. Curious: what&rsquo;s the one organizational lever that most determines whether a portco actually makes that shift?&rdquo;<div class="hook-sub">Opens on his own IP; invites him to expand rather than defend.</div></div>
  <div class="hook"><div class="hook-title">India PE Summit 2024 &mdash; operational alpha</div>&ldquo;At the India PE Summit 2024, you spoke on driving operational alpha in mid-market PE &mdash; would be interested in your take on where most mid-market GPs are still leaving alpha on the table.&rdquo;<div class="hook-sub">References a public moment he was proud enough to participate in; positions Practus as peer-level.</div></div>
  <div class="hook"><div class="hook-title">NWC reshare &mdash; working capital benchmarking</div>&ldquo;Given your focus on NWC improvement in manufacturing portcos, happy to share a couple of patterns we&rsquo;ve been seeing in similar mid-market contexts &mdash; some results have surprised even management teams that thought they&rsquo;d already optimized cash.&rdquo;<div class="hook-sub">Leads with demonstrated relevance; offers value before asking for anything.</div></div>
  <div class="hook"><div class="hook-title">Bain Capital comment &mdash; revenue vs. cost sequencing</div>&ldquo;Your comment on revenue levers being under-indexed in the first 18 months &mdash; what&rsquo;s your current framing for introducing revenue acceleration earlier in the hold cycle?&rdquo;<div class="hook-sub">Validates his contrarian view; creates genuine dialogue rather than a pitch setup.</div></div>
</div>

<div class="card">
  <div class="section-title"><span class="section-num">5</span> Personalization Insights for Outreach</div>
  <div class="grid2">
    <div>
      <div class="sub">What Resonates</div>
      <ul class="b">
        <li>Insight-led, practitioner framing &mdash; lead with an observation, not a credentials pitch</li>
        <li>Case-study with specific portco metrics (NWC %, EBITDA margin, days to impact)</li>
        <li>PE vocabulary: &ldquo;operational alpha,&rdquo; &ldquo;hold period,&rdquo; &ldquo;portco,&rdquo; &ldquo;100-day,&rdquo; &ldquo;EBITDA bridge&rdquo;</li>
        <li>Peer-benchmarking: &ldquo;What we&rsquo;re seeing across comparable mid-market portcos&rdquo;</li>
      </ul>
      <div class="sub" style="margin-top:12px">What to Avoid</div>
      <div class="avoid-row">
        <span class="avoid">Generic consulting tone</span><span class="avoid">Vague offers</span><span class="avoid">Leading with credentials</span><span class="avoid">Overly long outreach</span><span class="avoid">Pure cost-out framing</span><span class="avoid">Slide-deck-heavy pitch</span>
      </div>
    </div>
    <div>
      <div class="sub">Suggested Opening Lines</div>
      <div class="tmpl-flag">Template &mdash; lightly edit before use</div>
      <div class="tmpl"><strong>Variant 1 (anchor on article):</strong><br>&ldquo;Your piece on why 100-day plans fail &mdash; specifically the project-vs-transformation distinction &mdash; captures something we see consistently; would value 20 minutes to compare notes.&rdquo;</div>
      <div class="tmpl"><strong>Variant 2 (NWC angle):</strong><br>&ldquo;Given your focus on NWC improvement in manufacturing portcos, thought it might be worth sharing a couple of patterns we&rsquo;ve been seeing in similar mid-market contexts.&rdquo;</div>
      <div class="tmpl"><strong>Variant 3 (PE Summit):</strong><br>&ldquo;Came across your session at the India PE Summit on operational alpha &mdash; the framing resonated with work we&rsquo;re doing with a handful of mid-market GPs right now.&rdquo;</div>
      <div class="sub" style="margin-top:14px">Meeting Icebreakers</div>
      <div class="tmpl-flag">Template &mdash; lightly edit before use</div>
      <div class="tmpl">&ldquo;Your point at the PE Summit about operational alpha &mdash; is that still the central thesis you&rsquo;re building the portfolio ops function around, or has the mandate evolved since 2024?&rdquo;</div>
      <div class="tmpl">&ldquo;The comment you made about revenue levers being under-indexed &mdash; are you finding it&rsquo;s shifting how you sequence the 100-day plan?&rdquo;</div>
    </div>
  </div>
</div>

<div class="card">
  <div class="section-title"><span class="section-num">6</span> Strategic Relevance Mapping</div>
  <div class="grid2">
    <div class="sc"><h4>Post-Acquisition Integration &amp; Transformation</h4><p>His authored article and PE Summit speaking topic directly address 100-day plans and transformation execution. Visibly central to his mandate.</p><div class="sc-q">&ldquo;How are you currently structuring the operating model design piece in the first 90 days? Where does external execution support add the most value vs. slow things down?&rdquo;</div><div class="sc-q">&ldquo;What&rsquo;s the typical gap between what a 100-day plan promises and what portco management teams can realistically absorb in parallel with running the business?&rdquo;</div></div>
    <div class="sc"><h4>Working Capital &amp; Cash Flow Optimization</h4><p>Explicitly reshared NWC content with endorsement; manufacturing portco context referenced. Working capital release is likely a standard element of his value creation toolkit.</p><div class="sc-q">&ldquo;The 15&ndash;20% NWC improvement thesis in manufacturing &mdash; what&rsquo;s the primary unlock: receivables, payables, or inventory? Where do portco management teams resist hardest?&rdquo;</div><div class="sc-q">&ldquo;Many mid-market portcos we work with have never done a structured cash conversion cycle diagnostic &mdash; is that a gap you encounter when you enter a new deal?&rdquo;</div></div>
    <div class="sc"><h4>Revenue Acceleration &amp; Commercial Performance</h4><p>His public comment directly flags revenue levers as &ldquo;under-indexed vs. cost in the first 18 months&rdquo; &mdash; an active agenda item, not a theoretical interest.</p><div class="sc-q">&ldquo;Are you building a more structured revenue acceleration playbook into the 100-day plan, or is that still largely deal-specific?&rdquo;</div><div class="sc-q">&ldquo;Pricing is often the fastest revenue lever with the highest EBITDA flow-through in mid-market portcos &mdash; is that a consistent entry point in your portfolio?&rdquo;</div></div>
    <div class="sc"><h4>Operational Performance &amp; Execution Discipline</h4><p>&ldquo;Operational alpha&rdquo; framing from PE Summit signals this is a differentiating thesis for Apex. Core of his McKinsey practice background and current PE portfolio ops role.</p><div class="sc-q">&ldquo;How are you thinking about building repeatable operational improvement playbooks across the portfolio vs. customizing deeply for each portco?&rdquo;</div><div class="sc-q">&ldquo;Many PE firms at your AUM tier are investing in proprietary portco diagnostic toolkits &mdash; is that something Apex is building internally?&rdquo;</div></div>
  </div>
</div>

<div class="card">
  <div class="section-title"><span class="section-num">7</span> Risk Flags &amp; Sensitivities</div>
  <div class="rflag"><span class="lbl o">Observed</span> Strong public stance that integration = transformation, not a project &mdash; avoid framing Practus engagements as &ldquo;workstreams&rdquo; or &ldquo;discrete deliverables.&rdquo; Frame as transformation programs with accountability to outcomes.</div>
  <div class="rflag"><span class="lbl o">Observed</span> Views revenue levers as under-indexed vs. cost in early post-acquisition phases &mdash; leading with a pure cost-out narrative may signal misalignment.</div>
  <div class="rflag"><span class="lbl i">Inferred</span> As former McKinsey EM, will recognize and be skeptical of recycled consulting frameworks or generic &ldquo;best practice&rdquo; language.</div>
  <div class="rflag"><span class="lbl i">Inferred</span> Acutely aware of consulting spend ROI in a PE context. Any framing that feels like &ldquo;advisory&rdquo; rather than &ldquo;execution and impact&rdquo; will face internal resistance.</div>
  <div><span class="risk-ok">&#10003; No controversial public stances or reputational risk flags identified in supplied material</span></div>
</div>

<div class="card">
  <div class="section-title"><span class="section-num">8</span> Confidence Level &amp; Data Gaps</div>
  <div class="conf-overall">Overall: Medium</div>
  <div class="note" style="margin-bottom:14px">Supplied material is factually consistent and coherent. However, total primary source data is thin (4 LinkedIn items, 1 speaking reference, 1 career summary). Inferences are pattern-based &mdash; treat as working hypotheses.</div>
  <div class="conf-row"><span class="conf-lbl">Role &amp; current responsibilities</span><div class="bar-track"><div class="bar-fill" style="width:75%;background:#3d7a2e;"></div></div><span class="conf-rating">Medium-High</span></div>
  <div class="conf-row"><span class="conf-lbl">Career history</span><div class="bar-track"><div class="bar-fill" style="width:55%;background:#FDB81A;"></div></div><span class="conf-rating">Medium</span></div>
  <div class="conf-row"><span class="conf-lbl">LinkedIn content &amp; themes</span><div class="bar-track"><div class="bar-fill" style="width:32%;background:#c0392b;"></div></div><span class="conf-rating">Low-Medium</span></div>
  <div class="conf-row"><span class="conf-lbl">Persona / decision style</span><div class="bar-track"><div class="bar-fill" style="width:50%;background:#FDB81A;"></div></div><span class="conf-rating">Medium</span></div>
  <div class="conf-row"><span class="conf-lbl">Personal interests &amp; outside work</span><div class="bar-track"><div class="bar-fill" style="width:10%;background:#c0392b;"></div></div><span class="conf-rating">Low</span></div>
  <div class="sub" style="margin-top:16px">Key Data Gaps</div>
  <ul class="b">
    <li><strong>2019&ndash;2021 career gap</strong> &mdash; roles held between McKinsey exit and Apex join could significantly reframe operational orientation.</li>
    <li><strong>Apex portfolio composition</strong> &mdash; sectors and stage of portfolio companies would allow more targeted relevance mapping.</li>
    <li><strong>Volume and recency of LinkedIn activity</strong> &mdash; a fuller post history would validate or challenge the content themes identified here.</li>
    <li><strong>Interview / podcast / panel transcript</strong> &mdash; would reveal communication style and strategic priorities far more richly than 4 social posts.</li>
    <li><strong>Apex current fund cycle</strong> &mdash; deploy, hold, or exit mode would sharpen which Practus service lines are most timely.</li>
  </ul>
</div>

<div class="opt-hdr"><span>Optional Enhancement &mdash; included (material sufficient for meaningful inference)</span></div>

<div class="card">
  <div class="section-title">Psychological Drivers Summary</div>
  <ul class="b">
    <li><span class="lbl i">Inferred</span> <strong>Outcome accountability</strong> &mdash; deliberate move from McKinsey (advisory) to PE portfolio ops (owns results) signals motivation by being on the hook for actual value creation.</li>
    <li><span class="lbl i">Inferred</span> <strong>Intellectual differentiation</strong> &mdash; public content challenges conventional PE playbooks. Likely wants to build a reputation as a genuinely distinct voice in Indian mid-market PE operations.</li>
    <li><span class="lbl i">Inferred</span> <strong>Practitioner credibility over prestige</strong> &mdash; IIT/IIM/McKinsey pedigree combined with execution focus suggests he measures himself against impact metrics, not credentials alone.</li>
    <li><span class="lbl i">Inferred</span> <strong>System-building orientation</strong> &mdash; portfolio operations is fundamentally about creating scalable playbooks, not deal-by-deal improvisation.</li>
  </ul>
</div>

<div class="card">
  <div class="section-title">Best Engagement Strategy</div>
  <ul class="b">
    <li><strong>Approach as:</strong> Peer practitioner and execution partner &mdash; not as vendor or advisor. The value proposition must be bandwidth, speed, and execution depth.</li>
    <li><strong>Recommended style:</strong> Insight-led and concise &mdash; lead with a sharp observation or benchmark, then offer to go deeper. Avoid dense credentials sections upfront.</li>
    <li><strong>Pitch depth:</strong> Executive summary first, always. Have a detailed case example ready for one level deeper if he engages &mdash; but do not lead with it.</li>
    <li><strong>Optimal entry point:</strong> A specific portco challenge (working capital, 100-day execution, revenue acceleration) rather than a firm-level relationship pitch.</li>
    <li><strong>Timing signal:</strong> A new Apex portfolio acquisition announcement is the single highest-value outreach trigger.</li>
  </ul>
</div>

<p class="page-footer">Practus Research Intelligence &nbsp;&middot;&nbsp; Sample output &mdash; fictional individual &nbsp;&middot;&nbsp; All inferences explicitly labelled &nbsp;&middot;&nbsp; Sourced only from material supplied for analysis</p>
</div></body></html>`;
}

function fmt(s) {
  return s
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\bObserved:/g, '<span class="lbl lbl-o">Observed</span>')
    .replace(/\bInferred:/g, '<span class="lbl lbl-i">Inferred</span>')
    .replace(/\bGap:/g, '<span class="lbl lbl-g">Gap</span>');
}

function mdToHtml(text) {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const lines = escaped.split("\n");
  const parts = [];
  let inList = false;

  for (const raw of lines) {
    const line = raw.trimEnd();

    const secMatch = line.match(/^SECTION (\d+):\s*(.+)$/);
    if (secMatch) {
      if (inList) { parts.push("</ul>"); inList = false; }
      const n = String(secMatch[1]).padStart(2, "0");
      parts.push(`<h2 class="sec-hdr"><span class="sec-n">${n}</span>${secMatch[2]}</h2>`);
      continue;
    }

    if (/^## /.test(line)) {
      if (inList) { parts.push("</ul>"); inList = false; }
      parts.push(`<h2 class="sec-hdr">${fmt(line.slice(3))}</h2>`);
      continue;
    }
    if (/^### /.test(line)) {
      if (inList) { parts.push("</ul>"); inList = false; }
      parts.push(`<h3>${fmt(line.slice(4))}</h3>`);
      continue;
    }
    if (/^#### /.test(line)) {
      if (inList) { parts.push("</ul>"); inList = false; }
      parts.push(`<h4>${fmt(line.slice(5))}</h4>`);
      continue;
    }

    if (/^---+$/.test(line)) {
      if (inList) { parts.push("</ul>"); inList = false; }
      parts.push("<hr>");
      continue;
    }

    const liMatch = line.match(/^[-*•] (.+)$/) || line.match(/^\d+\. (.+)$/);
    if (liMatch) {
      if (!inList) { parts.push("<ul>"); inList = true; }
      parts.push(`<li>${fmt(liMatch[1])}</li>`);
      continue;
    }

    if (!line.trim()) {
      if (inList) { parts.push("</ul>"); inList = false; }
      continue;
    }

    if (inList) { parts.push("</ul>"); inList = false; }
    parts.push(`<p>${fmt(line)}</p>`);
  }

  if (inList) parts.push("</ul>");
  return parts.join("\n");
}

function renderTextReport(name, org, text) {
  const body = mdToHtml(text);
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${name} — Practus</title>
<style>
*,*::before,*::after { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
  background: #F4F4F5;
  color: #18181B;
  font-size: 14px;
  line-height: 1.7;
  -webkit-font-smoothing: antialiased;
}
.site-header {
  background: #fff;
  border-bottom: 1px solid #E4E4E7;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  position: sticky;
  top: 0;
  z-index: 20;
}
.header-left { display: flex; align-items: center; gap: 0; }
.logo-sep { width: 1px; height: 16px; background: #D4D4D8; margin: 0 14px; }
.back-link { font-size: 12.5px; color: #71717A; text-decoration: none; }
.back-link:hover { color: #18181B; }
.btn-print {
  height: 32px;
  padding: 0 14px;
  background: #fff;
  border: 1px solid #E4E4E7;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  font-family: inherit;
  color: #3F3F46;
  cursor: pointer;
  transition: border-color 0.1s;
}
.btn-print:hover { border-color: #A1A1AA; }
.page { max-width: 680px; margin: 0 auto; padding: 2.5rem 1.5rem 5rem; }
.subject-card {
  background: #fff;
  border: 1px solid #E4E4E7;
  border-radius: 8px;
  padding: 1.5rem 1.75rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}
.initials {
  width: 44px; height: 44px;
  background: #18181B;
  border-radius: 6px;
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.03em;
  flex-shrink: 0;
}
.subject-meta h1 {
  font-size: 20px;
  font-weight: 600;
  letter-spacing: -0.025em;
  color: #18181B;
  margin-bottom: 2px;
}
.org-line { font-size: 13px; color: #71717A; }
.report-card {
  background: #fff;
  border: 1px solid #E4E4E7;
  border-radius: 8px;
  padding: 1.75rem 2rem;
}
.report .sec-hdr {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #A1A1AA;
  margin: 2.25rem 0 0.9rem;
  padding-bottom: 8px;
  border-bottom: 1px solid #F4F4F5;
  display: flex;
  align-items: center;
  gap: 8px;
}
.report .sec-hdr:first-child { margin-top: 0; }
.sec-n {
  font-size: 9.5px;
  font-weight: 700;
  color: #18181B;
  font-variant-numeric: tabular-nums;
  background: #F4F4F5;
  padding: 1px 6px;
  border-radius: 3px;
}
.report h3 {
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #52525B;
  margin: 1.5rem 0 0.5rem;
}
.report h4 {
  font-size: 14px;
  font-weight: 600;
  color: #18181B;
  margin: 1rem 0 0.3rem;
}
.report p { margin-bottom: 0.6rem; color: #27272A; }
.report ul { list-style: none; margin: 0.4rem 0 0.9rem; padding: 0; }
.report li {
  position: relative;
  padding-left: 16px;
  margin-bottom: 6px;
  color: #27272A;
}
.report li::before {
  content: "";
  position: absolute;
  left: 0; top: 9px;
  width: 5px; height: 1.5px;
  background: #D4D4D8;
}
.report hr { border: none; border-top: 1px solid #F4F4F5; margin: 1.5rem 0; }
.report strong { font-weight: 600; color: #18181B; }
.report em { font-style: italic; color: #52525B; }
.lbl {
  display: inline-block;
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 2px 6px;
  border-radius: 3px;
  margin-right: 4px;
  vertical-align: middle;
  position: relative;
  top: -1px;
}
.lbl-o { background: #F0FDF4; color: #166534; }
.lbl-i { background: #EFF6FF; color: #1D4ED8; }
.lbl-g { background: #FFFBEB; color: #92400E; }
.page-foot {
  margin-top: 1.25rem;
  font-size: 11px;
  color: #A1A1AA;
  text-align: center;
}
@media print {
  body { background: #fff; }
  .site-header { display: none; }
  .subject-card, .report-card { border: none; box-shadow: none; }
  .page { padding-top: 1rem; }
}
</style>
</head>
<body>
<header class="site-header">
  <div class="header-left">
    <svg width="110" height="28" viewBox="0 0 110 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text x="0" y="21" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif" font-size="22" font-weight="600" fill="#2394A4" letter-spacing="-0.5">practus</text>
      <rect x="88" y="1" width="6" height="6" rx="1.5" fill="#2394A4"/>
      <rect x="96" y="1" width="6" height="6" rx="1.5" fill="#2394A4"/>
      <rect x="88" y="9" width="6" height="6" rx="1.5" fill="#2394A4"/>
      <rect x="96" y="9" width="6" height="6" rx="1.5" fill="#2394A4"/>
      <rect x="88" y="17" width="6" height="6" rx="1.5" fill="#2394A4"/>
      <rect x="96" y="17" width="6" height="6" rx="1.5" fill="#2394A4"/>
      <circle cx="107" cy="4" r="3" fill="#F5A823"/>
      <circle cx="99" cy="12" r="3" fill="#F5A823"/>
      <circle cx="91" cy="20" r="3" fill="#F5A823"/>
    </svg>
    <span class="logo-sep"></span>
    <a class="back-link" href="/">&larr; New persona</a>
  </div>
  <button class="btn-print" onclick="window.print()">Print / PDF</button>
</header>
<div class="page">
  <div class="subject-card">
    <div class="initials">${initials}</div>
    <div class="subject-meta">
      <h1>${name}</h1>
      <div class="org-line">${org}</div>
    </div>
  </div>
  <div class="report-card">
    <div class="report">${body}</div>
  </div>
  <p class="page-foot">Practus Research Intelligence &middot; Sourced only from material supplied for this analysis</p>
</div>
</body>
</html>`;
}

app.listen(PORT, () => {
  console.log(`Practus Persona Agent listening on port ${PORT}`);
});
