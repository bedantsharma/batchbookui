// scripts/prerender.mjs
//
// Runs after `vite build` (client) and `vite build --ssr src/entry-server.jsx`
// (server bundle). For each route in PRERENDER_ROUTES it renders the real
// page markup and writes it into a static index.html, so crawlers get actual
// content instead of the bare `<div id="root"></div>` shell.
//
// This is plain build-time prerendering, not SSR-with-hydration: the client
// still boots with `createRoot(...).render(...)` (see src/main.jsx), which
// replaces this markup once JS loads. There is nothing to keep in sync
// between server and client render output, so no hydration mismatch is
// possible.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const distDir = path.join(root, 'dist');
const serverEntry = path.join(distDir, 'server', 'entry-server.js');

const { PRERENDER_ROUTES, render } = await import(pathToFileUrl(serverEntry));

const template = fs.readFileSync(path.join(distDir, 'index.html'), 'utf-8');

for (const url of Object.keys(PRERENDER_ROUTES)) {
  const { html, title, description } = render(url);

  const page = template
    .replace('<div id="root"></div>', `<div id="root">${html}</div>`)
    .replace(/<title>.*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
    .replace(
      /<meta name="description" content=".*?" \/>/,
      `<meta name="description" content="${escapeHtml(description)}" />`,
    );

  const outDir = url === '/' ? distDir : path.join(distDir, url.replace(/^\//, ''));
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'index.html'), page);
  console.log(`[prerender] wrote ${path.relative(root, path.join(outDir, 'index.html'))}`);
}

// The SSR bundle was only a build-time tool — don't ship it.
fs.rmSync(path.join(distDir, 'server'), { recursive: true, force: true });

function pathToFileUrl(p) {
  return 'file://' + p;
}

function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
