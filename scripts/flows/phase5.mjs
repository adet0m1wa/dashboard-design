// Phase 5: the selection system — highlight mode, hover, select, tag chip, jump chips, scan,
// clear on answer, re-highlight from a tag, picking a tab, Esc, Urgent actions.
const SAND = '[data-hop-frame="analytics.card.linen-sand"]';
const selectedOverlay = (sel) => document.querySelector(`${sel} > span[aria-hidden] .border-selection`) !== null;
const handles = (sel) => document.querySelectorAll(`${sel} > span[aria-hidden] > span.bg-surface-default`).length;
const hoverOutline = (sel) => !!document.querySelector(`${sel} > span[aria-hidden].border-selection`);
const HIGHLIGHT = 'button[aria-label="Highlight a frame"]';
const modeOn = () => document.querySelector('button[aria-label="Highlight a frame"]').getAttribute('aria-pressed') === 'true';
const composerChip = () => document.querySelector('aside[aria-label=Hop] .shadow-composer [aria-live] span.text-tag-text')?.textContent.trim() ?? null;
const chips = () => [...document.querySelectorAll('aside[aria-label=Hop] button')].filter((b) => b.textContent.startsWith('Go to')).map((b) => `${b.textContent.trim()}${b.getAttribute('aria-disabled') === 'true' ? '(off)' : '(on)'}`).join(' | ');
const cues = () => [...document.querySelectorAll('aside[aria-label=Hop] button')].some((b) => b.textContent === 'Any flags?');
const log = () => document.querySelector('[role=log]')?.innerText ?? '';

