# Practus Persona Agent

A small web app that generates Practus-branded executive persona 1-pagers
(the same 8-section format: professional snapshot, content/engagement
analysis, persona inference, conversation hooks, outreach personalization,
strategic relevance mapping, risk flags, confidence/data gaps).

You paste in whatever public research material you have on a target
(LinkedIn bio/posts, articles, press mentions, company leadership page
copy). The app sends that — and only that — to Claude with a strict
no-fabrication system prompt, gets back structured JSON, and renders it
into the branded report page. It does not scrape LinkedIn or the web live.

## Run locally

```
npm install
cp .env.example .env   # then paste in your real ANTHROPIC_API_KEY
npm start
```

Visit http://localhost:3000

## Deploy to Railway

1. Install the Railway CLI if you don't have it: `npm install -g @railway/cli`
2. From this folder: `railway login`
3. `railway init` (creates a new Railway project) — or `railway link` if you
   already created one in the dashboard.
4. Set your secrets:
   ```
   railway variables set ANTHROPIC_API_KEY=sk-ant-...
   ```
   (Optionally: `railway variables set CLAUDE_MODEL=claude-sonnet-5`)
5. Deploy: `railway up`
6. Railway will give you a public URL once the build finishes (or run
   `railway domain` to generate one).

### Or via GitHub + Railway dashboard
1. Push this folder to a new GitHub repo.
2. In Railway: New Project → Deploy from GitHub repo → select it.
3. In the service's Variables tab, add `ANTHROPIC_API_KEY` (and optionally
   `CLAUDE_MODEL`).
4. Railway auto-detects Node via Nixpacks and runs `npm start`. No other
   config needed — `PORT` is injected automatically and the app reads it.

## Files

- `server.js` — Express app: form page (`GET /`) and report generation
  (`POST /generate`).
- `lib/systemPrompt.js` — the persona-analyst system prompt (adapted from
  the original brief to work from supplied text rather than live browsing).
- `lib/schema.js` — JSON schema forced via Anthropic tool-use, so output is
  always structured and renderable (no brittle markdown parsing).
- `lib/renderReport.js` — turns the structured JSON into the branded HTML
  report (navy/gold/teal, Merriweather/Lato — matches the original
  Practus template design).
- `lib/renderForm.js` — the intake form page.

## Notes

- Every bullet in the output is labelled Observed / Inferred / Gap per the
  original no-fabrication rule — thin input will honestly produce a
  gap-heavy, lower-confidence report rather than invented detail.
- The report page has a "Print / Save as PDF" button (browser print) for
  archiving/sharing outside the app.
- To swap in a different model, set `CLAUDE_MODEL` (e.g. `claude-opus-4-8`
  for deeper analysis at higher cost/latency).
