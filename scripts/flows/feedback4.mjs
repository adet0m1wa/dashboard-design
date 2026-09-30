// Feedback round 4 (2026-09-30): nothing flies between the live page and History's snapshots; the
// bottom card follows the KPI in every period, is titled with the KPI's name and keeps one height
// (so Urgent never moves); the composer hint shows the highlight icon; the Urgent card can be
// picked; "All pages" is 105 wide; the selected brief follows a panel resize at once.
const HIGHLIGHT = 'button[aria-label="Highlight a frame"]';
const nav = (n) => `document.querySelector('nav[aria-label=Pages] button:nth-child(${n})').click()`;
const pickBrief = (time) => [...document.querySelectorAll('[data-history-panel] li')].find((li) => li.textContent.includes(time)).querySelector('button[aria-current]').click();
const week = (label) => [...document.querySelectorAll('main [role=radio]')].find((b) => b.textContent.includes(label)).click();

// Runs `act`, then records the KPI pill's and week thumb's boxes every frame for 400ms.
const track = (t, act) =>
  t.eval(async (actSrc) => {
    new Function(actSrc)();
    const out = [];
    const t0 = performance.now();
    while (performance.now() - t0 < 400) {
      await new Promise((r) => requestAnimationFrame(r));
      const pill = document.querySelector('main [role=tab][aria-selected=true] > span.absolute')?.getBoundingClientRect();
      const thumb = document.querySelector('main [role=radio][aria-checked=true] > span.absolute')?.getBoundingClientRect();
      out.push([pill?.x, pill?.y, thumb?.x, thumb?.y].map((v) => Math.round(v ?? -1)).join(','));
    }
    return new Set(out).size;
  }, act);

