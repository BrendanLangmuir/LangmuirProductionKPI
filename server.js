// ──────────────────────────────────────────────────────────────
//  LangmuirProductionKPI · Express server
// ──────────────────────────────────────────────────────────────
//  Minimal static-file server. The dashboard is fully client-side
//  (fetches data directly from the Apps Script web app), so the
//  server's only job is to serve the HTML and assets.
//
//  Routes:
//    GET /         → public/KPI.html (default)
//    GET /KPI      → public/KPI.html (friendly URL)
//    GET /<file>   → public/<file>   (any other static asset)
//
//  Port from $PORT (Railway sets this) or 3000 locally.
// ──────────────────────────────────────────────────────────────

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

// Serve everything in public/ as static files.
// e.g. GET /KPI.html → public/KPI.html
app.use(express.static(PUBLIC_DIR));

// Friendly default: hit the root URL, get the dashboard.
app.get('/', (_req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'KPI.html'));
});

// Friendly URL without the .html extension.
app.get('/KPI', (_req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'KPI.html'));
});

// Health check for Railway (optional but nice — quick liveness probe)
app.get('/healthz', (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`LangmuirProductionKPI listening on :${PORT}`);
});
