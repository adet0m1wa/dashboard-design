// Feedback round 9 (2026-10-03): full screen comes back out as smoothly as it goes in, and the
// page doesn't reflow either way; Sales has no "since 3 Aug", all time is "Revenue of all time",
// no dot is filled while a whole period shows, and the same dot again lets go (numbers count
// back); Analytics' last week does the same; the Instagram tiles spread to the reel's bottom;
// Shift+click adds frames to a pick.
export default async function (t) {
  const base = process.env.HOP_URL ?? 'http://localhost:3000';
  await t.goto('/analytics');
  const reduced = await t.eval(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const m = reduced ? '[reduced] ' : '';
  await t.wait(2800);

  // 1. Full screen, in and out: sample every frame of both moves
  const sample = (label) =>
    t.eval(async (label) => {
      const app = document.querySelector('div.h-screen');
      const aside = document.querySelector('aside[aria-label^=Hop]');
      const frames = [...document.querySelectorAll('main [data-hop-frame="analytics.chart"], main [data-hop-frame="analytics.card"]')];
      const xs = new Set();
      const ws = [];
      let wider = 0;
      document.querySelector(`button[aria-label="${label}"]`).click();
      const t0 = performance.now();
      while (performance.now() - t0 < 450) {
        await new Promise((r) => requestAnimationFrame(r));
        frames.forEach((f) => xs.add(`${f.dataset.hopFrame}:${Math.round(f.getBoundingClientRect().left)}:${Math.round(f.getBoundingClientRect().width)}`));
        ws.push(Math.round(aside.getBoundingClientRect().width));
        if (app.scrollWidth > app.clientWidth) wider++;
      }
      const log = aside.querySelector('[role=log]').getBoundingClientRect();
      const a = aside.getBoundingClientRect();
      return { frameStates: xs.size, widths: [...new Set(ws)].length, wider, end: Math.round(a.width), logCentred: Math.abs(log.left + log.width / 2 - (a.left + a.width / 2)) <= 1 };
    }, label);
  const before = await t.eval(() => Math.round(document.querySelector('[data-hop-frame="analytics.chart"]').getBoundingClientRect().width));
  const into = await sample('Full screen');
  const out = await sample('Exit full screen');
  const after = await t.eval(() => Math.round(document.querySelector('[data-hop-frame="analytics.chart"]').getBoundingClientRect().width));
  const moved = reduced ? into.widths === 1 && out.widths === 1 : into.widths > 4 && out.widths > 4;
  await t.check(
    `${m}1 full screen in and out: ${into.widths}/${out.widths} panel widths, page frames held (${into.frameStates}/${out.frameStates} states for 2 frames), never wider (${into.wider}/${out.wider}), back at ${out.end}px, chart ${before}→${after}px`,
    moved && into.frameStates === 2 && out.frameStates === 2 && into.wider === 0 && out.wider === 0 && out.end === 368 && before === after,
  );

  // 2–3. Sales: notes, title, dots, picking and letting go
  const sales = () =>
    t.eval(() => ({
      text: document.querySelector('main').textContent,
      title: document.querySelector('[data-hop-frame^="sales.chart."] h2').textContent,
      filled: document.querySelectorAll('[data-hop-frame^="sales.chart."] circle.fill-status-success').length,
      revenue: document.querySelector('[data-hop-frame^="sales.tile.revenue."] .tabular-nums span').textContent,
    }));
  await t.page.goto(`${base}/sales`, { waitUntil: 'networkidle0' });
  await t.wait(1200);
  const periods = [
    ['Weekly', null],
    ['Monthly', 'This month'],
    ['Monthly', 'Last month'],
    ['All time', null],
  ];
  const issues = [];
  for (const [menu, which] of periods) {
    await t.click('button[aria-haspopup=listbox]');
    await t.click(`text=${menu}`).catch(() => t.eval((l) => [...document.querySelectorAll('[role=option]')].find((o) => o.textContent === l).click(), menu));
    if (which) await t.eval((l) => [...document.querySelectorAll('main [role=radio]')].find((b) => b.textContent.includes(l)).click(), which);
    await t.wait(700);
    const whole = await sales();
    if (whole.filled !== 0) issues.push(`${menu}/${which}: ${whole.filled} filled`);
    if (/since 3 Aug/.test(whole.text)) issues.push(`${menu}: says since 3 Aug`);
    const want = { Weekly: 'Revenue so far for this week', 'This month': 'Revenue so far for this month', 'Last month': 'Total revenue from Mon 3 – Mon 31 Aug', 'All time': 'Revenue of all time' }[which ?? menu];
    if (whole.title !== want) issues.push(`title "${whole.title}" (want "${want}")`);
    // Pick the second dot's day by its label, then the same again
    const tick = await t.eval(() => [...document.querySelectorAll('[data-hop-frame^="sales.chart."] button[aria-label$="show that day"]')][1].getAttribute('aria-label'));
    await t.click(`button[aria-label="${tick}"]`);
    await t.wait(600);
    const day = await sales();
    if (day.filled !== 1 || day.revenue === whole.revenue) issues.push(`${menu}/${which}: picked → ${day.filled} filled, ${day.revenue}`);
    const counted = await t.eval(async (tick) => {
      document.querySelector(`button[aria-label="${tick}"]`).click();
      const seen = new Set();
      const t0 = performance.now();
      while (performance.now() - t0 < 600) {
        await new Promise((r) => requestAnimationFrame(r));
        seen.add(document.querySelector('[data-hop-frame^="sales.tile.revenue."] .tabular-nums span').textContent);
      }
      return seen.size;
    }, tick);
    const back = await sales();
    if (back.filled !== 0 || back.revenue !== whole.revenue) issues.push(`${menu}/${which}: let go → ${back.filled} filled, ${back.revenue} (want ${whole.revenue})`);
    if (!reduced && counted < 3) issues.push(`${menu}/${which}: revenue didn't count back (${counted} values)`);
  }
  await t.click('button[aria-haspopup=listbox]');
  await t.eval(() => [...document.querySelectorAll('[role=option]')].find((o) => o.textContent === 'Weekly').click());
  await t.eval(() => [...document.querySelectorAll('main [role=radio]')].find((b) => b.textContent.includes('Last week')).click());
  await t.wait(300);
  const lastTitle = (await sales()).title;
  if (lastTitle !== 'Total revenue from Mon 14 – Sun 20 Sep') issues.push(`last week "${lastTitle}"`);
  await t.check(`${m}2–3 Sales, 5 periods titled by their days: no "since 3 Aug", "Revenue of all time", nothing filled until a day is picked, the same day again counts back to the total${issues.length ? ` — ${issues.join('; ')}` : ''}`, issues.length === 0);

  // 3b. Analytics' last week: nothing filled, pick, the same again lets go
  await t.page.goto(`${base}/analytics`, { waitUntil: 'networkidle0' });
  await t.wait(2800);
  await t.eval(() => [...document.querySelectorAll('main [role=radio]')].find((b) => b.textContent.includes('Last week')).click());
  await t.wait(600);
  const filled = () => t.eval(() => document.querySelectorAll('#kpi-chart circle[class*="fill-status"]').length);
  const lw0 = await filled();
  await t.click('button[aria-label="Wed, show that day"]');
  await t.wait(300);
  const lw1 = await filled();
  await t.click('button[aria-label="Wed, show that day"]');
  await t.wait(300);
  const lw2 = await filled();
  const tabStop = await t.eval(() => document.querySelectorAll('[aria-label=Days] button[tabindex="0"]').length);
  await t.check(`${m}3b Analytics last week: ${lw0} filled → Wed ${lw1} → again ${lw2}; ${tabStop} day in the Tab order`, lw0 === 0 && lw1 === 1 && lw2 === 0 && tabStop === 1);

  // 4. Instagram: the last row sits on the reel's bottom edge, rows evenly spaced
  for (const w of [1440, 1336]) {
    await t.page.setViewport({ width: w, height: 900, deviceScaleFactor: 1 });
    await t.page.goto(`${base}/instagram`, { waitUntil: 'networkidle0' });
    await t.wait(500);
    const r = await t.eval(() => {
      const p = document.querySelector('[data-hop-frame^="instagram.preview."]').getBoundingClientRect();
      const tiles = [...document.querySelectorAll('[data-hop-frame^="instagram.stat."]')].map((f) => f.getBoundingClientRect());
      const gaps = [tiles[2].top - tiles[0].bottom, tiles[4].top - tiles[2].bottom];
      return { top: tiles[0].top - p.top, bottom: Math.max(...tiles.map((x) => x.bottom)) - p.bottom, gaps };
    });
    await t.check(
      `${m}4 Instagram @${w}: tiles from the reel's top (${r.top}) to its bottom (${r.bottom.toFixed(1)}), gaps ${r.gaps.map((g) => g.toFixed(1)).join(' / ')}`,
      Math.abs(r.top) < 0.5 && Math.abs(r.bottom) < 0.5 && Math.abs(r.gaps[0] - r.gaps[1]) < 0.5,
    );
  }
  await t.page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

  // 5. Shift+click adds frames; asking sends them all
  await t.page.goto(`${base}/sales`, { waitUntil: 'networkidle0' });
  await t.wait(800);
  await t.click('button[aria-label="Highlight a frame"]');
  const outlined = () => t.eval(() => [...document.querySelectorAll('[data-hop-frame]')].filter((f) => f.querySelectorAll(':scope > span.z-10 > span.size-\\[7px\\]').length === 4).map((f) => f.dataset.hopFrame));
  const chips = () => t.eval(() => [...document.querySelectorAll('button[aria-label^="Remove "]')].map((b) => b.getAttribute('aria-label').slice(7)));
  await t.click('[data-hop-frame="sales.tile.revenue.thisWeek"]');
  await t.page.keyboard.down('Shift');
  await t.click('[data-hop-frame="sales.tile.orders.thisWeek"]');
  await t.click('[data-hop-frame="sales.tile.average.thisWeek"]');
  await t.page.keyboard.up('Shift');
  await t.wait(300);
  const three = { frames: await outlined(), chips: await chips() };
  await t.page.keyboard.down('Shift');
  await t.click('[data-hop-frame="sales.tile.orders.thisWeek"]');
  await t.page.keyboard.up('Shift');
  await t.wait(300);
  const two = { frames: await outlined(), chips: await chips() };
  await t.check(
    `${m}5 Shift+click: ${three.frames.length} outlined, ${three.chips.length} chips; Shift+click one again → ${two.frames.length} (${two.chips.join(', ')})`,
    three.frames.length === 3 && three.chips.length === 3 && two.frames.length === 2 && two.chips.length === 2 && !two.chips.some((c) => c.startsWith('Orders')),
  );
  await t.click('textarea[aria-label="Message Hop"]');
  await t.page.keyboard.press('Enter');
  const answered = await t.page
    .waitForFunction(() => document.querySelector('aside[aria-label^=Hop] [role=log]').textContent.includes('Here’s each of the 2 frames'), { timeout: 8000 })
    .then(() => true, () => false);
  await t.wait(2500);
  const sent = await t.eval(() => ({
    chips: document.querySelectorAll('[role=log] button[aria-label^="Show "]').length,
    text: document.querySelector('[role=log]').textContent,
    left: document.querySelectorAll('[data-hop-frame] > span.z-10').length,
  }));
  await t.check(
    `${m}5 asked about both: ${sent.chips} chips on the question, an answer for each, outlines cleared (${sent.left})`,
    answered && sent.chips === 2 && sent.text.includes('Revenue · This week:') && sent.text.includes('Average order · This week:') && sent.left === 0,
  );
  // A tag click brings both back
  await t.click('[role=log] button[aria-label^="Show "]');
  await t.wait(400);
  const again = await outlined();
  await t.check(`${m}5 a chat tag brings both outlines back (${again.join(', ')})`, again.length === 2);
}
