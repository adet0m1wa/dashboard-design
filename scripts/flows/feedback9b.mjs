// Feedback round 9, edge cases found while checking for bugs: full screen opened from the
// keyboard and closed by mouse, reversed half way, or with the window resized in between; Shift
// picks against a plain click, Esc, another page and highlight mode going off.
export default async function (t) {
  const base = process.env.HOP_URL ?? 'http://localhost:3000';
  await t.goto('/analytics');
  const reduced = await t.eval(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const m = reduced ? '[reduced] ' : '';
  await t.wait(2800);
  const state = () =>
    t.eval(() => {
      const main = document.querySelector('main');
      const col = main.parentElement.parentElement;
      const app = document.querySelector('div.h-screen');
      return { panel: Math.round(document.querySelector('aside[aria-label^=Hop]').getBoundingClientRect().width), main: Math.round(main.getBoundingClientRect().width), col: Math.round(col.getBoundingClientRect().width), held: main.parentElement.style.width, wider: app.scrollWidth > app.clientWidth };
    });
  const normal = await state();

  // a. In from the keyboard (instant), out with the mouse (eased): the page comes back at its
  // width throughout, never squeezed to nothing
  await t.eval(() => document.querySelector('button[aria-label="Full screen"]').focus());
  await t.page.keyboard.press('Enter');
  await t.wait(100);
  const kIn = await state();
  const mid = await t.eval(async () => {
    document.querySelector('button[aria-label="Exit full screen"]').click();
    const widths = new Set();
    const t0 = performance.now();
    while (performance.now() - t0 < 400) {
      await new Promise((r) => requestAnimationFrame(r));
      widths.add(Math.round(document.querySelector('main').getBoundingClientRect().width));
    }
    return [...widths];
  });
  const kOut = await state();
  await t.check(
    `${m}a keyboard in (panel ${kIn.panel}, page column ${kIn.col}), mouse out: the page stays ${mid.join('/')}px wide, ends ${kOut.main}px (was ${normal.main}), panel ${kOut.panel}`,
    kIn.col === 0 && mid.length === 1 && mid[0] === normal.main && kOut.main === normal.main && kOut.panel === 368 && !kOut.held,
  );

  // b. Reversed half way, twice: it lands where it was sent, nothing left held
  await t.eval(async () => {
    const b = () => document.querySelector('button[aria-label="Full screen"], button[aria-label="Exit full screen"]');
    b().click();
    await new Promise((r) => setTimeout(r, 110));
    b().click();
    await new Promise((r) => setTimeout(r, 90));
    b().click();
  });
  await t.wait(600);
  const rev = await state();
  await t.click('button[aria-label="Exit full screen"]');
  await t.wait(600);
  const rev2 = await state();
  await t.check(`${m}b reversed mid-way: lands full (${rev.panel}px, page ${rev.col}), then back (${rev2.panel}px, page ${rev2.main}px, held "${rev2.held}")`, rev.col === 0 && rev2.panel === 368 && rev2.main === normal.main && !rev2.held && !rev2.wider);

  // c. The window resized while in full screen: back out, the page fits the new width
  await t.click('button[aria-label="Full screen"]');
  await t.wait(500);
  await t.page.setViewport({ width: 1336, height: 900, deviceScaleFactor: 1 });
  await t.wait(300);
  const full = await state();
  await t.click('button[aria-label="Exit full screen"]');
  await t.wait(600);
  const small = await state();
  await t.page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await t.wait(300);
  await t.check(`${m}c resized while full (panel ${full.panel}): back out at 1336 the page is ${small.main}px in a ${small.col}px column, nothing sideways`, small.main === small.col && small.panel === 368 && !small.wider && !small.held);

  // d. Shift picks: a plain click replaces them all; Esc, another page and switching highlight off
  // each clear them
  await t.page.goto(`${base}/sales`, { waitUntil: 'networkidle0' });
  await t.wait(800);
  const picked = () => t.eval(() => document.querySelectorAll('[data-hop-frame] > span.z-10 > span.size-\\[7px\\]').length / 4);
  const pickTwo = async () => {
    await t.click('[data-hop-frame="sales.tile.revenue.thisWeek"]');
    await t.page.keyboard.down('Shift');
    await t.click('[data-hop-frame="sales.tile.orders.thisWeek"]');
    await t.page.keyboard.up('Shift');
    await t.wait(250);
  };
  await t.click('button[aria-label="Highlight a frame"]');
  await pickTwo();
  const two = await picked();
  await t.click('[data-hop-frame="sales.tile.average.thisWeek"]');
  await t.wait(250);
  const plain = await picked();
  await pickTwo();
  await t.page.keyboard.press('Escape');
  await t.wait(250);
  const esc = await picked();
  await pickTwo();
  await t.click('button[aria-label="Highlight a frame"]');
  await t.wait(250);
  const off = await picked();
  await t.click('button[aria-label="Highlight a frame"]');
  await pickTwo();
  await t.eval(() => document.querySelector('nav[aria-label=Pages] button:nth-child(4)').click());
  await t.settle();
  await t.eval(() => document.querySelector('nav[aria-label=Pages] button:nth-child(3)').click());
  await t.settle(300);
  const away = await picked();
  const chips = await t.eval(() => document.querySelectorAll('button[aria-label^="Remove "]').length);
  await t.check(`${m}d Shift picks ${two}; a plain click → ${plain}; Esc → ${esc}; highlight off → ${off}; another page → ${away} (${chips} chips)`, two === 2 && plain === 1 && esc === 0 && off === 0 && away === 0 && chips === 0);

  // e. Shift+Enter from the keyboard adds, and focus stays on the page to pick more (highlight
  // mode is still on: changing page doesn't turn it off)
  if ((await t.eval(() => document.querySelector('button[aria-label="Highlight a frame"]').getAttribute('aria-pressed'))) !== 'true') await t.click('button[aria-label="Highlight a frame"]');
  await t.eval(() => document.querySelector('[data-hop-frame="sales.tile.revenue.thisWeek"]').focus());
  await t.page.keyboard.press('Enter');
  await t.eval(() => document.querySelector('[data-hop-frame="sales.tile.orders.thisWeek"]').focus());
  await t.page.keyboard.down('Shift');
  await t.page.keyboard.press('Enter');
  await t.page.keyboard.up('Shift');
  await t.wait(250);
  const kb = { n: await picked(), focus: await t.eval(() => document.activeElement?.dataset?.hopFrame ?? document.activeElement?.tagName) };
  await t.check(`${m}e Enter then Shift+Enter: ${kb.n} picked, focus on ${kb.focus}`, kb.n === 2 && kb.focus === 'sales.tile.orders.thisWeek');
}
