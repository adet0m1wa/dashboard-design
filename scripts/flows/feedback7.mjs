// Feedback round 7 (2026-10-01): Sales keeps one orders-card size across every filter and
// period; this week / last week like Analytics (days not reached have no data), Monthly and All
// time from the period menu (all time from #1, dates dd/mm/yy); Customers puts the details on the
// left (250, like Instagram's list) with every order in a list whose height drags, and the inbox
// and chat side by side with a drag handle; one stroke where a page meets the side panel; a
// calendar on Instagram; 3px scrollbars.
const nav = (n) => `document.querySelector('nav[aria-label=Pages] button:nth-child(${n})').click()`;
const radio = (label) => [...document.querySelectorAll('main [role=radio]')].find((b) => b.textContent.trim().startsWith(label)).click();
const ordersCard = () => {
  const card = document.querySelector('[data-hop-frame^="sales.orders."]');
  return { h: Math.round(card.getBoundingClientRect().height), count: Number(card.querySelector('h2 span').textContent.replace(/,/g, '')), id: card.dataset.hopFrame };
};
const period = async (t, label) => {
  await t.click('button[aria-label^="Period"]');
  await t.wait(200);
  await t.eval((l) => [...document.querySelectorAll('[role=option]')].find((o) => o.textContent === l).click(), label);
  await t.wait(200);
};

