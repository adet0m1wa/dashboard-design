// Recreates each Figma frame's state from a fresh load and screenshots it to --out/<name>.png,
// named like the renders in docs/figma/, for scripts/compare.mjs. (Phase 8: side-by-side check.)
const HIGHLIGHT = 'button[aria-label="Highlight a frame"]';
const SAND = '[data-hop-frame="analytics.card.linen-sand"] span.truncate';
const away = (t) => t.page.mouse.move(700, 895);

export default async function (t) {
  const fresh = async (path = '/analytics') => {
    await t.goto(path);
    await t.wait(path === '/analytics' ? 2600 : 1400);
  };
  const snap = async (name) => {
    await away(t);
    await t.wait(500);
    await t.shot(name);
  };

  await fresh();
  await snap('analytics-revenue');
  await snap('analytics');
  for (const [id, name] of [['orders', 'analytics-orders'], ['likes', 'analytics-likes'], ['followers', 'analytics-followers'], ['dms', 'analytics-dms']]) {
    await t.click(`#kpi-tab-${id}`);
    await t.wait(700);
    await snap(name);
  }
  await t.click('#kpi-tab-revenue');
  await t.wait(600);
  await t.click('button[aria-label="Wed, show that day"]');
  await t.wait(800);
  await snap('analytics-wednesday');
  await t.click('button[aria-label="Today"]');
  await t.click('text=Last week');
  await t.wait(900);
  await snap('analytics-lastweek');

  // Selection frames
  await fresh();
  await t.click(HIGHLIGHT);
  await t.click(SAND);
  await t.wait(500);
  await snap('selected-before-asking');
  await t.click('textarea[aria-label="Message Hop"]');
  await t.page.keyboard.press('Enter');
  await t.wait(3800);
  await t.eval(() => document.activeElement?.blur());
  await snap('answered-highlight-off');
  await t.click('button[aria-label="Show Linen two-piece (Sand) on the page"]');
  await t.wait(700);
  await snap('tag-clicked');
  await t.click('text=Go to Inventory');
  await t.wait(900);
  await t.click(HIGHLIGHT);
  await t.click('[data-hop-frame="inventory.row.adire-blue"] span.truncate');
  await t.wait(300);
  await t.click('textarea[aria-label="Message Hop"]');
  await t.page.keyboard.type('What am I seeing?');
  await t.page.keyboard.press('Enter');
  await t.wait(4000);
  await t.eval(() => document.activeElement?.blur());
  await snap('inventory-chips-stay');

  // History
  const pick = (q) => [...document.querySelectorAll('[data-page=history] button[aria-current]')].find((b) => b.textContent.includes(q)).click();
  await fresh('/history');
  await snap('history-tagged');
  await t.eval(pick, '2:14 PM');
  await t.wait(900);
  await snap('history-analytics');
  await t.eval(pick, 'Why is the Sand reel');
  await t.wait(900);
  await snap('history-screenshot');
  await t.eval(pick, '2:33 PM');
  await t.wait(600);
  await t.click('button[aria-label^="Expand"]');
  await t.wait(1300);
  await snap('history-expanded');

  // Feedback-round frames
  await fresh();
  await t.click('text=Last week');
  await t.click('button[aria-label="Collapse sidebar"]');
  await t.wait(900);
  await snap('example-1');
  await t.click('button[aria-label="Close Hop"]');
  await t.wait(900);
  await snap('example-2');
  await t.click('button[aria-label="Open Hop"]');
  await t.click('button[aria-label="Expand sidebar"]');
  await t.click('text=This week');
  await t.wait(900);
  await t.click(HIGHLIGHT);
  await t.click(SAND);
  await t.wait(600);
  await snap('example-3');
  await t.check('all frames captured', true);
}
