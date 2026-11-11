// Builds scroll-proto/main.tsx with esbuild (watching) and serves the test page on all interfaces.
// Usage: node scroll-proto/serve.mjs [port]   (default 5179)
import * as esbuild from 'esbuild';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { networkInterfaces } from 'node:os';
import { extname, join, normalize, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const OUT = join(ROOT, 'out', 'scroll-proto');
const PORT = Number(process.argv[2] ?? 5179);

const ctx = await esbuild.context({
  entryPoints: [join(HERE, 'main.tsx')],
  outfile: join(OUT, 'main.js'),
  tsconfig: join(ROOT, 'tsconfig.json'),
  bundle: true,
  format: 'esm',
  target: 'es2022',
  jsx: 'automatic',
  sourcemap: true,
  minify: true,
  define: { 'process.env.NODE_ENV': '"production"' },
  logLevel: 'info',
});
await ctx.watch();

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.map': 'application/json', '.otf': 'font/otf', '.jpg': 'image/jpeg' };

createServer(async (req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let file;
  if (path === '/' || path === '/index.html') file = join(HERE, 'index.html');
  else if (path === '/main.js' || path === '/main.js.map') file = join(OUT, path.slice(1));
  else if (path.startsWith('/fonts/') || path.startsWith('/images/')) file = join(ROOT, 'public', normalize(path).replace(/^(\.\.[/\\])+/, ''));
  if (!file) { res.writeHead(404).end('not found'); return; }
  try {
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream', 'cache-control': 'no-store' }).end(body);
  } catch {
    res.writeHead(404).end('not found');
  }
}).listen(PORT, '0.0.0.0', () => {
  const lan = Object.values(networkInterfaces()).flat().filter((a) => a && a.family === 'IPv4' && !a.internal).map((a) => a.address);
  console.log(`scroll-proto: http://localhost:${PORT}/`);
  for (const ip of lan) console.log(`          LAN: http://${ip}:${PORT}/`);
});
