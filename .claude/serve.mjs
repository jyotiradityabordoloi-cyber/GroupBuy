// Tiny static server for previewing GroupBuy locally: node .claude/serve.mjs [port]
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const port = +process.argv[2] || 5178;
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.json': 'application/json' };
http.createServer(async (req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p.endsWith('/')) p += 'index.html';
  const f = normalize(join(root, p));
  if (!f.startsWith(normalize(root))) { res.writeHead(403); return res.end(); }
  try { const b = await readFile(f); res.writeHead(200, { 'content-type': types[extname(f)] || 'application/octet-stream', 'cache-control': 'no-store' }); res.end(b); }
  catch { res.writeHead(404); res.end('not found'); }
}).listen(port, '127.0.0.1', () => console.log(`GroupBuy on http://127.0.0.1:${port}/app.html`));
