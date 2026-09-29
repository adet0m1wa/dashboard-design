// Runs a scripted click-through in headless Chrome (the local install, via puppeteer-core) and
// reports named checks + console errors. Used for every phase test and the final test.
//
//   node scripts/flow.mjs scripts/flows/<name>.mjs [--reduced] [--out=docs/screenshots]
//
// A flow module exports `default async (t) => {}` where t has:
//   t.page                 the puppeteer Page (1440×900)
//   t.goto(path)           load a page of the app and wait for it to settle
//   t.click(selector)      click an element (CSS selector or text=Label)
//   t.wait(ms)             sleep
//   t.settle()             wait until the page transition has finished
//   t.shot(name)           save <out>/<name>.png
//   t.check(label, cond)   record PASS/FAIL (cond may be a value or a function returning one)
//   t.eval(fn, ...args)    page.evaluate shortcut
import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const [, , flowPath, ...rest] = process.argv;
const opt = (n) => rest.find((a) => a.startsWith(`--${n}`));
const outDir = opt('out')?.split('=')[1] ?? 'docs/screenshots';
const reduced = Boolean(opt('reduced'));
const base = process.env.HOP_URL ?? 'http://localhost:3000';
mkdirSync(outDir, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
  // --scrollbars leaves them on (they're hidden by default so screenshots match Figma)
  args: [...(opt('scrollbars') ? [] : ['--hide-scrollbars']), '--font-render-hinting=none'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: reduced ? 'reduce' : 'no-preference' }]);

const errors = [];
page.on('console', (m) => {
  if (m.type() === 'error' || m.type() === 'warning') errors.push(`[${m.type()}] ${m.text()}`);
});
page.on('pageerror', (e) => errors.push(`[pageerror] ${e}`));

const results = [];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const t = {
  page,
  wait: sleep,
  async goto(path) {
    await page.goto(base + path, { waitUntil: 'networkidle0' });
    await sleep(400);
  },
  async click(sel, opts = {}) {
    if (sel.startsWith('text=')) {
      const label = sel.slice(5);
      const handle = await page.waitForFunction(
        (l) =>
          [...document.querySelectorAll('button, a, [role=tab], [role=button], [data-hop-frame]')].find(
            (e) => e.textContent.replace(/\s+/g, ' ').trim() === l || e.getAttribute('aria-label') === l,
          ),
        { timeout: 3000 },
        label,
      );
      await handle.asElement().click(opts);
    } else {
      await page.waitForSelector(sel, { timeout: 3000 });
      await page.click(sel, opts);
    }
  },
  // Wait for the page transition (PageStage's wipe) to finish, then a beat.
  async settle(extra = 80) {
    await page.waitForFunction(() => document.querySelector('[data-transition]')?.dataset.transition === 'idle', { timeout: 5000, polling: 'raf' });
    await sleep(extra);
  },
  async shot(name) {
    await page.screenshot({ path: `${outDir}/${name}.png` });
  },
  async check(label, cond) {
    let ok;
    try {
      ok = typeof cond === 'function' ? await cond() : cond;
    } catch (e) {
      ok = false;
      label += ` (threw: ${e.message})`;
    }
    results.push({ label, ok: Boolean(ok), detail: typeof ok === 'string' ? ok : '' });
  },
  eval: (fn, ...args) => page.evaluate(fn, ...args),
};

let crashed = null;
try {
  const flow = await import(pathToFileURL(resolve(flowPath)).href);
  await flow.default(t);
} catch (e) {
  crashed = e;
}
await browser.close();

const pad = (s) => (s ? ` — ${s}` : '');
for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.label}${pad(r.detail)}`);
if (crashed) console.log(`CRASH  ${crashed.stack ?? crashed}`);
console.log(errors.length ? `console errors/warnings (${errors.length}):\n  ${errors.join('\n  ')}` : 'console: no errors or warnings');
const failed = results.filter((r) => !r.ok).length + (crashed ? 1 : 0) + (errors.length ? 1 : 0);
console.log(`${results.length - results.filter((r) => !r.ok).length}/${results.length} checks passed${reduced ? ' (reduced motion)' : ''}`);
process.exit(failed ? 1 : 0);