export default async function (t) {
  const reduced = await (async () => {
    await t.goto('/analytics');
    return t.eval(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  })();
  const m = reduced ? '[reduced] ' : '';
  await t.wait(900);

  // Hover: nothing until highlight mode is on
  const row = await (await t.page.$(SAND)).boundingBox();
  await t.page.mouse.move(row.x + 120, row.y + 10);
  await t.wait(200);
  await t.check(`${m}mode off: no outline on hover`, async () => !(await t.eval(hoverOutline, SAND)));
  await t.page.mouse.click(row.x + 120, row.y + 10);
  await t.wait(200);
  await t.check(`${m}mode off: a click doesn't pick the row`, async () => (await t.eval(composerChip)) === null);
  await t.click(HIGHLIGHT);
  await t.check(`${m}highlight button pressed`, () => t.eval(modeOn));
  await t.page.mouse.move(row.x + 120, row.y + 12);
  await t.wait(200);
  await t.check(`${m}hover: blue outline on the Sand row`, () => t.eval(hoverOutline, SAND));
  await t.check(`${m}hover: outline sits on the card's side strokes`, () =>
    t.eval((s) => {
      const o = document.querySelector(`${s} > span[aria-hidden].border-selection`).getBoundingClientRect();
      const card = document.querySelector('[data-hop-frame="analytics.card"]').getBoundingClientRect();
      return Math.abs(o.left - card.left) < 0.6 && Math.abs(o.right - card.right) < 0.6;
    }, SAND),
  );
  const tab = await (await t.page.$('#kpi-tab-orders')).boundingBox();
  await t.page.mouse.move(tab.x + 30, tab.y + 20);
  await t.wait(200);
  await t.check(`${m}hover: outline over a tab too`, () => t.eval(hoverOutline, '[data-hop-frame="analytics.kpi.orders"]'));

  // Select the Sand row
  await t.page.mouse.click(row.x + 120, row.y + 10);
  await t.wait(60);
  const outlineMid = await t.eval((s) => getComputedStyle(document.querySelector(`${s} > span[aria-hidden] .border-selection`)).transform, SAND);
  await t.wait(400);
  await t.check(`${m}select: outline + 4 handles`, async () => (await t.eval(selectedOverlay, SAND)) && (await t.eval(handles, SAND)) === 4);
  if (!reduced) await t.check(`select: outline grows in (transform at 60ms: ${outlineMid})`, outlineMid !== 'none');
  await t.check(`${m}select: tag chip in the composer`, async () => (await t.eval(composerChip)) === 'Linen two-piece (Sand)');
  await t.check(`${m}select: placeholder "Ask about this frame…"`, () => t.eval(() => document.querySelector('textarea').placeholder === 'Ask about this frame…'));
  await t.check(`${m}select: jump chips "${await t.eval(chips)}"`, async () => (await t.eval(chips)) === 'Go to Inventory(on) | Go to Analytics(off)');
  await t.check(`${m}select: cues swapped out`, async () => !(await t.eval(cues)));
  await t.page.mouse.move(700, 880);
  await t.wait(200);
  await t.shot(`phase5-${reduced ? 'reduced-' : ''}selected`);

  // Esc deselects, cues return; highlight mode stays on
  await t.page.keyboard.press('Escape');
  await t.wait(500);
  await t.check(`${m}Esc: deselects, cues come back`, async () => !(await t.eval(selectedOverlay, SAND)) && (await t.eval(cues)) && (await t.eval(composerChip)) === null);
  await t.check(`${m}Esc: highlight mode still on`, () => t.eval(modeOn));

  // Select again and send with no text
  await t.page.mouse.click(row.x + 120, row.y + 10);
  await t.wait(300);
  await t.click('textarea[aria-label="Message Hop"]');
  const sentAt = Date.now();
  await t.page.keyboard.press('Enter');
  await t.wait(300);
  await t.check(`${m}send: bubble "Tell me more about this" with the tag`, async () => {
    const l = await t.eval(log);
    return l.includes('Linen two-piece (Sand)') && l.includes('Tell me more about this') && l.includes('Amara · 2:31 PM');
  });
  await t.check(`${m}send: composer chip leaves`, async () => (await t.eval(composerChip)) === null);
  await t.check(`${m}send: highlight mode switches off`, async () => !(await t.eval(modeOn)));
  await t.check(`${m}scan: avatar goes to scanning`, () => t.eval(() => document.querySelector('aside[aria-label=Hop] header svg[data-state]')?.dataset.state === 'scanning'));
  if (reduced) await t.check('[reduced] scan: static outline + "Hop is reading…"', () => t.eval(() => document.body.innerText.includes('Hop is reading…')));
  else await t.check('scan: band sweeping across the frame', () => t.eval((s) => !!document.querySelector(`${s} [class*="via-selection"]`), SAND));
  await t.shot(`phase5-${reduced ? 'reduced-' : ''}scanning`);
  // wait for streaming to begin, measure the scan length
  await t.page.waitForFunction(() => !document.querySelector('[aria-label="Hop is typing"]'), { timeout: 3000 });
  const scanMs = Date.now() - sentAt;
  await t.check(`${m}scan lasts at least 900ms (${scanMs}ms)`, scanMs >= 880);
  await t.wait(2500);
  await t.check(`${m}answer: Sand answer with Sizes left`, async () => {
    const l = await t.eval(log);
    return l.includes('The Sand two-piece is your best seller') && l.includes('Sizes left') && l.includes('Size 16') && l.includes('arriving next Wednesday');
  });
  await t.check(`${m}answer: zero sizes are red`, () =>
    t.eval(() => [...document.querySelectorAll('[role=log] .bg-status-danger-soft')].map((c) => c.textContent).join(',') === 'Size 80,Size 160'),
  );
  await t.check(`${m}answer: highlight cleared`, async () => !(await t.eval(selectedOverlay, SAND)));
  await t.check(`${m}answer: jump chips gone, cues back`, async () => (await t.eval(chips)) === '' && (await t.eval(cues)));
  await t.check(`${m}answer: composer back to "Select any frame"`, () => t.eval(() => document.querySelector('aside[aria-label=Hop] .shadow-composer')?.textContent.includes('Select any frame')));
  await t.page.mouse.move(700, 880);
  await t.wait(200);
  await t.shot(`phase5-${reduced ? 'reduced-' : ''}answered`);

  // Click the tag in the earlier message
  await t.click('button[aria-label="Show Linen two-piece (Sand) on the page"]');
  await t.wait(500);
  await t.check(`${m}tag click: tag turns active blue`, () => t.eval(() => document.querySelector('button[aria-label="Show Linen two-piece (Sand) on the page"]').getAttribute('aria-pressed') === 'true'));
  await t.check(`${m}tag click: highlight back on the row`, () => t.eval(selectedOverlay, SAND));
  await t.check(`${m}tag click: composer tag and jump chips back`, async () => (await t.eval(composerChip)) === 'Linen two-piece (Sand)' && (await t.eval(chips)) === 'Go to Inventory(on) | Go to Analytics(off)');
  await t.page.mouse.move(700, 880);
  await t.wait(200);
  await t.shot(`phase5-${reduced ? 'reduced-' : ''}tag-clicked`);

  // Click empty space deselects
  await t.page.mouse.click(700, 110); // greeting area, not a frame
  await t.wait(400);
  await t.check(`${m}click on empty space deselects`, async () => !(await t.eval(selectedOverlay, SAND)));

  // In highlight mode a click on a KPI tab tags it without switching KPI
  await t.click(HIGHLIGHT);
  await t.page.mouse.click(tab.x + 30, tab.y + 20);
  await t.wait(400);
  await t.check(`${m}highlight mode: clicking the Orders tab tags it`, async () => (await t.eval(composerChip)) === 'Orders');
  await t.check(`${m}highlight mode: the click doesn't switch the KPI`, () => t.eval(() => document.querySelector('#kpi-tab-revenue').getAttribute('aria-selected') === 'true'));
  await t.check(`${m}Orders tag jumps to Sales`, async () => (await t.eval(chips)).startsWith('Go to Sales(on)'));
  await t.page.keyboard.press('Escape');
  await t.page.keyboard.press('Escape');
  await t.wait(400);
  await t.check(`${m}second Esc leaves highlight mode`, async () => !(await t.eval(modeOn)));

  // Urgent: Draft replies → tagged message, scan, answer with buttons, toast
  await t.click('text=Draft replies');
  await t.wait(200);
  await t.check(`${m}Draft replies sends a tagged message`, async () => {
    const l = await t.eval(log);
    return l.includes('Draft replies for the 3 customers') && l.includes('3 customers waiting 2h+');
  });
  await t.check(`${m}Draft replies: the Urgent row is highlighted while Hop reads`, () => t.eval(selectedOverlay, '[data-hop-frame="analytics.urgent.urgent-waiting"]'));
  await t.wait(3500);
  await t.check(`${m}Draft replies: answer ends with approve buttons`, async () => (await t.eval(log)).includes('Send all 3'));
  await t.click('text=Send all 3');
  await t.wait(300);
  await t.check(`${m}approve button shows a toast`, () => t.eval(() => [...document.querySelectorAll('[role=status]')].some((s) => s.textContent.includes('Replies sent'))));
}
