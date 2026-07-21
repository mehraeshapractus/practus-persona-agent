function renderForm(opts) {
  const error = opts && opts.error
    ? `<div class="error-box">${opts.error}</div>`
    : "";
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Practus · Persona Agent</title>
<style>
*,*::before,*::after { box-sizing: border-box; margin: 0; padding: 0; }
html,body { height: 100%; }
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
  background: #F4F4F5;
  color: #18181B;
  -webkit-font-smoothing: antialiased;
}

/* ── Header ── */
.site-header {
  background: #fff;
  border-bottom: 1px solid #E4E4E7;
  height: 52px;
  display: flex;
  align-items: center;
  padding: 0 2rem;
  position: sticky;
  top: 0;
  z-index: 20;
}
.logo {
  display: flex;
  align-items: center;
  gap: 8px;
}
.logo-mark {
  width: 22px;
  height: 22px;
  background: #18181B;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.logo-mark svg { display: block; }
.logo-name {
  font-size: 13.5px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: #18181B;
}
.logo-sep {
  width: 1px;
  height: 14px;
  background: #D4D4D8;
  margin: 0 10px;
}
.logo-sub {
  font-size: 11.5px;
  color: #A1A1AA;
  letter-spacing: 0.01em;
}

/* ── Page ── */
.page {
  max-width: 600px;
  margin: 0 auto;
  padding: 3rem 1.5rem 5rem;
}

/* ── Page heading ── */
.page-heading {
  margin-bottom: 2rem;
}
.page-heading h1 {
  font-size: 22px;
  font-weight: 600;
  letter-spacing: -0.025em;
  color: #18181B;
  margin-bottom: 4px;
}
.page-heading p {
  font-size: 13px;
  color: #71717A;
  line-height: 1.5;
}

/* ── Form card ── */
.form-card {
  background: #fff;
  border: 1px solid #E4E4E7;
  border-radius: 8px;
  overflow: hidden;
}
.form-section {
  padding: 1.5rem 1.75rem;
}
.form-section + .form-section {
  border-top: 1px solid #F4F4F5;
}
.form-section-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #A1A1AA;
  margin-bottom: 1.1rem;
}
.row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
.field { margin-bottom: 1rem; }
.field:last-child { margin-bottom: 0; }
label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: #3F3F46;
  margin-bottom: 5px;
}
.req { color: #71717A; font-weight: 400; margin-left: 2px; }
input[type="text"] {
  width: 100%;
  height: 36px;
  background: #FAFAFA;
  border: 1px solid #E4E4E7;
  border-radius: 5px;
  padding: 0 11px;
  font-size: 13.5px;
  font-family: inherit;
  color: #18181B;
  outline: none;
  transition: border-color 0.1s, background 0.1s;
}
input[type="text"]:focus {
  background: #fff;
  border-color: #18181B;
}
input[type="text"]::placeholder { color: #A1A1AA; }
textarea {
  width: 100%;
  min-height: 220px;
  background: #FAFAFA;
  border: 1px solid #E4E4E7;
  border-radius: 5px;
  padding: 10px 11px;
  font-size: 13.5px;
  font-family: inherit;
  color: #18181B;
  outline: none;
  resize: vertical;
  line-height: 1.6;
  transition: border-color 0.1s, background 0.1s;
}
textarea:focus {
  background: #fff;
  border-color: #18181B;
}
textarea::placeholder { color: #A1A1AA; }
.hint {
  font-size: 11px;
  color: #A1A1AA;
  margin-top: 4px;
  line-height: 1.5;
}

/* ── Error ── */
.error-box {
  background: #FEF2F2;
  border-left: 3px solid #EF4444;
  padding: 10px 14px;
  font-size: 12.5px;
  color: #7F1D1D;
  margin-bottom: 1.25rem;
  border-radius: 0 4px 4px 0;
  line-height: 1.5;
}

/* ── Submit section ── */
.form-footer {
  padding: 1.25rem 1.75rem;
  background: #FAFAFA;
  border-top: 1px solid #E4E4E7;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
button[type="submit"] {
  width: 100%;
  height: 40px;
  background: #18181B;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  letter-spacing: -0.01em;
  transition: background 0.1s;
}
button[type="submit"]:hover { background: #09090B; }
button[type="submit"]:disabled { opacity: 0.45; cursor: not-allowed; }
#loading {
  display: none;
  text-align: center;
  font-size: 11.5px;
  color: #A1A1AA;
}

/* ── Page footer ── */
.page-foot {
  margin-top: 1.5rem;
  font-size: 11px;
  color: #A1A1AA;
  text-align: center;
}

@media (max-width: 520px) {
  .row-2 { grid-template-columns: 1fr; }
}
</style>
</head>
<body>

<header class="site-header">
  <div class="logo">
    <div class="logo-mark">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <rect x="1" y="1" width="4" height="4" fill="white"/>
        <rect x="7" y="1" width="4" height="4" fill="white" opacity="0.5"/>
        <rect x="1" y="7" width="4" height="4" fill="white" opacity="0.5"/>
        <rect x="7" y="7" width="4" height="4" fill="white"/>
      </svg>
    </div>
    <span class="logo-name">Practus</span>
    <span class="logo-sep"></span>
    <span class="logo-sub">Research Intelligence</span>
  </div>
</header>

<div class="page">
  <div class="page-heading">
    <h1>Persona Brief</h1>
    <p>Paste what you have — LinkedIn bio, posts, press, transcripts. The agent builds from that.</p>
  </div>

  ${error}

  <form method="POST" action="/generate"
    onsubmit="document.getElementById('loading').style.display='block';document.getElementById('submitBtn').disabled=true;">
    <div class="form-card">

      <div class="form-section">
        <div class="form-section-label">Target</div>
        <div class="row-2">
          <div class="field">
            <label>Full Name <span class="req">*</span></label>
            <input type="text" name="fullName" required placeholder="Tanmay Kejriwal">
          </div>
          <div class="field">
            <label>Organization <span class="req">*</span></label>
            <input type="text" name="organization" required placeholder="Sanctum Wealth">
          </div>
        </div>
        <div class="field">
          <label>LinkedIn URL</label>
          <input type="text" name="linkedinUrl" placeholder="https://linkedin.com/in/...">
        </div>
        <div class="field">
          <label>Additional Links</label>
          <input type="text" name="additionalLinks" placeholder="Press articles, conference pages, company site">
        </div>
      </div>

      <div class="form-section">
        <div class="form-section-label">Source Material</div>
        <div class="field">
          <textarea name="pastedMaterial" required
            placeholder="Paste LinkedIn bio, recent posts, press quotes, interview excerpts, company page text. More is better — thin input is fine too, gaps will be flagged honestly."></textarea>
          <p class="hint">Everything the agent knows comes from what you paste here.</p>
        </div>
      </div>

      <div class="form-footer">
        <button type="submit" id="submitBtn">Generate persona brief</button>
        <p id="loading">Analyzing &mdash; usually 20&ndash;40 seconds&hellip;</p>
      </div>

    </div>
  </form>

</div>

</body>
</html>`;
}

module.exports = { renderForm };
