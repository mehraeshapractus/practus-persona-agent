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
.logo-mark svg { display: block; }
.logo-sep {
  width: 1px;
  height: 16px;
  background: #D4D4D8;
  margin: 0 12px;
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
/* ── Loading overlay ── */
#loadingOverlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 9999;
  align-items: center;
  justify-content: center;
}
.loading-card {
  background: #fff;
  border-radius: 14px;
  padding: 2.5rem 3rem;
  text-align: center;
  box-shadow: 0 24px 64px rgba(0,0,0,0.22);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  min-width: 260px;
}
.spinner {
  width: 44px;
  height: 44px;
  border: 3px solid #E4E4E7;
  border-top-color: #18181B;
  border-radius: 50%;
  animation: spin 0.75s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.loading-title {
  font-size: 15px;
  font-weight: 600;
  color: #18181B;
  letter-spacing: -0.01em;
}
.loading-sub {
  font-size: 12px;
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
    <svg width="110" height="28" viewBox="0 0 110 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- practus wordmark -->
      <text x="0" y="21" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif" font-size="22" font-weight="600" fill="#2394A4" letter-spacing="-0.5">practus</text>
      <!-- 3x3 grid icon -->
      <!-- teal squares -->
      <rect x="88" y="1" width="6" height="6" rx="1.5" fill="#2394A4"/>
      <rect x="96" y="1" width="6" height="6" rx="1.5" fill="#2394A4"/>
      <rect x="88" y="9" width="6" height="6" rx="1.5" fill="#2394A4"/>
      <rect x="96" y="9" width="6" height="6" rx="1.5" fill="#2394A4"/>
      <rect x="88" y="17" width="6" height="6" rx="1.5" fill="#2394A4"/>
      <rect x="96" y="17" width="6" height="6" rx="1.5" fill="#2394A4"/>
      <!-- gold circles (diagonal: top-right, center, bottom-left) -->
      <circle cx="107" cy="4" r="3" fill="#F5A823"/>
      <circle cx="99" cy="12" r="3" fill="#F5A823"/>
      <circle cx="91" cy="20" r="3" fill="#F5A823"/>
    </svg>
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

  <form id="personaForm" method="POST" action="/generate">
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
      </div>

      <div class="form-footer">
        <button type="submit" id="submitBtn">Generate persona brief</button>
      </div>

    </div>
  </form>

</div>

<div id="loadingOverlay">
  <div class="loading-card">
    <div class="spinner"></div>
    <p class="loading-title">Generating persona brief&hellip;</p>
    <p class="loading-sub">Usually 20&ndash;40 seconds</p>
  </div>
</div>
<script>
document.getElementById("personaForm").addEventListener("submit", function() {
  document.getElementById("loadingOverlay").style.display = "flex";
  document.getElementById("submitBtn").disabled = true;
});
</script>
</body>
</html>`;
}

module.exports = { renderForm };