export default async function (t) {
  const base = process.env.HOP_URL ?? 'http://localhost:3000';
  await t.page.goto(base + '/history', { waitUntil: 'networkidle0' });
  await t.page.waitForSelector('[data-history-panel] li');
  const reduced = await t.eval(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const m = reduced ? '[reduced] ' : '';
  await t.wait(600);

  // 1. The KPI pill and week thumb never fly between the live page and a History snapshot
  await t.eval(pickBrief, '2:14 PM');
  await t.wait(900);
  const toLive = await track(t, nav(1));
  await t.check(`${m}1 History snapshot → Analytics: the KPI pill and week thumb don't move (${toLive} position)`, toLive === 1);
  await t.wait(2600);
  await t.click('#kpi-tab-orders');
  await t.eval(week, 'Last week');
  await t.wait(900);
  const toSnap = await track(t, nav(2));
  await t.check(`${m}1 Analytics (Orders, last week) → History snapshot (Revenue, this week): nothing flies (${toSnap} position)`, toSnap === 1);

  // 9. Resizing the panel: the selected brief's background keeps up with its row, frame by frame
  await t.eval(pickBrief, '8:00 AM');
  await t.wait(900);
  const h = await (await t.page.$('[role=separator]')).boundingBox();
  await t.page.mouse.move(h.x + 3, h.y + 300);
  await t.page.mouse.down();
  let worst = 0;
  for (let i = 1; i <= 6; i++) {
    await t.page.mouse.move(h.x + 3 + i * 10, h.y + 300);
    const gap = await t.eval(async () => {
      await new Promise((r) => requestAnimationFrame(r));
      const li = document.querySelector('[data-history-panel] li:has(button[aria-current=true])');
      const bg = li.querySelector(':scope > span.absolute');
      return Math.abs(bg.getBoundingClientRect().width - li.getBoundingClientRect().width);
    });
    worst = Math.max(worst, gap);
  }
  await t.page.mouse.up();
  await t.check(`${m}9 resize: the selected brief's background matches its row every frame (worst ${worst.toFixed(1)}px)`, worst < 1);

  // 8. "All pages" is 105 wide; the search takes the rest, 8px apart (panel back at full width)
  await t.eval(() => document.querySelector('[role=separator]').focus());
  await t.page.keyboard.press('End');
  await t.wait(100);
  const filters = await t.eval(() => {
    const menu = document.querySelector('[aria-label^="Show briefs asked on"]').parentElement.getBoundingClientRect();
    const search = document.querySelector('input[aria-label="Search briefs"]').closest('label').getBoundingClientRect();
    return { menu: menu.width, gap: Math.round(menu.left - search.right), search: Math.round(search.width), panel: Math.round(document.querySelector('aside[aria-label^=Hop]').getBoundingClientRect().width) };
  });
  await t.check(`${m}8 All pages box 105 wide, search ${filters.search}px, gap ${filters.gap}px (panel ${filters.panel})`, filters.panel === 368 && filters.menu === 105 && filters.gap === 8 && filters.search === 223);

  // 2–6. The bottom card: follows the KPI in every period, titled with the KPI, one height
  await t.eval(nav(1));
  await t.settle();
  await t.eval(week, 'This week');
  const periods = [
    ['this week, today', () => null],
    ['Wednesday', 'button[aria-label="Wed, show that day"]'],
    ['last week', 'week'],
  ];
  const seen = {};
  let allEqual = true;
  let titlesOk = true;
  let linkOk = true;
  for (const [label, how] of periods) {
    if (how === 'week') await t.eval(week, 'Last week');
    else if (typeof how === 'string') await t.click(how);
    await t.wait(300);
    for (const k of ['revenue', 'orders', 'likes', 'followers', 'dms']) {
      await t.click(`#kpi-tab-${k}`);
      await t.wait(reduced ? 150 : 700);
      const card = await t.eval(() => {
        const c = document.querySelector('[data-hop-frame="analytics.card"]');
        const urgent = document.querySelector('[data-hop-frame^="analytics.urgent"]:not([data-hop-frame*="urgent."])');
        const link = c.querySelector('h3 + div button');
        return {
          title: c.querySelector('h3').textContent,
          tab: document.querySelector('[role=tab][aria-selected=true] > span.relative').textContent,
          rows: [...c.querySelectorAll('[data-hop-frame^="analytics.card."]')].map((r) => r.textContent.slice(0, 12)).join('|'),
          h: c.getBoundingClientRect().height,
          u: urgent.getBoundingClientRect().height,
          linkCut: link.scrollWidth > link.clientWidth + 0.5,
        };
      });
      seen[`${label}:${k}`] = card.rows;
      if (card.h !== 246 || card.u !== 246) allEqual = false;
      if (card.title !== card.tab.replace(/ today$/, '')) titlesOk = false;
      if (card.linkCut) linkOk = false;
    }
  }
  const lw = ['revenue', 'orders', 'likes', 'followers', 'dms'].map((k) => seen[`last week:${k}`]);
  const wed = ['revenue', 'orders', 'likes', 'followers', 'dms'].map((k) => seen[`Wednesday:${k}`]);
  await t.check(`${m}3 last week: each KPI shows its own rows (${new Set(lw).size} different of 5)`, new Set(lw).size === 5);
  await t.check(`${m}3 a past day (Wed): each KPI shows its own rows (${new Set(wed).size} different of 5)`, new Set(wed).size === 5);
  await t.check(`${m}4 the card's title is the selected KPI's name, with no period, and its link is never cut`, titlesOk && linkOk);
  await t.check(`${m}5/6 every KPI in every period: both cards 246px`, allEqual);

  // 5. Switching to New followers: Urgent keeps its height on every frame
  await t.eval(week, 'This week');
  await t.click('#kpi-tab-likes');
  await t.wait(800);
  const urgentHeights = await t.eval(async () => {
    const u = document.querySelector('[data-hop-frame="analytics.urgent"]');
    document.querySelector('#kpi-tab-followers').click();
    const hs = new Set();
    const t0 = performance.now();
    while (performance.now() - t0 < 700) {
      await new Promise((r) => requestAnimationFrame(r));
      hs.add(Math.round(u.getBoundingClientRect().height * 10) / 10);
    }
    return [...hs];
  });
  await t.check(`${m}5 Likes → New followers: Urgent stays ${urgentHeights.join('/')}px throughout`, urgentHeights.length === 1 && urgentHeights[0] === 246);
  const bars = await t.eval(() => {
    const rows = [...document.querySelectorAll('[data-hop-frame^="analytics.card.source"]')].map((r) => r.getBoundingClientRect());
    return Math.round(rows[1].top - rows[0].bottom);
  });
  await t.check(`${m}6 New followers: the bars sit 20px apart (${bars}px)`, bars === 20);

  // 7. The hint shows the highlight icon; with highlight on it says to click a frame
  const hint = await t.eval(() => {
    const el = document.querySelector('aside[aria-label^=Hop] .shadow-composer span.bg-surface-subtle');
    return { text: el.textContent, icon: !!el.querySelector('svg') };
  });
  await t.check(`${m}7 hint: "${hint.text}" with the icon`, hint.text === 'Click the highlight button to select a frame' && hint.icon);
  await t.click(HIGHLIGHT);
  await t.wait(100);
  await t.check(`${m}7 highlight on: the hint says to click a frame`, () =>
    t.eval(() => document.querySelector('aside[aria-label^=Hop] .shadow-composer').textContent.includes('Click any frame to select it')),
  );

  // 7. The whole Urgent card can be picked and asked about
  await t.click('[data-hop-frame="analytics.urgent"] > h3');
  await t.wait(300);
  await t.check(`${m}7 Urgent card picked: its tag is in the composer`, () =>
    t.eval(() => document.querySelector('aside[aria-label^=Hop] .shadow-composer').textContent.includes('Urgent')),
  );
  await t.click('textarea[aria-label="Message Hop"]');
  await t.page.keyboard.press('Enter');
  await t.wait(reduced ? 3500 : 4500);
  await t.check(`${m}7 Hop answers about today's Urgent items`, () => t.eval(() => document.querySelector('aside[aria-label^=Hop]').textContent.includes('Three things need you today')));
  await t.eval(week, 'Last week');
  await t.wait(400);
  await t.check(`${m}7 last week's Urgent card is its own frame`, () => t.eval(() => !!document.querySelector('[data-hop-frame="analytics.urgent-lastWeek"]')));

  // Bug found in the check: a tag in the chat brings back the view it was asked in, so its frame
  // is there to highlight (it used to point at nothing after a KPI or week change).
  await t.click('#kpi-tab-orders');
  await t.wait(300);
  await t.click('button[aria-label="Show Urgent on the page"]');
  await t.wait(500);
  const back = await t.eval(() => ({
    kpi: document.querySelector('[role=tab][aria-selected=true]').id,
    week: document.querySelector('main [role=radio][aria-checked=true]').textContent,
    lit: !!document.querySelector('[data-hop-frame="analytics.urgent"] .border-selection'),
  }));
  // It was asked with New followers on, this week.
  await t.check(`${m}tag clicked from last week + Orders: back to ${back.kpi}, ${back.week}, Urgent highlighted (${back.lit})`, back.kpi === 'kpi-tab-followers' && back.week.includes('This week') && back.lit);
}
