// Feedback round 2 (2026-09-29): highlight-off clears the outline, the chat's scroll-driven fade,
// the wipe page transition, the "All pages" menu, the resizable side panel (also on History,
// where it can't be closed), thin scrollbars, the Instagram glyph, cues only on an empty chat,
// and the contrast fixes. (The History expand icon and the 2× Instagram image: phase7.)
const PANEL = 'aside[aria-label^=Hop]';
const HIGHLIGHT = 'button[aria-label="Highlight a frame"]';
const SAND = '[data-hop-frame="analytics.card.linen-sand"]';
const cues = () => [...document.querySelectorAll('aside[aria-label=Hop] button')].some((b) => b.textContent === 'Any flags?');
const outline = (sel) => !!document.querySelector(`${sel} > span[aria-hidden] .border-selection`);
const width = (sel) => Math.round(document.querySelector(sel).getBoundingClientRect().width);
const nav = (i) => document.querySelector(`nav[aria-label=Pages] button:nth-child(${i})`).click();

// Samples the stage's transition phase + mask every frame for `ms`.
const record = (t, ms) =>
  t.eval(
    (ms) =>
      new Promise((res) => {
        const el = document.querySelector('[data-transition]');
        const out = [];
        const t0 = performance.now();
        const step = () => {
          const shown = document.querySelector('main header h1')?.textContent.trim();
          out.push({ t: performance.now() - t0, phase: el.dataset.transition, mask: el.style.maskImage, opacity: el.style.opacity, shown, active: document.querySelector('[aria-current=page]')?.textContent.trim() });
          if (performance.now() - t0 < ms) requestAnimationFrame(step);
          else res(out);
        };
        requestAnimationFrame(step);
      }),
    ms,
  );
