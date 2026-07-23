// Turns the structured JSON returned by Claude into the Practus-branded
// persona 1-pager HTML (same visual design system as the original template).

function esc(str) {
  if (str === undefined || str === null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function badgeClass(i) {
  const classes = ["badge-teal", "badge-gold", "badge-gray", "badge-gray"];
  return classes[i % classes.length];
}

function labelSpan(label) {
  const map = {
    observed: '<span class="observed">Observed:</span>',
    inferred: '<span class="inferred">Inferred:</span>',
    gap: '<span class="gap">Gap:</span>'
  };
  return map[label] || map.gap;
}

function bulletsHtml(bullets) {
  return (bullets || [])
    .map((b) => `<li>${labelSpan(b.label)} ${esc(b.text)}</li>`)
    .join("\n");
}

function barColor(pct) {
  if (pct >= 75) return "#4c8c3c";
  if (pct >= 40) return "#FDB81A";
  return "#c0392b";
}

const BASE_CSS = `
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Lato', Arial, sans-serif; background: #F4F6F8; color: #1a1a1a; }
.page { max-width: 900px; margin: 0 auto; padding: 1.75rem 1.5rem 2.5rem; }
.topbar { max-width: 900px; margin: 0 auto; padding: 12px 1.5rem 0; display:flex; justify-content:space-between; align-items:center; }
.topbar a { color:#228899; font-size:12.5px; text-decoration:none; font-weight:700; }
.topbar button { background:#123250; color:#fff; border:none; border-radius:6px; padding:6px 12px; font-size:12px; font-weight:700; cursor:pointer; }
#emailToast { display:none; position:fixed; bottom:22px; right:22px; background:#123250; color:#fff; padding:11px 18px; border-radius:8px; font-size:12.5px; font-weight:600; z-index:999; box-shadow:0 4px 20px rgba(0,0,0,0.18); }
.header { background: linear-gradient(135deg, #123250, #1a4570); border-radius: 14px; padding: 1.5rem 2rem; margin-bottom: 1.25rem; display: flex; align-items: center; gap: 1.5rem; }
.avatar { width: 60px; height: 60px; border-radius: 50%; background: #FDB81A; display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 700; color: #123250; flex-shrink: 0; font-family: 'Merriweather', Georgia, serif; }
.header-info h1 { font-size: 21px; font-weight: 700; color: #fff; margin-bottom: 4px; font-family: 'Merriweather', Georgia, serif; }
.header-info p { font-size: 12.5px; color: #E0E0E0; }
.badges { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 8px; }
.badge { font-size: 11px; padding: 3px 9px; border-radius: 20px; font-weight: 600; }
.badge-teal { background: #228899; color: #fff; }
.badge-gold { background: #FDB81A; color: #5a3c00; }
.badge-gray { background: rgba(255,255,255,0.15); color: #E0E0E0; border: 0.5px solid rgba(255,255,255,0.25); }
.verify-banner { background: #EAF3F1; border: 1px solid #9fc9c1; border-radius: 12px; padding: 12px 18px; margin-bottom: 1.25rem; }
.verify-banner h3 { font-size: 12.5px; color: #1b5e57; font-family: 'Merriweather', Georgia, serif; margin-bottom: 5px; }
.verify-banner p { font-size: 11.5px; color: #2d4a45; line-height: 1.5; }
.card-full { background: #fff; border: 0.5px solid #E2E6EA; border-radius: 12px; padding: 1.1rem 1.4rem; margin-bottom: 1rem; }
.grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 0; }
.section-title { font-size: 14px; font-weight: 700; color: #123250; font-family: 'Merriweather', Georgia, serif; margin-bottom: 10px; border-bottom: 2px solid #FDB81A; padding-bottom: 6px; }
.card-header { font-size: 12px; font-weight: 700; color: #228899; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.3px; }
ul { padding-left: 18px; }
li { font-size: 12.5px; line-height: 1.55; margin-bottom: 6px; color: #333; }
.observed { font-size: 10px; font-weight: 700; color: #4c8c3c; margin-right: 4px; text-transform: uppercase; }
.inferred { font-size: 10px; font-weight: 700; color: #228899; margin-right: 4px; text-transform: uppercase; }
.gap { font-size: 10px; font-weight: 700; color: #b06a00; margin-right: 4px; text-transform: uppercase; }
.divider { border: none; border-top: 0.5px solid #E2E6EA; margin: 12px 0; }
.timeline { border-left: 2px solid #228899; margin: 8px 0 4px 6px; padding-left: 16px; }
.timeline-item { position: relative; margin-bottom: 12px; }
.timeline-item::before { content: ''; position: absolute; left: -21px; top: 4px; width: 8px; height: 8px; border-radius: 50%; background: #FDB81A; border: 2px solid #228899; }
.timeline-item .tl-date { font-size: 10.5px; color: #228899; font-weight: 700; margin-bottom: 1px; }
.timeline-item .tl-role { font-size: 12.5px; font-weight: 700; color: #123250; }
.timeline-item .tl-firm { font-size: 11.5px; color: #666; }
.hook-box { background: #F4F9F8; border-left: 3px solid #228899; border-radius: 6px; padding: 8px 12px; margin: 7px 0; font-size: 12.5px; line-height: 1.5; color: #1a1a1a; }
.template-label { font-size: 10px; font-weight: 700; color: #228899; margin-bottom: 3px; text-transform: uppercase; }
.template-box { background: #F8F9FA; border: 0.5px solid #E2E6EA; border-radius: 8px; padding: 9px 12px; margin: 6px 0; font-size: 12.5px; color: #1a1a1a; line-height: 1.55; }
.avoid-tag { display: inline-block; background: #FCEBEB; color: #793a3a; font-size: 11px; padding: 3px 9px; border-radius: 20px; font-weight: 600; margin: 2px 4px 2px 0; }
.theme-tag { display: inline-block; background: #EAF3F1; color: #1b5e57; font-size: 11px; padding: 3px 9px; border-radius: 20px; font-weight: 600; margin: 2px 4px 2px 0; }
.strategic-card { background: #F8FAFB; border: 0.5px solid #E2E6EA; border-radius: 10px; padding: 12px 14px; }
.strategic-card h4 { font-size: 12.5px; color: #123250; font-family: 'Merriweather', Georgia, serif; margin-bottom: 6px; }
.strategic-card p { font-size: 12px; color: #444; margin-bottom: 6px; line-height: 1.5; }
.strategic-card .q { font-size: 11.5px; color: #228899; font-style: italic; }
.risk-ok { font-size: 12px; color: #4c8c3c; font-weight: 600; padding: 8px 12px; background: #F0F7EE; border-radius: 8px; display: inline-block; }
.confidence-row { display: flex; align-items: center; gap: 10px; margin: 7px 0; }
.confidence-row span.label { font-size: 12px; color: #444; min-width: 130px; }
.bar-track { flex: 1; height: 7px; background: #EEF1F3; border-radius: 4px; overflow: hidden; }
.bar-fill { height: 100%; border-radius: 4px; }
.confidence-row span.rating { font-size: 11px; color: #666; min-width: 60px; text-align: right; }
.footer-note { font-size: 10px; color: #888; text-align: center; padding-top: 10px; }
strong { font-weight: 700; }
@media print { .topbar { display:none; } body { background:#fff; } }
`;

function renderReport(data) {
  const p = data.person || {};
  const badgesHtml = (p.badges || [])
    .map((b, i) => `<span class="badge ${badgeClass(i)}">${esc(b)}</span>`)
    .join("\n");

  const timelineHtml = (data.section1.timeline || [])
    .map((t) => {
      return '<div class="timeline-item">' +
        '<div class="tl-date">' + esc(t.date) + '</div>' +
        '<div class="tl-role">' + esc(t.role) + '</div>' +
        '<div class="tl-firm">' + esc(t.firm) + '</div>' +
        '</div>';
    })
    .join("\n");

  const themeTagsHtml = (data.section2.contentThemes || [])
    .map((t) => `<span class="theme-tag">${esc(t)}</span>`)
    .join(" ");

  const interestAreasHtml = (data.section4.interestAreas || [])
    .map((a) => `<span class="theme-tag">${esc(a)}</span>`)
    .join(" ");

  const hooksHtml = (data.section4.hooks || [])
    .map((h) => '<div class="hook-box"><strong>' + esc(h.title) + ':</strong> "' + esc(h.text) + '"</div>')
    .join("\n");

  const resonatesHtml = (data.section5.resonates || [])
    .map((r) => `<li>${esc(r)}</li>`)
    .join("\n");

  const avoidHtml = (data.section5.avoid || [])
    .map((a) => `<span class="avoid-tag">${esc(a)}</span>`)
    .join(" ");

  const openingLinesHtml = (data.section5.openingLines || [])
    .map((l) => `<div class="template-box">${esc(l)}</div>`)
    .join("\n");

  const icebreakersHtml = (data.section5.icebreakers || [])
    .map((l) => `<div class="template-box">${esc(l)}</div>`)
    .join("\n");

  const strategicCardsHtml = (data.section6.cards || [])
    .map((c) => {
      const questionsHtml = (c.questions || [])
        .map((q) => '<p class="q">"' + esc(q) + '"</p>')
        .join("\n");
      return '<div class="strategic-card"><h4>' + esc(c.title) + '</h4><p>' + esc(c.body) + '</p>' + questionsHtml + '</div>';
    })
    .join("\n");

  const riskFlagsHtml = data.section7.noFlagsFound
    ? '<p style="margin-top:10px;"><span class="risk-ok">' +
      esc((data.section7.flags && data.section7.flags[0]) || "No major public risk flags identified based on available data.") +
      "</span></p>"
    : "<ul>" + (data.section7.flags || []).map((f) => `<li>${esc(f)}</li>`).join("\n") + "</ul>";

  const barsHtml = (data.section8.bars || [])
    .map((b) => {
      const pct = Math.max(0, Math.min(100, b.pct));
      return '<div class="confidence-row"><span class="label">' + esc(b.label) +
        '</span><div class="bar-track"><div class="bar-fill" style="width:' + pct + '%;background:' + barColor(pct) + ';"></div></div>' +
        '<span class="rating">' + esc(b.rating) + '</span></div>';
    })
    .join("\n");

  const section8NotesHtml = (data.section8.notes || [])
    .map((n) => `<li>${esc(n)}</li>`)
    .join("\n");

  const optional = data.optionalEnhancement || {};
  const optionalHtml = optional.include
    ? '<div class="card-full"><div class="section-title">Psychological Drivers Summary</div><ul>' +
      (optional.psychDrivers || []).map((x) => `<li>${esc(x)}</li>`).join("\n") +
      '</ul><hr class="divider"><div class="section-title">Best Engagement Strategy</div><ul>' +
      (optional.engagementStrategy || []).map((x) => `<li>${esc(x)}</li>`).join("\n") +
      "</ul></div>"
    : "";

  const preparedDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long"
  });

  const parts = [];
  parts.push('<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">');
  parts.push('<title>' + esc(p.name) + ' — Practus Persona 1-Pager</title>');
  parts.push('<style>' + BASE_CSS + '</style></head><body>');
  parts.push('<div class="topbar"><a href="/">&larr; New persona</a><button onclick="window.print()">Print / Save as PDF</button></div>');
  parts.push('<div class="page">');

  parts.push('<div class="header"><div class="avatar">' + esc(p.initials) + '</div><div class="header-info">');
  parts.push('<h1>' + esc(p.name) + ' — ' + esc(p.roleTitle) + '</h1>');
  parts.push('<p>' + esc(p.subtitle) + '</p>');
  parts.push('<div class="badges">' + badgesHtml + '</div></div></div>');

  parts.push('<div class="verify-banner"><h3>&#10003; Source Validation Note</h3><p>' + esc(data.sourceValidationNote) + '</p></div>');

  parts.push('<div class="card-full"><div class="section-title">1&nbsp; Professional Snapshot</div><div class="grid2">');
  parts.push('<div><ul>' + bulletsHtml(data.section1.factsLeft) + '</ul></div>');
  parts.push('<div><ul>' + bulletsHtml(data.section1.factsRight) + '</ul></div>');
  parts.push('</div><hr class="divider"><div class="card-header">Career Timeline (as documented)</div>');
  parts.push('<div class="timeline">' + timelineHtml + '</div></div>');

  parts.push('<div class="card-full"><div class="section-title">2&nbsp; Content &amp; Engagement Analysis (LinkedIn-Centric)</div>');
  parts.push('<p style="font-size:11px;color:#888;margin-bottom:8px;font-style:italic;">' + esc(data.section2.note) + '</p>');
  parts.push('<div class="grid2"><div><div class="card-header">Content Themes</div>' + themeTagsHtml);
  parts.push('<div class="card-header" style="margin-top:10px">Content Type Preference</div><ul>' + bulletsHtml(data.section2.contentTypeBullets) + '</ul></div>');
  parts.push('<div><div class="card-header">Engagement Behavior</div><ul>' + bulletsHtml(data.section2.engagementBullets) + '</ul></div></div></div>');

  parts.push('<div class="card-full"><div class="section-title">3&nbsp; Thought Process &amp; Persona Inference</div>');
  parts.push('<p style="font-size:11px;color:#888;margin-bottom:8px;font-style:italic;">' + esc(data.section3.note) + '</p>');
  parts.push('<div class="grid2"><ul>' + bulletsHtml(data.section3.left) + '</ul><ul>' + bulletsHtml(data.section3.right) + '</ul></div></div>');

  parts.push('<div class="card-full"><div class="section-title">4&nbsp; Key Interests &amp; Conversation Hooks</div>');
  parts.push('<div class="card-header">Key Interest Areas</div><div style="margin-bottom:10px">' + interestAreasHtml + '</div>');
  parts.push('<div class="card-header">Ready-to-Use Hooks</div>' + hooksHtml + '</div>');

  parts.push('<div class="card-full"><div class="section-title">5&nbsp; Personalization Insights for Outreach</div><div class="grid2">');
  parts.push('<div><div class="card-header">What Resonates</div><ul>' + resonatesHtml + '</ul>');
  parts.push('<div style="margin-top:8px"><div class="card-header">What to Avoid</div><div>' + avoidHtml + '</div></div></div>');
  parts.push('<div><div class="card-header">Suggested Opening Lines</div><div class="template-label">[TEMPLATE — lightly edit before use]</div>' + openingLinesHtml);
  parts.push('<div class="card-header" style="margin-top:10px">Suggested Meeting Icebreakers</div>' + icebreakersHtml + '</div></div></div>');

  parts.push('<div class="card-full"><div class="section-title">6&nbsp; Strategic Relevance Mapping (Practus / Consulting Context)</div>');
  parts.push('<div class="grid2">' + strategicCardsHtml + '</div></div>');

  parts.push('<div class="card-full"><div class="section-title">7&nbsp; Risk Flags &amp; Sensitivities</div>' + riskFlagsHtml + '</div>');

  parts.push('<div class="card-full"><div class="section-title">8&nbsp; Confidence Level &amp; Data Gaps</div>');
  parts.push('<div class="confidence-row"><span class="label" style="font-weight:700;color:#123250;">Overall: ' + esc(data.section8.overall) + '</span></div>');
  parts.push(barsHtml + '<ul style="margin-top:10px">' + section8NotesHtml + '</ul></div>');

  parts.push(optionalHtml);

  parts.push('<p class="footer-note">Prepared by Practus Research Intelligence &nbsp;|&nbsp; All inferences labelled. Sourced only from material supplied for this analysis. &nbsp;|&nbsp; ' + preparedDate + '</p>');
  parts.push('</div>');

  // Auto-email on load
  const escapedJson = JSON.stringify(data)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;');
  parts.push('<div id="emailToast"></div>');
  parts.push('<input type="hidden" id="reportData" value="' + escapedJson + '">');
  parts.push('<input type="hidden" id="personNameVal" value="' + esc(p.name) + '">');
  parts.push('<script>');
  parts.push('document.addEventListener("DOMContentLoaded", function() {');
  parts.push('  var data = document.getElementById("reportData").value;');
  parts.push('  var name = document.getElementById("personNameVal").value;');
  parts.push('  fetch("/send-email", {');
  parts.push('    method: "POST",');
  parts.push('    headers: { "Content-Type": "application/x-www-form-urlencoded" },');
  parts.push('    body: "reportDataJson=" + encodeURIComponent(data) + "&personName=" + encodeURIComponent(name)');
  parts.push('  }).then(function(r) { return r.json(); }).then(function(r) {');
  parts.push('    if (r.ok) {');
  parts.push('      var t = document.getElementById("emailToast");');
  parts.push('      t.textContent = "Sent to Yashwin";');
  parts.push('      t.style.display = "block";');
  parts.push('      setTimeout(function() { t.style.display = "none"; }, 4000);');
  parts.push('    }');
  parts.push('  }).catch(function() {});');
  parts.push('});');
  parts.push('<\/script>');
  parts.push('</body></html>');

  return parts.join("\n");
}

module.exports = { renderReport };