export default async function (t) {
  const base = process.env.HOP_URL ?? 'http://localhost:3000';
  await t.goto('/sales');
  const reduced = await t.eval(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const m = reduced ? '[reduced] ' : '';

  // 1. One size for the orders card, whatever the filter or the period
  const sizes = [];
  for (const [p, which] of [['Weekly', 'This week'], ['Weekly', 'Last week'], ['Monthly', 'This month'], ['Monthly', 'Last month'], ['All time', null]]) {
    if (sizes.length === 0 || p !== sizes.at(-1).p) await period(t, p);
    if (which) await t.eval(radio, which);
    for (const f of ['All', 'To pack', 'Shipped', 'Delivered']) {
      await t.eval(radio, f);
      await t.wait(60);
      sizes.push({ p, which, f, ...(await t.eval(ordersCard)) });
    }
    await t.eval(radio, 'All');
  }
  const heights = [...new Set(sizes.map((s) => s.h))];
  await t.check(`${m}1 the orders card is ${heights.join('/')}px across 5 periods × 4 filters`, heights.length === 1 && heights[0] > 250);

  // 2. This week / last week, like Analytics; days not reached have no data
  await period(t, 'Weekly');
  await t.eval(radio, 'This week');
  await t.wait(450); // the tiles count to their new values (round 8)
  const week = await t.eval(() => {
    const tiles = [...document.querySelectorAll('[data-hop-frame^="sales.tile."]')].map((f) => f.textContent);
    const ticks = [...document.querySelectorAll('[data-hop-frame^="sales.chart."] .relative.h-\\[15px\\] > *')].map((s) => ({ label: s.textContent, x: Math.round(parseFloat(s.style.left)) }));
    const dot = document.querySelector('[data-hop-frame^="sales.chart."] circle.fill-status-success'); // the filled one: there's a dot on every day since round 8
    return { tiles, ticks, dotX: Math.round(Number(dot.getAttribute('cx'))), dashed: !!document.querySelector('[data-hop-frame^="sales.chart."] path[stroke-dasharray]') };
  });
  const todayX = week.ticks.find((tk) => tk.label === 'Today')?.x;
  await t.check(`${m}2 this week: revenue $9,900 and 131 orders (Mon–Thu, as Analytics)`, week.tiles[0].includes('$9,900') && week.tiles[1].includes('131'));
  await t.check(`${m}2 this week: the line stops at today (dot at x ${week.dotX}, Today at ${todayX}); Fri–Sun on a dashed baseline`, week.dotX === todayX && week.dashed && week.ticks.map((tk) => tk.label).join(' ') === 'Mon Tue Wed Today Fri Sat Sun');
  await t.eval(radio, 'Last week');
  await t.wait(450); // the tiles count to their new values (round 8)
  const last = await t.eval(() => [...document.querySelectorAll('[data-hop-frame^="sales.tile."]')].map((f) => f.textContent));
  await t.check(`${m}2 last week: $15,810 and 209 orders (Analytics' last week)`, last[0].includes('$15,810') && last[1].includes('209'));
  await t.eval(radio, 'This week');

  // 2b. Days can be picked as on Analytics (feedback 2026-10-02): a label, ← →, the same day or Esc
  const dayState = () =>
    t.eval(() => ({
      title: document.querySelector('[data-hop-frame^="sales.chart."] h2').textContent,
      revenue: document.querySelector('[data-hop-frame^="sales.tile.revenue."]').textContent,
      orders: Number(document.querySelector('[data-hop-frame^="sales.orders."] h2 span').textContent.replace(/,/g, '')),
      h: Math.round(document.querySelector('[data-hop-frame^="sales.orders."]').getBoundingClientRect().height),
    }));
  await t.click('button[aria-label="Wednesday, 23 Sep, show that day"]');
  await t.wait(450); // the tiles count to their new values (round 8)
  const wed = await dayState();
  await t.eval(() => document.querySelector('[data-hop-frame^="sales.chart."] [role=group][tabindex]').focus());
  await t.page.keyboard.press('ArrowLeft');
  await t.wait(450); // the tiles count to their new values (round 8)
  const tue = await dayState();
  await t.page.keyboard.press('Escape');
  await t.wait(450); // the tiles count to their new values (round 8)
  const whole = await dayState();
  await t.check(
    `${m}2b pick Wed: "${wed.title}", ${wed.revenue.replace('Revenue', '')}, ${wed.orders} orders; ← "${tue.title}" (${tue.orders}); Esc "${whole.title}" (${whole.orders}); card ${wed.h}/${tue.h}/${whole.h}px`,
    wed.title === 'Wednesday, 23 Sep' && wed.revenue.includes('$3,120') && wed.orders === 41 && tue.title === 'Tuesday, 22 Sep' && tue.orders === 30 && whole.title === 'Revenue by day' && whole.orders === 131 && wed.h === whole.h && tue.h === whole.h,
  );
  await t.click('button[aria-label="Today, Thursday, 24 Sep, show that day"]');
  await t.wait(450); // the tiles count to their new values (round 8)
  const today = await dayState();
  await t.click('button[aria-label="Today, Thursday, 24 Sep, show that day"]');
  await t.wait(450); // the tiles count to their new values (round 8)
  await t.check(`${m}2b today: ${today.revenue.replace('Revenue', '')} and ${today.orders} orders (Analytics' today); picked again it lets go ("${(await dayState()).title}")`, today.revenue.includes('$2,480') && today.orders === 34 && (await dayState()).title === 'Revenue by day');

  // 3. Monthly and All time; all time starts at #1, its dates read dd/mm/yy
  await period(t, 'Monthly');
  const months = await t.eval(() => [...document.querySelectorAll('main [role=radio]')].map((b) => b.textContent.trim()).slice(0, 2).join(' / '));
  await t.check(`${m}3 Monthly: the toggle reads "${months}"`, months === 'This month / Last month');
  await period(t, 'All time');
  const all = await t.eval(() => {
    const rows = [...document.querySelectorAll('[data-hop-frame^="sales.order."]')];
    return { toggle: !!document.querySelector('[data-hop-frame^="sales.chart."] [role=radiogroup]'), first: rows[0]?.querySelector('[role=cell]').textContent, placed: rows[0]?.querySelector('[role=cell]:last-child').textContent, drawn: rows.length };
  });
  const count = (await t.eval(ordersCard)).count;
  await t.check(`${m}3 All time: no toggle, ${count} orders, first row ${all.first}, placed "${all.placed}"`, !all.toggle && count === 1098 && all.first === '#1' && /^\d\d\/\d\d\/\d\d, \d{1,2}:\d\d [AP]M$/.test(all.placed));
  const bottom = await t.eval(async () => {
    const list = document.querySelector('[data-hop-frame^="sales.orders."] [role=rowgroup]');
    list.scrollTop = list.scrollHeight;
    await new Promise((r) => setTimeout(r, 150));
    const rows = [...document.querySelectorAll('[data-hop-frame^="sales.order."]')];
    return rows.at(-1).querySelector('[role=cell]').textContent;
  });
  await t.check(`${m}3 all time: only ${all.drawn} of 1,098 rows drawn; scrolled to the end it's ${bottom}`, all.drawn < 40 && bottom === '#1098');
  // A chat tag on a row deep in all time brings the period back and scrolls the row into view
  await t.eval(() => {
    const list = document.querySelector('[data-hop-frame^="sales.orders."] [role=rowgroup]');
    list.scrollTop = 599 * 49 - 100;
  });
  await t.wait(150);
  await t.click('button[aria-label="Highlight a frame"]');
  await t.click('[data-hop-frame="sales.order.600"] [role=cell]');
  await t.click('textarea[aria-label="Message Hop"]');
  await t.page.keyboard.press('Enter');
  const asked = await t.page.waitForFunction(() => document.querySelector('aside[aria-label^=Hop]').textContent.includes('Order #600 from'), { timeout: 10000 }).then(() => true, () => false);
  await period(t, 'Weekly');
  await t.click('button[aria-label="Show Order #600 on the page"]');
  await t.wait(900);
  const restored = await t.eval(() => ({
    period: document.querySelector('button[aria-label^="Period"]').textContent,
    row: !!document.querySelector('[data-hop-frame="sales.order.600"]'),
    selected: !!document.querySelector('[data-hop-frame="sales.order.600"] .border-selection'),
  }));
  await t.check(`${m}3 Hop answers about #600 (${asked}); its tag brings back "${restored.period}" with the row drawn (${restored.row}) and outlined (${restored.selected})`, asked && restored.period === 'All time' && restored.row && restored.selected);
  await t.page.keyboard.press('Escape');
  await period(t, 'Weekly');

  // 4. One stroke where a page meets the side panel, on every page, at 1440 and at 1336
  let doubles = [];
  for (const w of [1440, 1336]) {
    await t.page.setViewport({ width: w, height: 900, deviceScaleFactor: 1 });
    for (const p of ['analytics', 'history', 'sales', 'instagram', 'inventory', 'customers']) {
      await t.page.goto(`${base}/${p}`, { waitUntil: 'networkidle0' });
      await t.wait(p === 'analytics' ? 2600 : 600);
      const hits = await t.eval(() => {
        const panel = document.querySelector('aside[aria-label^=Hop]').getBoundingClientRect();
        return [...document.querySelectorAll('main *')].filter((el) => {
          const r = el.getBoundingClientRect();
          const cs = getComputedStyle(el);
          return r.width && r.height && parseFloat(cs.borderRightWidth) > 0 && Math.abs(r.right - panel.left) <= 2;
        }).length;
      });
      if (hits) doubles.push(`${p}@${w}: ${hits}`);
    }
  }
  await t.page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await t.check(`${m}4 no page draws its own line against the side panel's (${doubles.join(', ') || 'none'})`, doubles.length === 0);

  // 3/5. Customers: details on the left, 250 wide; inbox and chat with a drag handle between
  await t.page.goto(`${base}/customers`, { waitUntil: 'networkidle0' });
  await t.wait(600);
  const layout = await t.eval(() => {
    const details = document.querySelector('[data-hop-frame^="customers.profile."]').getBoundingClientRect();
    const inbox = document.querySelector('ul[aria-label=Conversations]').getBoundingClientRect();
    const chat = document.querySelector('[data-hop-frame="customers.thread"]').getBoundingClientRect();
    const header = document.querySelector('[data-hop-frame="customers.thread"] > div').textContent;
    const orders = document.querySelectorAll('[data-hop-frame^="customers.order."]').length;
    const tile = document.querySelector('[data-hop-frame^="customers.profile."]').textContent;
    return { order: details.right <= inbox.left + 1 && details.right <= chat.left + 1 && chat.bottom <= inbox.top + 1, width: Math.round(details.width), header, orders, tile };
  });
  await t.check(`${m}3 Customers: details (${layout.width}px) on the left; the chat with the conversation list under it`, layout.order && layout.width === 250);
  await t.check(`${m}5 the chat header is the name alone; handle and city are in the details`, !layout.header.includes('@chioma') && layout.tile.includes('@chioma.styles') && layout.tile.includes('Lagos'));
  await t.check(`${m}5 every one of Chioma's ${layout.orders} orders is listed, #1042 among them`, layout.orders === 7 && layout.tile.includes('#1042'));

  const handle = async (label) => (await t.page.$(`[role=separator][aria-label="${label}"]`)).boundingBox();
  const inboxW = () => t.eval(() => Math.round(document.querySelector('ul[aria-label=Conversations]').parentElement.getBoundingClientRect().height));
  const w0 = await inboxW();
  const hb = await handle('Conversation list height');
  await t.page.mouse.move(hb.x + 200, hb.y + hb.height / 2);
  await t.page.mouse.down();
  await t.page.mouse.move(hb.x + 200, hb.y + hb.height / 2 - 30, { steps: 4 });
  await t.page.mouse.up();
  const w1 = await inboxW();
  await t.eval(() => document.querySelector('[role=separator][aria-label="Conversation list height"]').focus());
  await t.page.keyboard.press('ArrowDown');
  const w2 = await inboxW();
  await t.check(`${m}3 the conversation list's height drags ${w0} → ${w1} and steps back to ${w2} with ↓`, w1 === w0 + 30 && w2 === w1 - 8);

  const listH = () => t.eval(() => Math.round(document.querySelector('section[aria-labelledby=customer-orders]').getBoundingClientRect().height));
  const h0 = await listH();
  const ob = await handle('Order list height');
  await t.page.mouse.move(ob.x + 100, ob.y + ob.height / 2);
  await t.page.mouse.down();
  await t.page.mouse.move(ob.x + 100, ob.y + ob.height / 2 + 60, { steps: 4 });
  await t.page.mouse.up();
  const h1 = await listH();
  await t.check(`${m}5 the order list's height drags: ${h0} → ${h1}px`, h1 === h0 - 60);

  // 6. Instagram: the calendar, days with posts dotted, a day's posts listed
  await t.eval(nav(4));
  await t.settle();
  const icon = await t.eval(() => {
    const b = document.querySelector('button[aria-label="Show what was posted on a day"]');
    const svg = b.querySelector('svg').getBoundingClientRect();
    const heading = b.closest('div.justify-between').querySelector('h2')?.textContent;
    return { w: Math.round(svg.width), heading };
  });
  await t.click('button[aria-label="Show what was posted on a day"]');
  await t.wait(reduced ? 50 : 250);
  const cal = await t.eval(() => {
    const d = document.querySelector('[role=dialog][aria-label="Pick a day"]');
    return { month: d.querySelector('span[aria-live]').textContent, posted: d.querySelectorAll('button[data-day]').length, dots: d.querySelectorAll('button[data-day] > span').length };
  });
  await t.check(`${m}6 a ${icon.w}px calendar beside "${icon.heading}" opens ${cal.month}: ${cal.posted} days with posts, each dotted`, icon.w === 13 && icon.heading === 'Posted this week' && cal.month === 'September 2026' && cal.posted === 12 && cal.dots === 12);
  await t.click('button[data-day="40"]');
  await t.wait(150);
  const day = await t.eval(() => ({
    heading: document.querySelector('[data-page] h2')?.textContent,
    list: document.querySelectorAll('[data-hop-frame^="instagram.post."]').length,
    title: document.querySelector('[data-page] h2.truncate')?.textContent,
    open: !!document.querySelector('[role=dialog][aria-label="Pick a day"]'),
  }));
  await t.check(`${m}6 picking Sat 12 Sep: "${day.heading}", ${day.list} post, "${day.title}"`, day.heading === 'Posted Sat 12 Sep' && day.list === 1 && day.title === 'Three ways to tie the Rust scarf' && !day.open);
  await t.click('text=This week');
  await t.wait(100);
  const back = await t.eval(() => ({ heading: document.querySelector('[data-page] h2')?.textContent, list: document.querySelectorAll('[data-hop-frame^="instagram.post."]').length }));
  await t.check(`${m}6 "This week" goes back: "${back.heading}", ${back.list} posts`, back.heading === 'Posted this week' && back.list === 5);

  // 7. Scrollbars are 3px (half the 6 they were)
  const bar = await t.eval(() => {
    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules) if (rule.selectorText === '::-webkit-scrollbar') return rule.style.width;
      } catch {}
    }
    return null;
  });
  await t.check(`${m}7 scrollbar width ${bar}`, bar === 'var(--spacing-3)');
}
