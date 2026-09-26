// Phase 2: every KPI state, Wednesday, Last week — screenshot each for comparison with Figma.
const KPIS = [
  ['revenue', 'Revenue today', 'Top revenue generators'],
  ['orders', 'Orders', 'Orders placed today'],
  ['likes', 'Instagram likes', 'Most liked posts today'],
  ['followers', 'New followers', 'Where new followers came from'],
  ['dms', 'Unanswered DMs', 'Waiting for a reply'],
];

export default async function (t) {
  await t.goto('/analytics');
  for (const [id, , cardTitle] of KPIS) {
    await t.click(`#kpi-tab-${id}`);
    await t.page.mouse.move(700, 880); // park the cursor away from anything hoverable
    await t.wait(700);
    await t.check(`${id}: tab selected`, () => t.eval((k) => document.querySelector(`#kpi-tab-${k}`).getAttribute('aria-selected') === 'true', id));
    await t.check(`${id}: card "${cardTitle}"`, () => t.eval((c) => document.querySelector('[data-hop-frame="analytics.card"] h3')?.textContent === c, cardTitle));
    await t.check(`${id}: both cards same height`, () =>
      t.eval(() => {
        const [a, b] = document.querySelector('[data-hop-frame="analytics.card"]').parentElement.children;
        return Math.abs(a.getBoundingClientRect().height - b.getBoundingClientRect().height) < 0.5;
      }),
    );
    await t.shot(`phase2-${id}`);
  }

  await t.click('#kpi-tab-revenue');
  await t.click('text=Wed');
  await t.page.mouse.move(700, 880);
  await t.wait(700);
  await t.check('Wednesday: title', () => t.eval(() => document.querySelector('[data-hop-frame="analytics.chart"] h3').textContent === 'Wednesday, 23 Sep'));
  await t.check('Wednesday: label drops "today"', () => t.eval(() => document.querySelector('#kpi-tab-revenue').textContent.startsWith('Revenue$')));
  await t.check('Wednesday: urgent shows Resolved/Completed/Attended', () =>
    t.eval(() => ['Resolved', 'Completed', 'Attended'].every((s) => document.body.textContent.includes(s))),
  );
  await t.shot('phase2-wednesday');

  await t.click('text=Last week');
  await t.page.mouse.move(700, 880);
  await t.wait(700);
  await t.check('Last week: title', () => t.eval(() => document.querySelector('[data-hop-frame="analytics.chart"] h3').textContent === 'Last week · 14–20 Sep'));
  await t.check('Last week: footer $9,200 (B11)', () => t.eval(() => document.querySelector('[data-hop-frame="analytics.card"]').textContent.includes('$9,200')));
  await t.check('Last week: no comparison line', () => t.eval(() => !document.querySelector('#kpi-chart .stroke-chart-compare')));
  await t.shot('phase2-lastweek');
}
