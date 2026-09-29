// Feedback round 1 (2026-09-28): collapsible sidebar and Hop panel (Figma "example 1"/"example 2"),
// composer focus border, chart that fills its width and eases without a late snap.
// (Highlight mode and the new page-marker rule are covered in phase5/phase6.)
const width = (sel) => document.querySelector(sel).getBoundingClientRect().width;
const SIDEBAR = 'aside[aria-label=Sidebar]';
const PANEL = 'aside[aria-label=Hop]';

export default async function (t) {
  await t.goto('/analytics');
  const reduced = await t.eval(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const m = reduced ? '[reduced] ' : '';
  await t.wait(2600);

  // Sidebar collapses to the 56px rail — instantly (feedback 2026-09-29)
  await t.check(`${m}sidebar starts open at 224`, async () => (await t.eval(width, SIDEBAR)) === 224);
  await t.click('button[aria-label="Collapse sidebar"]');
  await t.wait(40);
  const sideMid = await t.eval(width, SIDEBAR);
  await t.wait(300);
  const sideEnd = await t.eval(width, SIDEBAR);
  await t.check(`${m}sidebar collapses to 56 at once (${sideMid} at 40ms → ${sideEnd})`, sideEnd === 56 && sideMid === 56);
  await t.check(`${m}rail: icon-only nav with accessible names`, () =>
    t.eval(() => {
      const names = [...document.querySelectorAll('aside[aria-label=Sidebar] nav button')].map((b) => b.getAttribute('aria-label'));
      return names.length === 6 && names[4] === 'Inventory, 4 need attention' && !document.querySelector('aside[aria-label=Sidebar]').innerText.includes('Analytics');
    }),
  );
  await t.check(`${m}rail: workspace starts at x 72`, () => t.eval(() => document.querySelector('main').getBoundingClientRect().left === 72));
  await t.eval(() => document.querySelector('aside[aria-label=Sidebar] nav button[aria-label="History"]').click());
  await t.wait(600);
  await t.check(`${m}rail: nav still works`, () => t.eval(() => location.pathname === '/history'));
  await t.eval(() => document.querySelector('aside[aria-label=Sidebar] nav button[aria-label="Analytics"]').click());
  await t.wait(600);
  await t.page.mouse.move(700, 880);
  await t.shot(`feedback1-${reduced ? 'reduced-' : ''}sidebar-rail`);

  // Keyboard: toggling keeps focus on the toggle
  await t.eval(() => document.querySelector('button[aria-label="Expand sidebar"]').focus());
  await t.page.keyboard.press('Enter');
  await t.wait(600);
  await t.check(`${m}sidebar expands back to 224`, async () => (await t.eval(width, SIDEBAR)) === 224);
  await t.check(`${m}keyboard toggle: focus moves to the new toggle`, () => t.eval(() => document.activeElement?.getAttribute('aria-label') === 'Collapse sidebar'));

  // Hop panel: the mascot closes and opens it
  const chartBefore = await t.eval(() => document.querySelector('#kpi-chart').getBoundingClientRect().width);
  await t.click('button[aria-label="Close Hop"]');
  await t.wait(40);
  const panelMid = await t.eval(width, PANEL);
  await t.wait(300);
  const panelEnd = await t.eval(width, PANEL);
  await t.check(`${m}panel closes to 63 at once (${panelMid} at 40ms → ${panelEnd})`, panelEnd === 63 && panelMid === 63);
  await t.check(`${m}closed panel: only the mascot is reachable`, () =>
    t.eval(() => {
      const panel = document.querySelector('aside[aria-label=Hop]');
      const reachable = [...panel.querySelectorAll('button, textarea')].filter((el) => !el.closest('[inert]'));
      return reachable.length === 1 && reachable[0].getAttribute('aria-label') === 'Open Hop';
    }),
  );
  const chartAfter = await t.eval(() => document.querySelector('#kpi-chart').getBoundingClientRect().width);
  await t.check(`${m}chart fills the wider page (${chartBefore} → ${chartAfter})`, chartAfter > chartBefore + 250);
  await t.check(`${m}chart: Sunday's label sits under the last day (12px in from the right)`, () =>
    t.eval(() => {
      const svg = document.querySelector('#kpi-chart').getBoundingClientRect();
      const sun = [...document.querySelectorAll('[aria-label=Days] > *')].pop().getBoundingClientRect();
      return Math.abs(sun.left + sun.width / 2 - (svg.right - 12)) < 1;
    }),
  );
  await t.shot(`feedback1-${reduced ? 'reduced-' : ''}panel-closed`);

  // Urgent action with the panel closed opens it (the answer has to be seen)
  await t.click('text=Draft replies');
  await t.wait(600);
  await t.check(`${m}an Urgent action opens the closed panel`, async () => (await t.eval(width, PANEL)) === 368);
  await t.wait(3500);

  // Composer focus: the border turns blue; no second ring
  await t.click('textarea[aria-label="Message Hop"]');
  await t.wait(250);
  await t.check(`${m}composer focus: border blue, no outline`, () =>
    t.eval(() => {
      const box = document.querySelector('.shadow-composer');
      const cs = getComputedStyle(box);
      return cs.borderTopColor === 'rgb(37, 99, 235)' && cs.outlineStyle === 'none' && getComputedStyle(document.querySelector('textarea')).outlineStyle === 'none';
    }),
  );
  await t.page.mouse.move(700, 880);
  await t.shot(`feedback1-${reduced ? 'reduced-' : ''}composer-focus`);

  // Chart easing: a KPI switch moves the line from the first frames (ease-out), no late snap
  const samples = t.eval(
    () =>
      new Promise((res) => {
        const line = () => [...document.querySelectorAll('#kpi-chart path')].find((p) => p.getAttribute('stroke-width') === '2');
        const y = () => Number(line().getAttribute('d').match(/-?\d+(\.\d+)?/g)[1]);
        const out = [];
        const t0 = performance.now();
        const step = () => {
          out.push([performance.now() - t0, y()]);
          if (performance.now() - t0 < 700) requestAnimationFrame(step);
          else res(out);
        };
        requestAnimationFrame(step);
      }),
  );
  await t.page.keyboard.press('Escape'); // leave the composer
  await t.click('#kpi-tab-dms');
  const ys = await samples;
  const start = ys[0][1];
  const end = ys[ys.length - 1][1];
  const moved = ys.findIndex(([, y]) => y !== start);
  const at = (ms) => ys.find(([time]) => time >= ys[moved][0] + ms)?.[1] ?? end;
  const share = (at(150) - start) / (end - start);
  if (reduced) await t.check(`[reduced] chart: KPI switch is instant (${start.toFixed(1)} → ${end.toFixed(1)})`, ys.filter(([, y]) => y !== start && y !== end).length === 0);
  else await t.check(`chart: 150ms into the morph the line is ${(share * 100).toFixed(0)}% of the way (ease-out, no late snap)`, share > 0.6 && share < 1);
}
