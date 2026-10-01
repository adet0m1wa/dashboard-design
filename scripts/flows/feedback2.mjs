// Feedback round 2 (2026-09-29), as amended by round 3: highlight-off clears the outline, the
// chat's standard scroll fade, instant page changes, the "All pages" menu, the resizable side
// panel (also on History, where it can't be closed), thin scrollbars, the Instagram glyph, cues
// only on an empty chat, and the contrast fixes. (History expand icon + 2× image: phase7.)
const PANEL = 'aside[aria-label^=Hop]';
const HIGHLIGHT = 'button[aria-label="Highlight a frame"]';
const SAND = '[data-hop-frame="analytics.card.linen-sand"]';
const cues = () => [...document.querySelectorAll('aside[aria-label=Hop] button')].some((b) => b.textContent === 'Any flags?');
const outline = (sel) => !!document.querySelector(`${sel} > span[aria-hidden] .border-selection`);
const width = (sel) => Math.round(document.querySelector(sel).getBoundingClientRect().width);
const nav = (i) => document.querySelector(`nav[aria-label=Pages] button:nth-child(${i})`).click();

export default async function (t) {
  await t.goto('/analytics');
  const reduced = await t.eval(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const m = reduced ? '[reduced] ' : '';
  await t.wait(2600);

  // 11. Contrast: the eight variables carry their new values
  const want = { 'text-muted': '#716F6B', 'text-tone-02': '#577764', 'status-success-text': '#1C7E46', 'palette-tone-01': '#7A5BF6', 'palette-tone-02': '#B56025', 'palette-tone-03': '#CE4275', 'palette-tone-15': '#52840B', 'palette-tone-17': '#0C875E' };
  const got = await t.eval((names) => names.map((n) => getComputedStyle(document.documentElement).getPropertyValue(`--color-${n}`).trim().toUpperCase()), Object.keys(want));
  await t.check(`${m}11 contrast: updated colour variables (${got.join(' ')})`, got.join() === Object.values(want).join());

  // 7. Instagram glyph in the sidebar, 16px, same colour as its neighbours
  await t.check(`${m}7 Instagram: the logo glyph at 16px`, () =>
    t.eval(() => {
      const svg = [...document.querySelectorAll('nav[aria-label=Pages] button')].find((b) => b.textContent.includes('Instagram')).querySelector('svg');
      return svg.getAttribute('width') === '16' && !!svg.querySelector('rect[rx="3.5"]') && !!svg.querySelector('circle');
    }),
  );

  // 10. Cues only on an empty chat
  await t.check(`${m}10 cues show on an empty chat`, () => t.eval(cues));
  await t.eval(() => document.querySelector('[role=separator]').focus());
  await t.page.keyboard.press('Home'); // narrowest panel: longer chat, more to scroll
  await t.wait(400);
  for (const q of ['How are we doing today?', 'Any flags?', 'What’s running low?', 'Who’s still waiting on a reply?']) {
    await t.click('textarea[aria-label="Message Hop"]');
    await t.page.keyboard.type(q);
    await t.page.keyboard.press('Enter');
    await t.wait(300);
    if (q.startsWith('How')) await t.check(`${m}10 cues leave once she asks`, async () => !(await t.eval(cues)));
    await t.page.waitForFunction(() => !document.querySelector('[aria-label="Hop is typing"]'), { timeout: 4000 });
    await t.wait(3200);
  }
  await t.check(`${m}10 no cues after the answers`, async () => !(await t.eval(cues)));

  // 2. The chat fade (standard, round 3): a fixed 48px fade while there's more below; none at the end
  const fadeAt = (pct) =>
    t.eval(async (pct) => {
      const el = document.querySelector('[role=log]');
      const range = el.scrollHeight - el.clientHeight;
      el.scrollTop = range * (1 - pct / 100);
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      return { fade: +el.dataset.fade, mask: getComputedStyle(el).maskImage, range };
    }, pct);
  const end = await fadeAt(0);
  await t.check(`${m}2 fade: the chat scrolls (${end.range}px) and there's no fade at the end`, end.range > 100 && end.fade === 0 && end.mask === 'none');
  const one = await fadeAt(3);
  const lots = await fadeAt(60);
  await t.page.mouse.move(700, 895);
  await t.shot(`${reduced ? 'reduced-' : ''}10-chat-fade-scrolled-up`);
  await t.check(`${m}2 fade: a fixed 48px fade whenever there's more below (${one.fade}px, ${lots.fade}px)`, one.fade === 48 && lots.fade === 48 && lots.mask.includes('calc(100% - 48px)'));
  await fadeAt(0);

  // 1. Switching highlight off puts the picked frame away
  await t.click(HIGHLIGHT);
  await t.click(`${SAND} span.truncate`);
  await t.wait(400);
  await t.check(`${m}1 picked: outline + tag`, async () => (await t.eval(outline, SAND)) && (await t.eval(() => !!document.querySelector('[aria-label="Remove Linen two-piece (Sand)"]'))));
  // 2 + 10: with the jump chips up, the same fade rule
  const chipsFade = await fadeAt(20);
  const chipsEnd = await fadeAt(0);
  await t.check(`${m}2 fade above the jump chips too (${chipsFade.fade}px scrolled up, ${chipsEnd.fade}px at the end)`, async () => (await t.eval(() => document.body.innerText.includes('Jump to'))) && chipsFade.fade === 48 && chipsEnd.fade === 0);
  await t.eval(() => document.querySelector('[role=separator]').focus());
  await t.page.keyboard.press('End'); // back to the full width for the rest
  await t.wait(450);
  await t.click(HIGHLIGHT);
  await t.wait(500);
  await t.check(`${m}1 highlight off: the outline and the tag go too`, async () => !(await t.eval(outline, SAND)) && (await t.eval(() => !document.querySelector('[aria-label^="Remove "]'))));

  // 3. Page changes are instant (round 3): the new page is on screen by the next frame, no mask
  const switched = await t.eval(async () => {
    document.querySelector('nav[aria-label=Pages] button:nth-child(2)').click(); // Analytics → History
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const main = document.querySelector('main');
    return { title: main.querySelector('header h1').textContent.trim(), page: document.querySelector('[data-page]')?.dataset.page, masked: [...document.querySelectorAll('*')].some((el) => el.style?.maskImage && el.closest('main, aside[aria-label^=Hop]') === el) };
  });
  await t.check(`${m}3 History is on screen two frames after the click (${switched.title}, no wipe)`, switched.title === 'History' && switched.page === 'history' && !switched.masked);
  await t.settle();

  // 9. History keeps the side panel: Hop's face, full width, not closable
  await t.check(`${m}9 History: side panel with Hop's face, ${await t.eval(width, PANEL)}px, no close`, async () =>
    (await t.eval(width, PANEL)) === 368 && (await t.eval(() => !document.querySelector('button[aria-label="Close Hop"]') && !!document.querySelector('aside[aria-label^=Hop] header svg[role=img]'))),
  );

  // 7. Scrollbars: thin (3px since round 7; 6px before), faint, and only while scrolling (round 3)
  // (headless Chrome runs with scrollbars hidden, so this reads the rules; see the report for a render)
  await t.check(`${m}7 scrollbar rules: 3px wide; thumb see-through until [data-scrolling], then faint`, () =>
    t.eval(() => {
      const rules = [...document.styleSheets].flatMap((sh) => { try { return [...sh.cssRules]; } catch { return []; } });
      const flat = rules.flatMap((r) => (r.cssRules ? [r, ...r.cssRules] : [r]));
      const bar = flat.find((r) => r.selectorText === '::-webkit-scrollbar');
      const thumb = flat.find((r) => r.selectorText === '::-webkit-scrollbar-thumb');
      const scrolling = flat.find((r) => r.selectorText === '[data-scrolling]::-webkit-scrollbar-thumb');
      return !!bar && bar.style.width.includes('--spacing-3') && ['transparent', 'initial'].includes(thumb?.style.backgroundColor) /* the minifier writes "0 0" */ && !!scrolling?.style.background.includes('--color-surface-border-tint');
    }),
  );
  const marks = await t.eval(async () => {
    const list = document.querySelector('[data-history-panel] .overflow-y-auto');
    list.scrollTop = 80;
    await new Promise((r) => setTimeout(r, 100));
    const during = list.hasAttribute('data-scrolling');
    await new Promise((r) => setTimeout(r, 1000));
    return { during, after: list.hasAttribute('data-scrolling') };
  });
  await t.check(`${m}7 the scrollbar shows while scrolling (${marks.during}) and hides after (${!marks.after})`, marks.during && !marks.after);

  // 4. The "All pages" menu
  await t.click('button[aria-label^="Show briefs asked on"]');
  await t.wait(500);
  await t.check(`${m}4 menu opens: 6 pages, the box grows to 142, chevron beside "All pages"`, () =>
    t.eval(() => {
      const lb = document.querySelector('[role=listbox]');
      const opts = [...lb.querySelectorAll('[role=option]')].map((o) => o.textContent);
      const chev = lb.querySelector('svg').getBoundingClientRect();
      const first = lb.querySelector('[role=option]').getBoundingClientRect();
      return opts.join('|') === 'All pages|Chats|Sales|Instagram|Inventory|Customers' && Math.round(lb.getBoundingClientRect().height) === 142 && Math.abs(chev.top + chev.height / 2 - (first.top + first.height / 2)) < 2;
    }),
  );
  await t.page.mouse.move(700, 895);
  await t.shot(`${reduced ? 'reduced-' : ''}11-history-menu-open`);
  await t.check(`${m}4 no blue highlight on the menu`, () => t.eval(() => { const lb = document.querySelector('[role=listbox]'); const cs = getComputedStyle(lb); return cs.outlineStyle === 'none' && cs.borderTopColor !== 'rgb(37, 99, 235)'; }));
  const chevY = () => t.eval(() => document.querySelector('[role=listbox] svg')?.getBoundingClientRect().top ?? null);
  const y0 = await chevY();
  await t.eval(() => [...document.querySelectorAll('[role=option]')].find((o) => o.textContent === 'Inventory').click());
  await t.wait(70);
  const yMid = await chevY();
  await t.wait(900);
  await t.check(`${m}4 pick Inventory: chevron travels (${y0?.toFixed(0)} → ${yMid?.toFixed(0)} mid-way), then the box rolls shut on it`, async () => {
    const closed = await t.eval(() => {
      const trigger = document.querySelector('button[aria-label^="Show briefs asked on"]');
      const b = trigger.previousElementSibling.getBoundingClientRect();
      return { label: trigger.getAttribute('aria-label'), h: Math.round(b.height) };
    });
    return closed.h === 32 && closed.label.endsWith('Inventory') && (reduced || (yMid > y0 && yMid < y0 + 88));
  });
  await t.check(`${m}4 the list filters to Inventory briefs`, () => t.eval(() => [...document.querySelectorAll('[data-history-panel] li')].every((li) => li.textContent.includes('Inventory'))));
  // Keyboard: ↓ opens, ↑↑↑↑ to All pages, Enter picks; Esc closes without changing
  await t.eval(() => document.querySelector('button[aria-label^="Show briefs asked on"]').focus());
  await t.page.keyboard.press('ArrowDown');
  await t.wait(500);
  for (let i = 0; i < 4; i++) await t.page.keyboard.press('ArrowUp');
  await t.page.keyboard.press('Enter');
  await t.wait(1000);
  await t.check(`${m}4 keyboard: back to All pages, focus on the button`, () =>
    t.eval(() => document.activeElement?.getAttribute('aria-label') === 'Show briefs asked on: All pages' && document.querySelectorAll('[data-history-panel] li').length > 4),
  );

  // 5. The side panel's width: drag it narrower, it's the same everywhere and survives closing
  const handle = await (await t.page.$('[role=separator]')).boundingBox();
  await t.page.mouse.move(handle.x + 3, handle.y + 300);
  await t.page.mouse.down();
  await t.page.mouse.move(handle.x + 33, handle.y + 300, { steps: 4 });
  await t.page.mouse.move(handle.x + 63, handle.y + 300, { steps: 4 });
  await t.page.mouse.up();
  await t.wait(200);
  await t.check(`${m}5 drag: the panel narrows to ${await t.eval(width, PANEL)}px`, async () => (await t.eval(width, PANEL)) === 308);
  await t.page.mouse.move(700, 895);
  await t.shot(`${reduced ? 'reduced-' : ''}12-history-panel-narrowed`);
  await t.click('button[aria-label^="Open the chat"]');
  await t.wait(800);
  await t.check(`${m}5 Expand keeps the width`, async () => (await t.eval(width, PANEL)) === 308);
  await t.eval(nav, 1);
  await t.settle();
  await t.check(`${m}5 the same width on Analytics`, async () => (await t.eval(width, PANEL)) === 308);
  await t.click('button[aria-label="Close Hop"]');
  await t.wait(600);
  await t.click('button[aria-label="Open Hop"]');
  await t.wait(600);
  await t.check(`${m}5 closed and reopened: still 308`, async () => (await t.eval(width, PANEL)) === 308);
  await t.eval(() => document.querySelector('[role=separator]').focus());
  await t.page.keyboard.press('Home');
  await t.wait(450);
  const min = await t.eval(width, PANEL);
  await t.page.keyboard.press('End');
  await t.wait(450);
  await t.check(`${m}5 keyboard: Home → ${min}px (minimum), End → ${await t.eval(width, PANEL)}px (maximum)`, async () => min === 300 && (await t.eval(width, PANEL)) === 368);
  await t.page.keyboard.press('ArrowRight');
  await t.wait(450);
  await t.check(`${m}5 keyboard: → narrows by 8px`, async () => (await t.eval(width, PANEL)) === 360);

  // 3. A long move (Customers → Analytics) is instant too
  await t.eval(nav, 6);
  await t.settle();
  const back = await t.eval(async () => {
    document.querySelector('nav[aria-label=Pages] button:nth-child(1)').click();
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    return document.querySelector('[data-page]')?.dataset.page;
  });
  await t.check(`${m}3 Customers → Analytics: on screen by the next frames (${back})`, back === 'analytics');
}
