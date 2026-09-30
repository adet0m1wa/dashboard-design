// Feedback round 3 (2026-09-29): no Hop-head icon in the Analytics top bar; instant sidebar, page
// changes, nav pill, person pills and panel resizing; the bottom card's title changes instantly;
// Urgent doesn't animate. (Instant pages, the standard fade and auto-hiding scrollbars: feedback2.)
export default async function (t) {
  await t.page.goto((process.env.HOP_URL ?? 'http://localhost:3000') + '/analytics', { waitUntil: 'domcontentloaded' });
  await t.page.waitForSelector('[data-page=analytics] #kpi-tab-revenue');
  const reduced = await t.eval(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const m = reduced ? '[reduced] ' : '';

  // Urgent doesn't take part in the first-load entrance
  await t.wait(60);
  const urgentEarly = await t.eval(() => {
    const card = [...document.querySelectorAll('h3')].find((h) => h.textContent === 'Urgent').closest('div.rounded-12').parentElement;
    return +getComputedStyle(card).opacity;
  });
  await t.check(`${m}8 Urgent is fully there from the first frame (opacity ${urgentEarly})`, urgentEarly === 1);
  await t.wait(2600);

  // 1. No Hop-head logo beside "Analytics" in the top bar; other pages keep their icon
  await t.check(`${m}1 Analytics top bar: title only, no icon`, () => t.eval(() => { const h = document.querySelector('main header h1'); return h.textContent.trim() === 'Analytics' && !h.querySelector('svg'); }));

  // 8. Switching KPI: the card title swaps at once (one title, the new one); Urgent rows don't move
  const kpi = await t.eval(async () => {
    document.querySelector('#kpi-tab-orders').click();
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const titles = [...document.querySelectorAll('[data-hop-frame="analytics.card"] h3')].map((h) => h.textContent);
    return titles;
  });
  await t.check(`${m}8 KPI switch: one card title, already the new one (${kpi.join(' | ')})`, kpi.length === 1 && kpi[0] === 'Orders');
  const day = await t.eval(async () => {
    document.querySelector('#kpi-tab-revenue').click();
    await new Promise((r) => setTimeout(r, 50));
    document.querySelector('button[aria-label="Wed, show that day"]').click();
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const urgent = [...document.querySelectorAll('h3')].find((h) => h.textContent === 'Urgent').closest('div.rounded-12');
    const rows = [...urgent.querySelectorAll('[data-hop-frame^="analytics.urgent."]')];
    return { rows: rows.length, texts: rows.map((r) => r.textContent.slice(0, 20)), faded: rows.some((r) => +getComputedStyle(r.parentElement).opacity < 1 || getComputedStyle(r.parentElement).transform !== 'none') };
  });
  await t.check(`${m}8 Urgent swaps to Wednesday's items at once, no fade or slide (${day.rows} rows)`, day.rows === 3 && !day.faded);
  await t.click('button[aria-label="Today"]');
  await t.wait(400);

  // 2. Sidebar toggles at once, with no crossfade between its two layouts
  const side = await t.eval(async () => {
    document.querySelector('button[aria-label="Collapse sidebar"]').click();
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const aside = document.querySelector('aside[aria-label=Sidebar]');
    return { w: aside.getBoundingClientRect().width, layers: aside.children.length, t: getComputedStyle(aside).transitionDuration };
  });
  await t.check(`${m}2 sidebar: 56px two frames after the click, one layout, no transition (${side.w}px, ${side.layers} layer)`, side.w === 56 && side.layers === 1 && side.t === '0s');
  await t.click('button[aria-label="Expand sidebar"]');
  await t.wait(100);

  // 3. The nav pill jumps straight to the new page
  const pill = await t.eval(async () => {
    const before = document.querySelector('[aria-current=page] > span').getBoundingClientRect().y;
    document.querySelector('nav[aria-label=Pages] button:nth-child(5)').click();
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const btn = document.querySelector('[aria-current=page]');
    return { before, after: btn.querySelector(':scope > span').getBoundingClientRect().y, row: btn.getBoundingClientRect().y, active: btn.textContent };
  });
  await t.check(`${m}3 nav pill: on Inventory two frames after the click (${pill.before.toFixed(0)} → ${pill.after.toFixed(0)})`, Math.abs(pill.after - pill.row) < 1 && pill.active.includes('Inventory'));

  // 5. Resizing: no easing on the panel's width — it follows at once
  const panel = await t.eval(() => getComputedStyle(document.querySelector('aside[aria-label^=Hop]')).transitionDuration);
  const h = await (await t.page.$('[role=separator]')).boundingBox();
  await t.page.mouse.move(h.x + 3, h.y + 300);
  await t.page.mouse.down();
  await t.page.mouse.move(h.x + 43, h.y + 300);
  const mid = await t.eval(async () => { await new Promise((r) => requestAnimationFrame(r)); return Math.round(document.querySelector('aside[aria-label^=Hop]').getBoundingClientRect().width); });
  await t.page.mouse.up();
  await t.check(`${m}5 resize: the width follows the pointer at once (${mid}px one frame after a 40px drag; transition ${panel})`, mid === 328 && panel === '0s');
  await t.eval(() => document.querySelector('[role=separator]').focus());
  await t.page.keyboard.press('End');
  await t.wait(50);
  await t.check(`${m}5 keyboard resize is instant too`, async () => (await t.eval(() => Math.round(document.querySelector('aside[aria-label^=Hop]').getBoundingClientRect().width))) === 368);

  // 6. History's person pills switch at once
  await t.eval(() => document.querySelector('nav[aria-label=Pages] button:nth-child(2)').click());
  await t.settle();
  const chips = await t.eval(async () => {
    const [everyone, amara] = document.querySelectorAll('[aria-label="Show briefs from"] button');
    amara.click();
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    return { t: getComputedStyle(amara).transitionDuration, amara: getComputedStyle(amara).backgroundColor, everyone: getComputedStyle(everyone).backgroundColor };
  });
  await t.check(`${m}6 person pills: Amara is dark and Everyone light two frames after the click (no transition: ${chips.t})`, chips.t === '0s' && chips.amara === 'rgb(26, 26, 24)' && chips.everyone !== 'rgb(26, 26, 24)');
  await t.check(`${m}1 other pages keep their top-bar icon`, () => t.eval(() => !!document.querySelector('main header h1 svg')));
}
