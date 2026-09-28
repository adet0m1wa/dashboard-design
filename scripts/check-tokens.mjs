// Token discipline check (brief: "no raw hex values outside tokens.css", tokens only in components).
// Fails if any source file outside styles/tokens.css has:
//   1. a raw colour: #hex, rgb()/rgba()/hsl()
//   2. a Tailwind arbitrary value on a colour / spacing / radius / type / shadow utility (bg-[..], p-[..] …)
//   3. a padding / margin / gap utility whose number isn't a spacing token (p-13, gap-15 …)
//   4. a rounded-* that isn't a radius token
// Run: npm run check:tokens
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const tokens = JSON.parse(readFileSync(join(root, 'design/Default.tokens.json'), 'utf8'));
const extras = JSON.parse(readFileSync(join(root, 'design/extras.tokens.json'), 'utf8'));

const spacing = new Set([...Object.keys(tokens.spacing), ...Object.keys(extras.layout), 'px']);
const radius = new Set([...Object.keys(tokens.radius), 'full', 'none']);

const DIRS = ['app', 'components', 'lib', 'data', 'styles'];
const files = [];
const walk = (d) => {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(tsx?|css)$/.test(f) && !p.endsWith('styles/tokens.css')) files.push(p);
  }
};
for (const d of DIRS) {
  try { walk(join(root, d)); } catch {}
}

const problems = [];
const report = (file, line, msg) => problems.push(`${relative(root, file)}:${line}  ${msg}`);

for (const file of files) {
  const lines = readFileSync(file, 'utf8').split('\n');
  const isCss = file.endsWith('.css');
  lines.forEach((text, i) => {
    const n = i + 1;
    if (/^\s*(\/\/|\*|\/\*)/.test(text)) return; // comments
    for (const m of text.matchAll(/#[0-9a-fA-F]{3,8}\b/g)) {
      // allow things like `#1` in prose and id selectors; flag real colours only
      if (!/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(m[0])) continue;
      if (/\border $/i.test(text.slice(0, m.index))) continue; // copy like "order #1042"
      report(file, n, `raw colour ${m[0]}`);
    }
    if (/\b(rgba?|hsla?)\(/.test(text)) report(file, n, 'raw rgb()/hsl() colour');
    if (isCss) return;
    for (const m of text.matchAll(/(?<![\w-])-?(bg|text|border|outline|ring|fill|stroke|shadow|from|to|via|rounded|leading|tracking|font|p|px|py|pt|pr|pb|pl|ps|pe|m|mx|my|mt|mr|mb|ml|gap|gap-x|gap-y|space-x|space-y)-\[[^\]]+\]/g))
      report(file, n, `arbitrary value ${m[0]} — use a token`);
    for (const m of text.matchAll(/(?<![\w-])-?(p|px|py|pt|pr|pb|pl|ps|pe|m|mx|my|mt|mr|mb|ml|gap|gap-x|gap-y|space-x|space-y)-([\w.-]+)/g)) {
      const v = m[2];
      if (v === 'auto' || v.startsWith('(')) continue;
      if (!spacing.has(v)) report(file, n, `${m[0]} is not on the spacing token scale`);
    }
    for (const m of text.matchAll(/(?<![\w-])rounded(?:-[trblse]{1,2})?-([\w.-]+)/g)) {
      if (!radius.has(m[1])) report(file, n, `${m[0]} is not a radius token`);
    }
  });
}

if (problems.length) {
  console.error(`check:tokens found ${problems.length} problem(s):\n` + problems.map((p) => '  ' + p).join('\n'));
  process.exit(1);
}
console.log(`check:tokens OK — ${files.length} files, no raw colours or off-scale spacing.`);