const span = (rows, phase) => {
  const r = rows.filter((x) => x.phase === phase);
  return r.length ? r[r.length - 1].t - r[0].t : 0;
};

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

  // 2. The chat fade: none at the end; +20px per 1% scrolled up; 100px at most
  // expected: 20px for every 1% (of the scrollable height) back up from the end, capped at 100px
  const fadeAt = (pct) =>
    t.eval(async (pct) => {
      const el = document.querySelector('[role=log]');
      const range = el.scrollHeight - el.clientHeight;
      el.scrollTop = range * (1 - pct / 100);
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      const up = 100 - (el.scrollTop / range) * 100;
      return { fade: +el.dataset.fade, want: Math.min(100, Math.round(up * 20)), up: +up.toFixed(2), mask: getComputedStyle(el).maskImage, range };
    }, pct);
  const end = await fadeAt(0);
  await t.check(`${m}2 fade: the chat scrolls (${end.range}px) and there's no fade at the end`, end.range > 100 && end.fade === 0 && end.mask === 'none');
  const one = await fadeAt(1);
  const three = await fadeAt(3);
  const lots = await fadeAt(40);
  await t.page.mouse.move(700, 895);
  await t.shot(`${reduced ? 'reduced-' : ''}10-chat-fade-scrolled-up`);
  await t.check(`${m}2 fade: ${one.up}% up → ${one.fade}px, ${three.up}% → ${three.fade}px, ${lots.up}% → ${lots.fade}px (20px per 1%, max 100)`, [one, three, lots].every((x) => Math.abs(x.fade - x.want) <= 1) && one.fade > 10 && lots.fade === 100 && lots.mask.includes('gradient'));
  await fadeAt(0);

  // 1. Switching highlight off puts the picked frame away
  await t.click(HIGHLIGHT);
  await t.click(`${SAND} span.truncate`);
  await t.wait(400);
  await t.check(`${m}1 picked: outline + tag`, async () => (await t.eval(outline, SAND)) && (await t.eval(() => !!document.querySelector('[aria-label="Remove Linen two-piece (Sand)"]'))));
  // 2 + 10: with the jump chips up, the same fade rule
  const chipsFade = await fadeAt(2);
  await t.check(`${m}2 fade also above the jump chips (${chipsFade.up}% up → ${chipsFade.fade}px)`, async () => (await t.eval(() => document.body.innerText.includes('Jump to'))) && Math.abs(chipsFade.fade - chipsFade.want) <= 1 && chipsFade.fade > 10);
  await fadeAt(0);
  await t.eval(() => document.querySelector('[role=separator]').focus());
  await t.page.keyboard.press('End'); // back to the full width for the rest
  await t.wait(450);
  await t.click(HIGHLIGHT);
  await t.wait(500);
  await t.check(`${m}1 highlight off: the outline and the tag go too`, async () => !(await t.eval(outline, SAND)) && (await t.eval(() => !document.querySelector('[aria-label^="Remove "]'))));

  // 3. Page transition: wipe out → blank → wipe in; down = top→bottom, up = bottom→top; longer moves take longer
  let rec = record(t, reduced ? 700 : 1100);
  await t.eval(nav, 2); // Analytics → History, 1 step down
  let rows = await rec;
  const swapAt = rows.find((r) => r.shown === 'History')?.t ?? 0;
  const blankEnd = rows.filter((r) => r.phase === 'blank').pop()?.t ?? 0;
  const blankStart = rows.find((r) => r.phase === 'blank')?.t ?? 0;
  await t.check(`${m}3 the sidebar pill moves at once`, rows[1].active?.startsWith('History'));
  if (reduced) {
    const faded = rows.some((r) => r.opacity && +r.opacity < 1);
    await t.check(`[reduced] 3 a quick fade instead of the wipe (no mask)`, faded && rows.every((r) => !r.mask));
  } else {
    const outRows = rows.filter((r) => r.phase === 'out' && r.mask);
    await t.check(`3 Analytics → History: out ${span(rows, 'out').toFixed(0)}ms, blank ${span(rows, 'blank').toFixed(0)}ms, in ${span(rows, 'in').toFixed(0)}ms`, span(rows, 'out') > 150 && span(rows, 'in') > 150 && span(rows, 'blank') > 60);
    await t.check('3 moving down wipes top → bottom', outRows.length > 3 && outRows.every((r) => !r.mask.includes('to top')));
    await t.check(`3 the new page swaps in while blank (${swapAt.toFixed(0)}ms, blank ${blankStart.toFixed(0)}–${blankEnd.toFixed(0)}ms)`, swapAt >= blankStart && swapAt <= blankEnd + 40);
  }
  await t.settle();

  // 9. History keeps the side panel: Hop's face, full width, not closable
  await t.check(`${m}9 History: side panel with Hop's face, ${await t.eval(width, PANEL)}px, no close`, async () =>
    (await t.eval(width, PANEL)) === 368 && (await t.eval(() => !document.querySelector('button[aria-label="Close Hop"]') && !!document.querySelector('aside[aria-label^=Hop] header svg[role=img]'))),
  );

  // 7. Scrollbars: thin (6px) and faint
  // (headless Chrome runs with scrollbars hidden, so this reads the rule; see the report for a render)
  await t.check(`${m}7 scrollbar rule: 6px wide, faint thumb`, () =>
    t.eval(() => {
      const rules = [...document.styleSheets].flatMap((sh) => { try { return [...sh.cssRules]; } catch { return []; } });
      const flat = rules.flatMap((r) => (r.cssRules ? [r, ...r.cssRules] : [r]));
      const bar = flat.find((r) => r.selectorText === '::-webkit-scrollbar');
      const thumb = flat.find((r) => r.selectorText === '::-webkit-scrollbar-thumb');
      return !!bar && bar.style.width.includes('--spacing-6') && !!thumb && thumb.style.background.includes('--color-surface-border-tint');
    }),
  );

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

  // 3. A longer move (Customers → Analytics, 5 steps up) takes longer and wipes bottom → top
  await t.eval(nav, 6);
  await t.settle();
  rec = record(t, reduced ? 700 : 1600);
  await t.eval(nav, 1);
  rows = await rec;
  if (!reduced) {
    const total = span(rows, 'out') + span(rows, 'blank') + span(rows, 'in');
    await t.check(`3 Customers → Analytics: ${total.toFixed(0)}ms in all, wiping bottom → top`, total > 850 && rows.filter((r) => r.phase === 'out' && r.mask).every((r) => r.mask.includes('to top')));
  }
  await t.settle();
}
