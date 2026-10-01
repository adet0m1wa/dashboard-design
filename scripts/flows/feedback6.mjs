// Feedback round 6 (2026-10-01): last week's days can be picked (seeded data, everything
// follows); the Sand reel brief draws the real Instagram page with photos; Back from a chat keeps
// the list's scroll; the expand icon grows in with the highlight's slide (no spring); person
// filters land at once; collapsing the sidebar moves icons sideways only, at once, and the press
// still plays in the rail; the prompt cues don't animate on arrival; the Sales, Instagram and
// Customers pages work and fit the 720px main column.
const HIGHLIGHT = 'button[aria-label="Highlight a frame"]';
const nav = (n) => `document.querySelector('nav[aria-label=Pages] button:nth-child(${n})').click()`;
const pickBrief = (q) => [...document.querySelectorAll('[data-history-panel] li')].find((li) => li.textContent.includes(q)).querySelector('button[aria-current]').click();
const week = (label) => [...document.querySelectorAll('main [role=radio]')].find((b) => b.textContent.includes(label)).click();
const radio = (label) => [...document.querySelectorAll('main [role=radio]')].find((b) => b.textContent.trim().startsWith(label)).click();
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const analyticsState = () => {
  const card = document.querySelector('[data-hop-frame="analytics.card"]');
  const urgent = document.querySelector('[data-hop-frame^="analytics.urgent"]:not([data-hop-frame*="urgent."])'); // one id per period
  return {
    title: document.querySelector('main h3.whitespace-nowrap').textContent,
    kpis: [...document.querySelectorAll('main [role=tab]')].map((b) => b.textContent).join('|'),
    rows: [...card.querySelectorAll('[data-hop-frame^="analytics.card."]')].map((r) => r.textContent).join('|'),
    urgent: urgent.textContent,
    h: card.getBoundingClientRect().height,
    u: urgent.getBoundingClientRect().height,
  };
};

