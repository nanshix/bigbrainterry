// Big Brain Terry — local dev server
// Usage: node server.js
// Serves static files on http://localhost:3000
// POST /api/bug   { gameId, questionId, note }  → appends to bugs.md
// POST /api/merit { gameId, questionId, delta } → updates questions/merit.json (+1 / -1)

const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT    = 3000;
const ROOT    = __dirname;
const BUGS_MD = path.join(ROOT, 'bugs.md');
const MERIT_J = path.join(ROOT, 'questions', 'merit.json');

const MIME = {
  '.html': 'text/html',
  '.js':   'text/javascript',
  '.css':  'text/css',
  '.csv':  'text/plain',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg':  'image/svg+xml',
  '.yaml': 'text/plain',
  '.md':   'text/plain',
};

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end',  () => { try { resolve(JSON.parse(data)); } catch { reject(new Error('bad json')); } });
    req.on('error', reject);
  });
}

function loadMerit() {
  try { return JSON.parse(fs.readFileSync(MERIT_J, 'utf8')); } catch { return {}; }
}

function saveMerit(obj) {
  fs.writeFileSync(MERIT_J, JSON.stringify(obj, null, 2));
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  // ── POST /api/bug ──────────────────────────────────────────────────────────
  if (req.method === 'POST' && req.url === '/api/bug') {
    try {
      const body = await readBody(req);
      const ts   = new Date().toISOString().replace('T', ' ').slice(0, 19);
      const line = `\n## [${ts}] ${body.gameId ?? '?'} — Q:${body.questionId ?? '?'}\n${body.note ?? '(no note)'}\n`;
      fs.appendFileSync(BUGS_MD, line);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
    } catch (e) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: e.message }));
    }
    return;
  }

  // ── POST /api/merit ────────────────────────────────────────────────────────
  if (req.method === 'POST' && req.url === '/api/merit') {
    try {
      const body  = await readBody(req);
      const key   = `${body.gameId ?? 'unknown'}:${body.questionId ?? '?'}`;
      const merit = loadMerit();
      merit[key]  = (merit[key] ?? 0) + (Number(body.delta) || 0);
      saveMerit(merit);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, merit: merit[key] }));
    } catch (e) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: e.message }));
    }
    return;
  }

  // ── Static files ───────────────────────────────────────────────────────────
  let urlPath = req.url.split('?')[0];
  if (urlPath === '/') urlPath = '/index.html';

  const filePath = path.join(ROOT, urlPath);
  if (!filePath.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }

  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    const ext  = path.extname(filePath);
    const mime = MIME[ext] ?? 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`Big Brain Terry → http://localhost:${PORT}`);
});
