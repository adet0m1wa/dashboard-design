// The brief's final end-to-end test (10 flows), as one journey through the prototype, plus the
// feedback-round features (collapsible sidebars, highlight mode). Screenshots of each main state
// go to --out (docs/screenshots for the report). Check labels start with the flow number.
//   node scripts/flow.mjs scripts/flows/final.mjs --out=docs/screenshots [--reduced]
const log = () => document.querySelector('[role=log]')?.innerText ?? '';
const chips = () => [...document.querySelectorAll('aside[aria-label=Hop] button')].filter((b) => b.textContent.startsWith('Go to')).map((b) => `${b.textContent.trim()}${b.getAttribute('aria-disabled') === 'true' ? '(off)' : '(on)'}`).join(' | ');
const cues = () => [...document.querySelectorAll('aside[aria-label=Hop] button')].some((b) => b.textContent === 'Any flags?');
const lineY = () => Number([...document.querySelectorAll('#kpi-chart path')].find((p) => p.getAttribute('stroke-width') === '2').getAttribute('d').match(/-?\d+(\.\d+)?/g)[1]);
const title = () => document.querySelector('#kpi-chart')?.closest('[data-hop-frame]')?.querySelector('h3')?.textContent;
const cardTitle = () => document.querySelector('[data-hop-frame="analytics.card"] h3')?.textContent;
const revenue = () => document.querySelector('#kpi-tab-revenue .text-20')?.textContent;
const selected = (sel) => !!document.querySelector(`${sel} > span[aria-hidden] .border-selection`);
const HIGHLIGHT = 'button[aria-label="Highlight a frame"]';
const SAND = '[data-hop-frame="analytics.card.linen-sand"]';
const ADIRE = '[data-hop-frame="inventory.row.adire-blue"]';
const nav = (i) => document.querySelector(`nav[aria-label=Pages] button:nth-child(${i})`).click();

