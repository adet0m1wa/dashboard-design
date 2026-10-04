// Phase 8 (polish + QA): keyboard-only use and narrow windows (the better-interface review).
//   • every Tab stop is visible and shows a focus indicator (ring, frame highlight, or the blue
//     composer/search border); the first stop is the skip link
//   • highlight mode by keyboard: focus jumps to the first frame, Tab walks frames, Enter picks
//     one and moves to the composer; Enter on a control inside a frame picks its frame
//   • 200% zoom (720 wide) and small laptops: the page area keeps ≥720px, nothing overlaps
const stop = () => {
  const el = document.activeElement;
  if (!el || el === document.body) return { name: 'BODY' };
  const cs = getComputedStyle(el);
  const r = el.getBoundingClientRect();
  const name = (el.getAttribute('aria-label') || el.textContent || el.tagName).trim().replace(/\s+/g, ' ').slice(0, 40);
  const ring = cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) >= 2;
  const frame = el.hasAttribute('data-hop-frame') && !!el.querySelector(':scope > span.border-selection');
  const composer = el.tagName === 'TEXTAREA' && getComputedStyle(el.closest('.shadow-composer')).borderTopColor === 'rgb(37, 99, 235)';
  const search = el.type === 'search' && getComputedStyle(el.closest('label')).borderTopColor === 'rgb(37, 99, 235)';
  const edge = el.getAttribute('role') === 'separator' && getComputedStyle(el.firstElementChild).backgroundColor === 'rgb(37, 99, 235)';
  return { name, visible: r.width > 1 && r.height > 1, indicator: ring || frame || composer || search || edge };
};
export default async (t) => {
  await t.goto('/analytics');
  await t.wait(2600);
  const stops = [];
  for (let i = 0; i < 45; i++) {
    await t.page.keyboard.press('Tab');
    await t.wait(200);
    stops.push(await t.eval(stop));
  }
  const bad = stops.filter((s) => s.name !== 'BODY' && (!s.visible || !s.indicator));
  console.log('stops:', stops.map((s) => s.name).join(' | '));
  await t.check(`every Tab stop visible with a focus indicator (${bad.length} bad: ${bad.map((b) => b.name).join(', ')})`, bad.length === 0);
  await t.check('first stop is the skip link', stops[0].name === 'Skip to page');

  // Keyboard-only pick → ask
  await t.eval(() => document.querySelector('button[aria-label="Highlight a frame"]').focus());
  await t.page.keyboard.press('Enter');
  await t.wait(200);
  const first = await t.eval(stop);
  await t.check(`highlight on from the keyboard: focus jumps to the first frame (${first.name})`, first.name.startsWith('Revenue') && first.indicator);
  let guard = 0;
  while ((await t.eval(() => document.activeElement?.dataset?.hopFrame)) !== 'analytics.card.linen-sand' && guard++ < 40) {
    await t.page.keyboard.press('Tab');
    await t.wait(40);
  }
  await t.check(`Tab reaches the Sand row frame (${guard} presses)`, guard < 40);
  await t.page.keyboard.press('Enter');
  await t.wait(300);
  await t.check('Enter picks it and moves to the composer', () =>
    t.eval(() => document.activeElement?.tagName === 'TEXTAREA' && !!document.querySelector('[aria-label="Remove Linen two-piece (Sand)"]')),
  );
  await t.page.keyboard.type('What about this one?');
  await t.page.keyboard.press('Enter');
  await t.wait(3500);
  await t.check('the tagged question was sent and answered', () =>
    t.eval(() => document.querySelector('[role=log]').innerText.includes('What about this one?') && document.querySelector('[role=log]').innerText.includes('best seller')),
  );
  // A control inside a frame picks its frame from the keyboard too
  await t.eval(() => document.querySelector('button[aria-label="Highlight a frame"]').focus());
  await t.page.keyboard.press('Enter');
  await t.wait(200);
  await t.eval(() => [...document.querySelectorAll('main button')].find((b) => b.textContent.trim() === 'Draft replies').focus());
  await t.page.keyboard.press('Enter');
  await t.wait(300);
  await t.check('Enter on "Draft replies" in highlight mode picks its row (no message sent)', () =>
    t.eval(() => !!document.querySelector('[aria-label="Remove 3 customers waiting 2h+"]') && !document.querySelector('[role=log]').innerText.includes('Draft replies for')),
  );

  // Narrow windows

  for (const [w, h, name] of [[720, 450, 'z-720'], [1024, 700, 'z-1024'], [1280, 800, 'z-1280']]) {
    await t.page.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
    await t.goto('/analytics');
    await t.wait(2600);
    await t.shot(name);
    const r = await t.eval(() => {
      const main = document.querySelector('main').getBoundingClientRect();
      const overlap = [...document.querySelectorAll('[role=tab]')].some((tab) => tab.scrollWidth > tab.clientWidth + 1);
      const scroller = document.querySelector('main').closest('.overflow-x-auto');
      return { mainW: Math.round(main.width), sidebar: document.querySelector('aside[aria-label=Sidebar]').getBoundingClientRect().width, scrollW: scroller.scrollWidth, clientW: scroller.clientWidth, overlap, topbarWraps: document.querySelector('main header').scrollHeight > 57 };
    });
    console.log(name, JSON.stringify(r));
    await t.check(`${name}: page keeps ≥720, no KPI overlap, no wrapped top bar`, r.mainW >= 720 && !r.overlap && !r.topbarWraps);
  }
  await t.page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
};
