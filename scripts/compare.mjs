// Side-by-side + pixel diff of two same-size PNGs (e.g. Figma export vs app screenshot).
// Usage: node scripts/compare.mjs figma.png app.png out.png [--region=x,y,w,h] [--zoom=2]
// Output: [figma | app | diff], diff shows changed pixels in red over a faded copy of the app.
// --region crops all three to one rectangle (in page pixels); --zoom scales the result up.
import puppeteer from 'puppeteer-core';
import { readFileSync } from 'node:fs';

const [, , a, b, out, ...rest] = process.argv;
const opt = (n) => rest.find((x) => x.startsWith(`--${n}=`))?.split('=')[1];
const region = opt('region')?.split(',').map(Number) ?? null;
const zoom = Number(opt('zoom') ?? 1);
const uri = (p) => `data:image/png;base64,${readFileSync(p).toString('base64')}`;
const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
});
const page = await browser.newPage();
const result = await page.evaluate(
  async (A, B, region, zoom) => {
    const load = (src) => new Promise((ok) => { const i = new Image(); i.onload = () => ok(i); i.src = src; });
    const [ia, ib] = await Promise.all([load(A), load(B)]);
    const [rx, ry, w, h] = region ?? [0, 0, ia.width, ia.height];
    const ctx = (img) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); x.drawImage(img, rx, ry, w, h, 0, 0, w, h); return x; };
    const da = ctx(ia).getImageData(0, 0, w, h), db = ctx(ib).getImageData(0, 0, w, h);
    const out = document.createElement('canvas'); out.width = w * 3; out.height = h;
    const o = out.getContext('2d');
    o.putImageData(da, 0, 0); o.putImageData(db, w, 0);
    const diff = o.createImageData(w, h);
    let changed = 0;
    for (let i = 0; i < da.data.length; i += 4) {
      const d = Math.abs(da.data[i] - db.data[i]) + Math.abs(da.data[i + 1] - db.data[i + 1]) + Math.abs(da.data[i + 2] - db.data[i + 2]);
      const grey = 255 - (255 - (db.data[i] + db.data[i + 1] + db.data[i + 2]) / 3) * 0.25;
      if (d > 60) { changed++; diff.data.set([230, 30, 30, 255], i); } else diff.data.set([grey, grey, grey, 255], i);
    }
    o.putImageData(diff, w * 2, 0);
    const z = document.createElement('canvas'); z.width = w * 3 * zoom; z.height = h * zoom;
    const zc = z.getContext('2d'); zc.imageSmoothingEnabled = false; zc.drawImage(out, 0, 0, z.width, z.height);
    return { png: z.toDataURL('image/png'), pct: ((changed / (w * h)) * 100).toFixed(2), w, h, bw: ib.width, bh: ib.height };
  },
  uri(a),
  uri(b),
  region,
  zoom,
);
const { writeFileSync } = await import('node:fs');
writeFileSync(out, Buffer.from(result.png.split(',')[1], 'base64'));
await browser.close();
console.log(`compare: ${out} — ${result.pct}% of pixels differ noticeably (${result.w}×${result.h} vs ${result.bw}×${result.bh})`);
