// Screenshot the running app at 1440×900 with the locally installed Chrome (puppeteer-core,
// no browser download). Usage:
//   node scripts/shot.mjs <path> <out.png> [--wait=ms] [--reduced] [--steps=file.mjs]
// --steps points at a module exporting `default async (page) => {}` to drive the UI first.
import puppeteer from 'puppeteer-core';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const [, , path = '/analytics', out = 'shot.png', ...rest] = process.argv;
const flag = (name) => rest.find((a) => a.startsWith(`--${name}`));
const wait = Number(flag('wait')?.split('=')[1] ?? 1500);
const steps = flag('steps')?.split('=')[1];
const base = process.env.HOP_URL ?? 'http://localhost:3000';

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
  args: ['--hide-scrollbars', '--font-render-hinting=none'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
if (flag('reduced')) await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
const errors = [];
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
page.on('pageerror', (e) => errors.push(String(e)));
await page.goto(base + path, { waitUntil: 'networkidle0' });
await new Promise((r) => setTimeout(r, wait));
if (steps) await (await import(pathToFileURL(resolve(steps)).href)).default(page);
await page.screenshot({ path: out });
await browser.close();
console.log(`shot: ${out}${errors.length ? `\nconsole errors:\n  ${errors.join('\n  ')}` : ' (no console errors)'}`);