export default async function (t) {
  await t.goto('/analytics');
  const reduced = await t.eval(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const m = reduced ? '[reduced] ' : '';
  const shot = (name) => t.shot(`${reduced ? 'reduced-' : ''}${name}`);

  // ---- 1. Analytics first load -------------------------------------------------------------
  await t.page.goto((process.env.HOP_URL ?? 'http://localhost:3000') + '/analytics', { waitUntil: 'domcontentloaded' });
  await t.page.waitForSelector('#kpi-tab-revenue');
  await t.wait(150);
  const early = await t.eval(revenue);
  await t.wait(2600);
  const settled = await t.eval(revenue);
  if (reduced) await t.check(`[reduced] 1 first load: no count-up (${early} → ${settled})`, early === '$9,900' && settled === '$9,900');
  else await t.check(`1 first load: the entrance counts revenue up (${early} → ${settled})`, early !== '$9,900' && settled === '$9,900'); // the week so far (feedback 2026-10-04)
  await t.check(`${m}1 first load: prompt cues, "Click the … to select a frame", sidebar open, Hop open`, async () =>
    (await t.eval(cues)) &&
    (await t.eval(() => document.querySelector('.shadow-composer').textContent.includes('to select a frame') && document.querySelector('aside[aria-label=Sidebar]').offsetWidth === 224 && document.querySelector('aside[aria-label=Hop]').offsetWidth === 368)),
  );
  await t.page.mouse.move(700, 880);
  await shot('01-analytics-first-load');

  // ---- 2. KPI switching: chart morph, counts, card swap, equal heights ------------------------
  const y0 = await t.eval(lineY);
  await t.click('#kpi-tab-orders');
  await t.wait(150);
  const yMid = await t.eval(lineY);
  await t.wait(700);
  const y1 = await t.eval(lineY);
  if (reduced) await t.check(`[reduced] 2 KPI: chart swaps at once (${y0.toFixed(1)} → ${yMid.toFixed(1)} → ${y1.toFixed(1)})`, yMid === y1);
  else await t.check(`2 KPI: the line morphs, eased (${y0.toFixed(1)} → ${yMid.toFixed(1)} at 150ms → ${y1.toFixed(1)})`, (yMid - y0) / (y1 - y0) > 0.5 && yMid !== y1);
  await t.check(`${m}2 KPI: chart title + card swap to Orders ("${await t.eval(title)}" / "${await t.eval(cardTitle)}")`, async () =>
    (await t.eval(title)).startsWith('Orders') && (await t.eval(cardTitle)) === 'Orders',
  );
  await t.check(`${m}2 KPI: the two cards are the same height`, () =>
    t.eval(() => {
      const [a, b] = [...document.querySelector('[data-hop-frame="analytics.card"]').closest('.grid').children].map((c) => c.getBoundingClientRect().height);
      return Math.abs(a - b) < 1;
    }),
  );
  await t.page.mouse.move(700, 880);
  await shot('02-kpi-orders');
  await t.click('#kpi-tab-dms');
  await t.wait(700);
  await t.check(`${m}2 KPI: Unanswered DMs draws the chart red`, () => t.eval(() => getComputedStyle([...document.querySelectorAll('#kpi-chart path')].find((p) => p.getAttribute('stroke-width') === '2')).stroke === 'rgb(194, 65, 12)'));
  await shot('02b-kpi-dms');
  await t.click('#kpi-tab-revenue');
  await t.wait(700);

  // ---- 3. Chart: hover, select a day, back to today, week toggle -----------------------------
  const wed = await t.eval(() => {
    const d = [...document.querySelectorAll('[aria-label=Days] > *')][2].getBoundingClientRect();
    const svg = document.querySelector('#kpi-chart').getBoundingClientRect();
    return { x: d.x + d.width / 2, y: svg.y + svg.height / 2 };
  });
  await t.page.mouse.move(wed.x, wed.y);
  await t.wait(300);
  await t.check(`${m}3 chart: hovering Wednesday shows its tooltip`, () => t.eval(() => [...document.querySelectorAll('#kpi-chart ~ [role=status]')].some((s) => s.textContent.includes('$3,120'))));
  await shot('03-chart-hover');
  await t.page.mouse.click(wed.x, wed.y);
  await t.wait(800);
  await t.check(`${m}3 chart: clicking selects Wednesday ("${await t.eval(title)}", revenue ${await t.eval(revenue)})`, async () => (await t.eval(title)) === 'Wednesday, 23 Sep' && (await t.eval(revenue)) === '$3,120');
  await t.page.mouse.move(700, 880);
  await shot('03b-day-selected');
  // Today is a day like the others; picked again it goes back to the week so far (feedback 2026-10-04)
  await t.click('button[aria-label="Today"]');
  await t.wait(700);
  await t.check(`${m}3 chart: Today shows today ("${await t.eval(title)}", ${await t.eval(revenue)})`, async () => (await t.eval(title)) === 'Today, Thursday, 24 Sep' && (await t.eval(revenue)) === '$2,480');
  await t.click('button[aria-label="Today"]');
  await t.wait(700);
  await t.check(`${m}3 chart: Today again goes back to the week`, async () => (await t.eval(title)) === 'Revenue so far for this week' && (await t.eval(revenue)) === '$9,900');
  await t.click('text=Last week');
  await t.wait(900);
  await t.check(`${m}3 chart: week toggle → last week`, async () => (await t.eval(title)) === 'Last week · 14–20 Sep');
  await shot('03c-last-week');
  await t.click('text=This week');
  await t.wait(900);

  // ---- 4. Prompt cue → typing → streamed answer → New chat ----------------------------------
  await t.click('text=How are we doing today?');
  await t.wait(150);
  const typing = await t.eval(() => !!document.querySelector('[aria-label="Hop is typing"]'));
  await t.page.waitForFunction(() => !document.querySelector('[aria-label="Hop is typing"]'), { timeout: 3000 });
  await t.wait(60);
  const partial = (await t.eval(log)).length;
  await t.wait(3000);
  const full = (await t.eval(log)).length;
  await t.check(`${m}4 cue: bubble, typing dots, answer streams in (${partial} → ${full} chars)`, typing && partial < full && (await t.eval(log)).includes('Amara · 2:31 PM'));
  await shot('04-cue-answer');
  await t.click('button[aria-label="New chat"]');
  await t.wait(600);
  await t.check(`${m}4 New chat: panel empties, cues come back`, async () => (await t.eval(log)) === '' && (await t.eval(cues)));

  // ---- 5. Highlight → pick a product row → jump chips → tagged question → scan → answer -----
  const row = await (await t.page.$(SAND)).boundingBox();
  await t.page.mouse.click(row.x + 120, row.y + 10);
  await t.wait(200);
  await t.check(`${m}5 highlight off: clicking the row doesn't pick it`, async () => !(await t.eval(selected, SAND)));
  await t.click(HIGHLIGHT);
  await t.page.mouse.move(row.x + 120, row.y + 12);
  await t.wait(200);
  await t.check(`${m}5 highlight on: hover shows the blue highlight on the card's strokes`, () =>
    t.eval((s) => {
      const o = document.querySelector(`${s} > span[aria-hidden].border-selection`)?.getBoundingClientRect();
      const card = document.querySelector('[data-hop-frame="analytics.card"]').getBoundingClientRect();
      return !!o && Math.abs(o.left - card.left) < 0.6 && Math.abs(o.right - card.right) < 0.6;
    }, SAND),
  );
  await t.page.mouse.click(row.x + 120, row.y + 12);
  await t.wait(500);
  await t.check(`${m}5 pick: outline + handles, tag in the composer, jump chips (${await t.eval(chips)})`, async () =>
    (await t.eval(selected, SAND)) && (await t.eval(() => !!document.querySelector('[aria-label="Remove Linen two-piece (Sand)"]'))) && (await t.eval(chips)) === 'Go to Inventory(on) | Go to Analytics(off)',
  );
  await t.page.mouse.move(700, 880);
  await shot('05-row-selected');
  await t.click('textarea[aria-label="Message Hop"]');
  await t.wait(250); // the border colour eases over 120ms
  await t.check(`${m}5 composer: its border turns blue while typing`, () => t.eval(() => getComputedStyle(document.querySelector('.shadow-composer')).borderTopColor === 'rgb(37, 99, 235)'));
  await t.page.keyboard.press('Enter');
  await t.wait(250);
  await t.check(`${m}5 send: tagged bubble, frame scanning`, async () =>
    (await t.eval(log)).includes('Tell me more about this') &&
    (await t.eval((s, r) => (r ? document.body.innerText.includes('Hop is reading…') : !!document.querySelector(`${s} [class*="via-selection"]`)), SAND, reduced)),
  );
  await shot('05b-scanning');
  await t.wait(3500);
  await t.check(`${m}5 answer: Sand answer + Sizes left; highlight and chips cleared (no cues: the chat has started)`, async () =>
    (await t.eval(log)).includes('Sizes left') && !(await t.eval(selected, SAND)) && (await t.eval(chips)) === '' && !(await t.eval(cues)),
  );
  await t.page.mouse.move(700, 880);
  await shot('05c-answered');

  // ---- 6. Clicking the tag brings the highlight back -----------------------------------------
  await t.click('button[aria-label="Show Linen two-piece (Sand) on the page"]');
  await t.wait(600);
  await t.check(`${m}6 tag click: tag turns active, row highlighted again, chips back`, async () =>
    (await t.eval(() => document.querySelector('button[aria-label="Show Linen two-piece (Sand) on the page"]').getAttribute('aria-pressed') === 'true')) &&
    (await t.eval(selected, SAND)) &&
    (await t.eval(chips)) === 'Go to Inventory(on) | Go to Analytics(off)',
  );
  await t.page.mouse.move(700, 880);
  await shot('06-tag-clicked');

  // ---- 7. Inventory: jump, chips flip, marker only with a tagged question, chips stay --------
  await t.click('text=Go to Inventory');
  await t.wait(100);
  await t.settle();
  await t.check(`${m}7 jump: on Inventory, chips flipped (${await t.eval(chips)}), no marker for the move alone`, async () =>
    (await t.eval(() => location.pathname)) === '/inventory' && (await t.eval(chips)) === 'Go to Inventory(off) | Go to Analytics(on)' && !(await t.eval(log)).includes('Moved to'),
  );
  await t.click(HIGHLIGHT);
  await t.click(`${ADIRE} span.truncate`);
  await t.wait(300);
  await t.click('textarea[aria-label="Message Hop"]');
  await t.page.keyboard.type('What am I seeing?');
  await t.page.keyboard.press('Enter');
  await t.wait(4000);
  // The clock kept running after flow 4's question (2:31): Sand 2:32, marker 2:33, Adire 2:34.
  await t.check(`${m}7 marker "Moved to Inventory · 2:33 PM" lands right before the 2:34 question`, async () => {
    const l = await t.eval(log);
    const marker = l.indexOf('Moved to Inventory · 2:33 PM');
    return marker > 0 && marker > l.indexOf('Amara · 2:32 PM') && marker < l.indexOf('What am I seeing?') && l.includes('Amara · 2:34 PM') && l.includes('Notify me when back');
  });
  await t.check(`${m}7 after the answer: nothing selected, chips stay`, async () => !(await t.eval(selected, ADIRE)) && (await t.eval(chips)) === 'Go to Inventory(off) | Go to Analytics(on)');
  await t.page.mouse.move(700, 880);
  await shot('07-inventory-marker-chips-stay');
  await t.click('text=Go to Analytics');
  await t.wait(100);
  await t.settle();
  await t.check(`${m}7 Go to Analytics: back, chips gone`, async () => (await t.eval(() => location.pathname)) === '/analytics' && (await t.eval(chips)) === '');
  await t.click('button[aria-label="New chat"]'); // saves this thread to History (flow 9)
  await t.wait(600);

  // ---- 8. Sidebar to every page (sliding pill), collapsing sidebar and Hop -------------------
  for (const [i, path] of [[2, '/history'], [3, '/sales'], [4, '/instagram'], [5, '/inventory'], [6, '/customers'], [1, '/analytics']]) {
    const from = await t.eval(() => document.querySelector('[aria-current=page] > span')?.getBoundingClientRect().y);
    await t.eval(nav, i);
    await t.wait(40);
    const mid = await t.eval(() => document.querySelector('[aria-current=page] > span')?.getBoundingClientRect().y);
    await t.settle();
    const to = await t.eval(() => document.querySelector('[aria-current=page] > span')?.getBoundingClientRect().y);
    const slid = Math.abs(mid - to) < 1; // instant: the pill is already there 40ms after the click
    await t.check(`${m}8 sidebar → ${path}: page, title and pill (${from?.toFixed(0)} → ${mid?.toFixed(0)} → ${to?.toFixed(0)})`, async () =>
      slid && (await t.eval(() => location.pathname)) === path && (await t.eval(() => document.title.startsWith(document.querySelector('main header h1').textContent.trim()))),
    );
    if (path === '/sales') await shot('08-sales');
  }
  await t.click('button[aria-label="Collapse sidebar"]');
  await t.wait(700);
  await t.click('button[aria-label="Close Hop"]');
  await t.wait(700);
  await t.check(`${m}8 sidebar and Hop collapse to 56 / 63; the chart fills the page`, async () =>
    (await t.eval(() => [document.querySelector('aside[aria-label=Sidebar]').offsetWidth, document.querySelector('aside[aria-label=Hop]').offsetWidth].join('/'))) === '56/63' &&
    (await t.eval(() => document.querySelector('#kpi-chart').getBoundingClientRect().width)) > 1100,
  );
  await t.page.mouse.move(700, 880);
  await shot('08b-both-collapsed');
  await t.click('button[aria-label="Open Hop"]');
  await t.click('button[aria-label="Expand sidebar"]');
  await t.wait(700);

  // ---- 9. History: the three kinds, filters, trail, Expand → chat → Back ---------------------
  await t.eval(nav, 2);
  await t.settle(400);
  const items = () => [...document.querySelectorAll('[data-history-panel] li')].map((li) => li.querySelector('.text-13-5')?.textContent);
  const note = () => document.querySelector('[data-page=history] p.bg-surface-subtle')?.textContent ?? '';
  const pick = (q) => [...document.querySelectorAll('[data-history-panel] li')].find((li) => li.textContent.includes(q)).querySelector('button[aria-current]').click();
  await t.check(`${m}9 History: the list sits in the side panel under Hop; saved threads on top (${(await t.eval(items)).slice(0, 2).join(' / ')})`, async () =>
    (await t.eval(() => document.querySelector('aside[aria-label^=Hop]').offsetWidth)) === 368 && (await t.eval(items))[0] === 'What am I seeing?' && (await t.eval(items)).length === 9,
  );
  await t.check(`${m}9 tagged kind: Inventory card with the Adire outline`, async () =>
    (await t.eval(note)).startsWith('Screenshot of Inventory — taken at 2:33 PM') && (await t.eval(() => !!document.querySelector('[data-page=history] .shadow-screenshot-card [data-hop-frame="inventory.row.adire-blue"] .border-selection'))),
  );
  await t.page.mouse.move(700, 880);
  await shot('09-history-tagged');
  await t.eval(pick, '2:14 PM');
  await t.wait(900);
  await t.check(`${m}9 analytics kind: "${await t.eval(note)}"`, async () => (await t.eval(note)) === 'Analytics as it was at 2:14 PM, Thu 24 Sep — when Amara asked');
  await shot('09b-history-analytics');
  await t.eval(pick, 'Why is the Sand reel');
  await t.wait(900);
  await t.check(`${m}9 screenshot kind: the Instagram page in a card`, async () => (await t.eval(note)).startsWith('Screenshot of Instagram') && (await t.eval(() => document.querySelector('[data-page=history] [inert] h2.truncate')?.textContent === 'Styling the Sand set 3 ways')));
  await shot('09c-history-screenshot');
  await t.click('button[aria-pressed][class*=rounded-999]:nth-of-type(3)'); // Ife
  await t.wait(700);
  await t.check(`${m}9 filter Ife: one brief, trail ends hidden`, async () =>
    (await t.eval(items)).join('|') === 'Draft a restock plan for the linen sets' &&
    (await t.eval(() => [...document.querySelectorAll('[data-history-panel] li [aria-hidden=true] > .hop-trail')].length)) === 0,
  );
  await t.click('button[aria-pressed][class*=rounded-999]:nth-of-type(1)');
  await t.wait(700);
  await t.check(`${m}9 Everyone: the dotted trail runs between briefs`, () => t.eval(() => document.querySelectorAll('[data-history-panel] .hop-trail').length > 8));
  await t.eval(pick, 'Amara · 2:33 PM');
  await t.wait(600);
  await t.click('button[aria-label^="Open the chat"]');
  await t.wait(1300);
  await t.check(`${m}9 Expand: the whole thread with Back; the question in view`, () =>
    t.eval(() => {
      const logEl = document.querySelector('[data-history-panel] [role=log]');
      return !!logEl && logEl.innerText.includes('Moved to Inventory · 2:32 PM') && document.activeElement?.textContent.trim() === 'Back';
    }),
  );
  await shot('09d-history-expanded');
  await t.click('button[aria-label="Back to the brief list"]');
  await t.wait(900);
  await t.check(`${m}9 Back: the chain again, same brief selected`, async () =>
    (await t.eval(() => document.querySelector('[data-history-panel] button[aria-current="true"]')?.closest('li').textContent.includes('2:33 PM'))) === true,
  );

  // ---- 10. Reduced motion = the --reduced run of this file; keyboard-only = phase8.mjs;
  // console errors/warnings are collected for the whole journey by flow.mjs.
  await t.eval(nav, 1);
  await t.wait(900);
}