export default async function (t) {
  const base = process.env.HOP_URL ?? 'http://localhost:3000';
  await t.goto('/analytics');
  const reduced = await t.eval(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const m = reduced ? '[reduced] ' : '';
  await t.wait(2600);

  // 1. Last week: every day can be picked, and the KPIs, the bottom card and Urgent follow it
  await t.eval(week, 'Last week');
  await t.wait(500);
  const weekState = await t.eval(analyticsState);
  const days = [];
  for (const d of DAYS) {
    await t.click(`button[aria-label="${d}, show that day"]`);
    await t.wait(reduced ? 150 : 500);
    days.push(await t.eval(analyticsState));
  }
  await t.check(
    `${m}1 last week: all 7 days pick (titles ${days[0].title} … ${days[6].title})`,
    days.every((s, i) => s.title === `${['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][i]}, ${14 + i} Sep`),
  );
  const distinct = (k) => new Set([weekState[k], ...days.map((s) => s[k])]).size;
  await t.check(`${m}1 each day has its own KPIs (${distinct('kpis')}/8), card rows (${distinct('rows')}/8) and Urgent (${distinct('urgent')}/8)`, distinct('kpis') === 8 && distinct('rows') === 8 && distinct('urgent') === 8);
  await t.check(`${m}1 both cards stay 246px on every day`, days.every((s) => s.h === 246 && s.u === 246));
  await t.click('button[aria-label="Sun, show that day"]'); // Sun is picked: picking it again goes back to the week
  await t.wait(400);
  const back = await t.eval(analyticsState);
  await t.check(`${m}1 picking the same day again goes back to the whole week ("${back.title}")`, back.title === weekState.title && back.rows === weekState.rows);
  await t.click('button[aria-label="Mon, show that day"]');
  await t.wait(400);
  const monRows = (await t.eval(analyticsState)).rows;
  await t.goto('/analytics');
  await t.wait(2600);
  await t.eval(week, 'Last week');
  await t.wait(300);
  await t.click('button[aria-label="Mon, show that day"]');
  await t.wait(400);
  await t.check(`${m}1 the random days are seeded: Monday reads the same after a reload`, (await t.eval(analyticsState)).rows === monRows);
  await t.eval(week, 'This week');

  // 10. The prompt cues are just there when Analytics shows: full opacity, no transform, every frame
  await t.eval(nav(2));
  await t.settle();
  const cueFrames = await t.eval(async (go) => {
    new Function(go)();
    const out = [];
    const t0 = performance.now();
    while (performance.now() - t0 < 300) {
      await new Promise((r) => requestAnimationFrame(r));
      const cue = [...document.querySelectorAll('aside button')].find((b) => b.textContent === 'Any flags?');
      if (!cue) continue;
      let o = 1;
      let tr = '';
      for (let el = cue; el && el.tagName !== 'ASIDE'; el = el.parentElement) {
        const cs = getComputedStyle(el);
        o *= Number(cs.opacity);
        if (cs.transform !== 'none') tr += cs.transform;
      }
      out.push(`${o}|${tr}`);
    }
    return out;
  }, nav(1));
  await t.check(`${m}10 History → Analytics: the cues show at full opacity with no movement (${new Set(cueFrames).size} state, ${cueFrames.length} frames)`, cueFrames.length > 0 && cueFrames.every((f) => f === '1|'));

  // 8. Collapsing the sidebar: icons keep their y, move only sideways, at once
  const icons = () =>
    [...document.querySelectorAll('aside[aria-label=Sidebar] nav button svg, aside[aria-label=Sidebar] section button > :first-child')].map((s) => {
      const r = s.getBoundingClientRect();
      return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top * 10) / 10 };
    });
  const open = await t.eval(icons);
  const sideFrames = await t.eval(async (fn) => {
    const read = new Function(`return (${fn})()`);
    document.querySelector('button[aria-label="Collapse sidebar"]').click();
    const out = [];
    for (let i = 0; i < 8; i++) {
      await new Promise((r) => requestAnimationFrame(r));
      out.push(JSON.stringify(read()));
    }
    const rail = document.querySelector('aside[aria-label=Sidebar]').getBoundingClientRect();
    return { frames: out, railCentre: Math.round(rail.left + rail.width / 2) };
  }, icons.toString());
  const shut = JSON.parse(sideFrames.frames.at(-1));
  await t.check(`${m}8 collapse: ${open.length} icons keep their y exactly`, open.length >= 10 && open.every((p, i) => p.y === shut[i].y));
  await t.check(`${m}8 collapse: every icon is centred in the rail (centre ${sideFrames.railCentre})`, shut.every((p) => Math.abs(p.x - sideFrames.railCentre) <= 1));
  await t.check(`${m}8 collapse is instant: frame 1 already final (${new Set(sideFrames.frames).size} state)`, new Set(sideFrames.frames).size === 1);

  // 9. The press still plays in the rail: a nav button and the toggle shrink while held
  const held = async (sel) => {
    const box = await (await t.page.$(sel)).boundingBox();
    await t.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await t.page.mouse.down();
    await t.wait(160);
    const scale = await t.eval((s) => new DOMMatrix(getComputedStyle(document.querySelector(s)).transform).a, sel);
    await t.page.mouse.up();
    await t.wait(250);
    return scale;
  };
  const navScale = await held('aside[aria-label=Sidebar] nav button:nth-child(3)');
  const toggleScale = await held('button[aria-label="Expand sidebar"]');
  await t.check(`${m}9 collapsed: pressing a rail icon scales it (${navScale.toFixed(3)}) and the toggle too (${toggleScale.toFixed(3)})`, navScale < 0.995 && navScale >= 0.96 && toggleScale < 0.995 && toggleScale >= 0.96);
  // the toggle press above expanded it again; leave it open for the rest
  await t.wait(300);
  if (await t.eval(() => !!document.querySelector('button[aria-label="Expand sidebar"]'))) await t.click('button[aria-label="Expand sidebar"]');
  await t.eval(nav(1));
  await t.settle();

  // 2. Zee's Sand reel brief: the real Instagram page, with photos
  await t.eval(nav(2));
  await t.settle();
  await t.page.waitForSelector('[data-history-panel] li');
  await t.eval(pickBrief, 'Why is the Sand reel');
  await t.wait(1000);
  const ig = await t.eval(() => {
    const snap = document.querySelector('[data-page=history] [inert]');
    const imgs = [...snap.querySelectorAll('img')];
    return {
      title: snap.querySelector('h2.truncate')?.textContent,
      imgs: imgs.length,
      loaded: imgs.every((i) => i.complete && i.naturalWidth > 0),
      preview: imgs.some((i) => i.src.includes('/products/large/sand-reel')),
    };
  });
  await t.check(`${m}2 Sand reel brief: the Instagram page on "${ig.title}", ${ig.imgs} photos, all loaded`, ig.title === 'Styling the Sand set 3 ways' && ig.imgs >= 6 && ig.loaded && ig.preview);

  // 4. Switching briefs: the highlight slides, the expand icon grows in with it — no overshoot
  await t.eval(pickBrief, '2:14 PM');
  await t.wait(700);
  const grow = await t.eval(async () => {
    const li = [...document.querySelectorAll('[data-history-panel] li')].find((l) => l.textContent.includes('8:40 AM'));
    li.querySelector('button[aria-current]').click();
    const out = [];
    const t0 = performance.now();
    while (performance.now() - t0 < 400) {
      await new Promise((r) => requestAnimationFrame(r));
      const icon = li.querySelector('button[aria-label^="Open the chat"]:not([aria-current])');
      const bg = document.querySelector('[data-history-panel] li > span.absolute');
      if (!icon || !bg) continue;
      const cs = getComputedStyle(icon);
      out.push({ s: new DOMMatrix(cs.transform).a, o: Number(cs.opacity), y: bg.getBoundingClientRect().top - li.getBoundingClientRect().top });
    }
    return out;
  });
  const mid = grow.filter((f) => f.s > 0.76 && f.s < 0.99);
  const slide = grow.filter((f) => Math.abs(f.y) > 1);
  if (reduced) await t.check(`${m}4 reduced: the icon only fades (scale ${[...new Set(grow.map((f) => f.s.toFixed(2)))].join('/')})`, grow.length > 0 && grow.every((f) => f.s === 1));
  else {
    await t.check(`${m}4 the expand icon scales up through ${mid.length} frames while the highlight slides (${slide.length} frames)`, mid.length >= 3 && slide.length >= 3);
    await t.check(`${m}4 no spring: the icon never goes past 1 (max ${Math.max(...grow.map((f) => f.s)).toFixed(4)})`, grow.every((f) => f.s <= 1.0001));
  }

  // 3. Back from a chat: the list is scrolled where it was when Expand was pressed
  await t.eval(pickBrief, 'Morning brief');
  await t.wait(600);
  const list = '[data-history-panel] .overflow-y-auto';
  const before = await t.eval((sel) => {
    const l = document.querySelector(sel);
    l.scrollTop = l.scrollHeight;
    return l.scrollTop;
  }, list);
  await t.wait(200);
  await t.eval(() => document.querySelector('[data-history-panel] li button[aria-label^="Open the chat"]:not([aria-current])').click());
  await t.wait(700);
  await t.click('button[aria-label="Back to the brief list"]');
  await t.wait(700);
  const after = await t.eval((sel) => {
    const l = document.querySelector(sel);
    const y = l.querySelector('section[aria-label=Yesterday]').getBoundingClientRect();
    const box = l.getBoundingClientRect();
    return { top: l.scrollTop, yesterdayShown: y.top >= box.top && y.top < box.bottom };
  }, list);
  await t.check(`${m}3 Back: list scroll ${after.top} (was ${before}), "Yesterday" still in view`, before > 0 && Math.abs(after.top - before) <= 1 && after.yesterdayShown);

  // 7. Switching names: the list lands at once — no row moves after the first frame
  const chip = (name) => `[...document.querySelectorAll('[aria-label="Show briefs from"] button')].find((b) => b.textContent.trim().endsWith('${name}')).click()`;
  let filterOk = true;
  const filterStates = [];
  for (const name of ['Ife', 'Amara', 'Zee', 'Everyone']) {
    const frames = await t.eval(async (act) => {
      new Function(act)();
      const out = [];
      for (let i = 0; i < 10; i++) {
        await new Promise((r) => requestAnimationFrame(r));
        const bg = document.querySelector('[data-history-panel] li > span.absolute')?.getBoundingClientRect();
        out.push([...document.querySelectorAll('[data-history-panel] li')].map((l) => {
          const r = l.getBoundingClientRect();
          return `${Math.round(r.top)}:${Math.round(r.height)}:${getComputedStyle(l).opacity}`;
        }).join(',') + ` bg ${Math.round(bg?.top ?? -1)}`);
      }
      return out;
    }, chip(name));
    filterStates.push(new Set(frames).size);
    if (new Set(frames).size !== 1) filterOk = false;
  }
  await t.check(`${m}7 Ife → Amara → Zee → Everyone: each lands in one frame (${filterStates.join('/')})`, filterOk);

  // 5. Sales: the filter, and a frame Hop can answer about
  await t.eval(nav(3));
  await t.settle();
  const orderRows = () => document.querySelectorAll('[data-hop-frame^="sales.order."]').length;
  const counts = {};
  for (const f of ['To pack', 'Shipped', 'Delivered', 'All']) {
    await t.eval(radio, f);
    await t.wait(80);
    counts[f] = await t.eval(orderRows);
  }
  await t.check(`${m}5 Sales filter: To pack ${counts['To pack']}, Shipped ${counts.Shipped}, Delivered ${counts.Delivered}, All ${counts.All}`, counts['To pack'] === 6 && counts.Shipped === 2 && counts.Delivered === 2 && counts.All === 10);
  await t.click(HIGHLIGHT);
  await t.click('[data-hop-frame="sales.tile.revenue"] span');
  await t.wait(300);
  await t.click('textarea[aria-label="Message Hop"]');
  await t.page.keyboard.press('Enter');
  const answered = await t.page
    .waitForFunction(() => document.querySelector('aside[aria-label^=Hop]').textContent.includes('Wednesday was the best day at $3,120.'), { timeout: 10000 })
    .then(() => true, () => false);
  await t.check(`${m}5 Sales: Hop answers about the Revenue tile`, answered);
  await t.wait(400);

  // 5. Instagram: picking a post swaps the right side
  await t.eval(nav(4));
  await t.settle();
  await t.click('[data-hop-frame="instagram.post.post-kimono"] button');
  await t.wait(150);
  const post = await t.eval(() => ({ h: document.querySelector('[data-page] h2.truncate')?.textContent, img: document.querySelector('[data-hop-frame^="instagram.preview."] img')?.src }));
  await t.check(`${m}5 Instagram: picking the kimono post shows it ("${post.h}")`, post.h === 'The kimono restock is live' && !post.img.includes('sand-reel'));

  // 5. Customers: threads, tabs and search
  await t.eval(nav(6));
  await t.settle();
  await t.click('[data-hop-frame="customers.chat.tolu"] button');
  await t.wait(100);
  const head = await t.eval(() => document.querySelector('[data-hop-frame="customers.thread"] .text-15')?.textContent);
  const inbox = () => document.querySelectorAll('[data-hop-frame^="customers.chat."]').length;
  await t.eval(radio, 'Waiting');
  await t.wait(80);
  const waiting = await t.eval(inbox);
  await t.eval(radio, 'All');
  await t.click('input[placeholder="Search customers"]');
  await t.page.keyboard.type('gra');
  await t.wait(100);
  const found = await t.eval(() => [...document.querySelectorAll('[data-hop-frame^="customers.chat."]')].map((f) => f.textContent.slice(0, 12)));
  await t.check(`${m}5 Customers: Tolu's thread opens ("${head}"), Waiting shows ${waiting}, "gra" finds ${found.join(', ')}`, head === 'Tolu Bakare' && waiting === 9 && found.length === 1 && found[0].includes('Grace'));

  // 5. At the narrowest main column (720 — Hop open, 1336 wide) nothing on the new pages spills
  await t.page.setViewport({ width: 1336, height: 900, deviceScaleFactor: 1 });
  const spills = {};
  for (const path of ['/sales', '/instagram', '/customers']) {
    await t.page.goto(base + path, { waitUntil: 'networkidle0' });
    await t.wait(500);
    spills[path] = await t.eval(() => {
      const main = document.querySelector('main').getBoundingClientRect();
      return [...document.querySelectorAll('[data-page] *')].filter((el) => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden' && r.right > main.right + 0.5;
      }).length;
    });
  }
  await t.page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await t.check(`${m}5 720px main: nothing spills (Sales ${spills['/sales']}, Instagram ${spills['/instagram']}, Customers ${spills['/customers']})`, Object.values(spills).every((n) => n === 0));
}
