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

// ── Network allowlist ────────────────────────────────────────────────────────
// Lock the board to the shop's public IP(s). Set ALLOWED_IPS in Railway to a
// comma-separated list; leave it UNSET to allow all (fail-open) so a deploy
// never locks anyone out. Find the IP via /healthz (`yourIp`) from a shop
// device; clear ALLOWED_IPS in Railway to undo a lockout instantly.
const ALLOWED_IPS = (process.env.ALLOWED_IPS || '')
  .split(',').map(s => s.trim()).filter(Boolean);
function clientIp(req) {
  const xff = (req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  return (xff || (req.socket && req.socket.remoteAddress) || '').replace(/^::ffff:/, '');
}
app.set('trust proxy', true);
app.use((req, res, next) => {
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('Referrer-Policy', 'no-referrer');
  res.set('X-Frame-Options', 'SAMEORIGIN');
  res.set('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');
  next();
});
app.use((req, res, next) => {
  if (req.path === '/healthz') return next();
  if (ALLOWED_IPS.length === 0 || ALLOWED_IPS.includes(clientIp(req))) return next();
  res.status(403).send('Forbidden: access is restricted to the Langmuir shop network.');
});

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
app.get('/healthz', (req, res) => {
  res.json({ ok: true, ts: new Date().toISOString(), yourIp: clientIp(req), allowlist: ALLOWED_IPS.length ? 'on' : 'off' });
});

app.listen(PORT, () => {
  console.log(`LangmuirProductionKPI listening on :${PORT}`);
});
