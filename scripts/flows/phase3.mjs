// Phase 3: Analytics interactive. Samples mid-animation so "it animated" is measured, not assumed.
// Works in both modes: run once normally and once with --reduced.
const revenue = () => document.querySelector('#kpi-tab-revenue span[aria-label]')?.textContent;
const mainLine = () => [...document.querySelectorAll('#kpi-chart path[stroke-width="2"]')].pop()?.getAttribute('d');
const cardTitle = () => document.querySelector('[data-hop-frame="analytics.card"] h3')?.textContent;
const chartTitle = () => document.querySelector('[data-hop-frame="analytics.chart"] h3:last-of-type')?.textContent;

export default async function (t) {
  const reduced = await (async () => {
    await t.page.goto((process.env.HOP_URL ?? 'http://localhost:3000') + '/analytics', { waitUntil: 'domcontentloaded' });
    return t.eval(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  })();
  const mode = reduced ? '[reduced] ' : '';

  // 1. First-load entrance ------------------------------------------------------------------
  await t.page.waitForSelector('#kpi-tab-revenue');
  await t.wait(120);
  const early = await t.eval(revenue);
  const earlyLine = await t.eval(() => [...document.querySelectorAll('#kpi-chart path[stroke-width="2"]')].pop().getAttribute('stroke-dasharray'));
  const earlyDot = await t.eval(() => getComputedStyle(document.querySelectorAll('#kpi-chart circle')[3]).transform);
  const earlyCardOpacity = await t.eval(() => +getComputedStyle(document.querySelector('[data-hop-frame="analytics.card"]').parentElement).opacity);
  await t.wait(1400);
  const late = await t.eval(revenue);
  if (reduced) {
    await t.check(`${mode}entrance: numbers appear at once (${early})`, early === '$2,480');
    await t.check(`${mode}entrance: cards visible at once (opacity ${earlyCardOpacity})`, earlyCardOpacity === 1);
    await t.check(`${mode}entrance: no line drawing (dash ${earlyLine})`, !earlyLine || earlyLine === '1 1');
  } else {
    await t.check(`entrance: revenue counts up from 0 (at 120ms: ${early})`, early !== '$2,480' && /^\$/.test(early));
    await t.check(`entrance: cards fade up (opacity at 120ms: ${earlyCardOpacity.toFixed(2)})`, earlyCardOpacity < 1);
    await t.check(`entrance: line draws in (dash at 120ms: ${String(earlyLine).slice(0, 5)})`, earlyLine && parseFloat(earlyLine) < 0.95);
    await t.check(`entrance: dots pop in later (today's dot at 120ms: ${earlyDot})`, earlyDot.startsWith('matrix(0,'));
  }
  await t.check(`${mode}entrance: settles on $2,480 (${late})`, late === '$2,480');
  await t.shot(`phase3-${reduced ? 'reduced-' : ''}first-load`);

  // Entrance is first-load only: leave and come back.
  await t.click('text=History');
  await t.wait(500);
  await t.click('text=Analytics');
  await t.wait(150);
  await t.check(`${mode}entrance does not replay on return (${await t.eval(revenue)})`, (await t.eval(revenue)) === '$2,480');
  await t.wait(400);

  // 2. KPI switch: line morphs, card swaps, heights stay equal ----------------------------
  const before = await t.eval(mainLine);
  await t.click('#kpi-tab-orders');
  await t.wait(110);
  const mid = await t.eval(mainLine);
  await t.wait(700);
  const after = await t.eval(mainLine);
  if (reduced) await t.check(`${mode}KPI switch: line swaps instantly`, mid === after && after !== before);
  else await t.check('KPI switch: line morphs (mid-path differs from start and end)', mid !== before && mid !== after);
  await t.check(`${mode}KPI switch: card is "Orders placed today"`, (await t.eval(cardTitle)) === 'Orders placed today');
  await t.check(`${mode}KPI switch: title "Orders over the last 7 days"`, (await t.eval(chartTitle)) === 'Orders over the last 7 days');
  const heights = () =>
    t.eval(() => [...document.querySelector('[data-hop-frame="analytics.card"]').closest('.grid').children].map((c) => Math.round(c.getBoundingClientRect().height)));
  const hs = await heights();
  await t.check(`${mode}cards stay the same height (${hs.join(' / ')})`, hs[0] === hs[1]);

  // DMs tint: green → red
  await t.click('#kpi-tab-dms');
  await t.wait(90);
  const strokeMid = await t.eval(() => getComputedStyle([...document.querySelectorAll('#kpi-chart path[stroke-width="2"]')].pop()).stroke);
  await t.wait(500);
  const strokeEnd = await t.eval(() => getComputedStyle([...document.querySelectorAll('#kpi-chart path[stroke-width="2"]')].pop()).stroke);
  await t.check(`${mode}DMs: line ends red (${strokeEnd})`, strokeEnd === 'rgb(194, 65, 12)');
  if (!reduced) await t.check(`DMs: colour tweens (at 90ms: ${strokeMid})`, strokeMid !== strokeEnd && strokeMid !== 'rgb(31, 138, 76)');
  await t.shot(`phase3-${reduced ? 'reduced-' : ''}dms`);
  await t.click('#kpi-tab-revenue');
  await t.wait(600);

  // 3. Chart hover -------------------------------------------------------------------------
  const svg = await t.page.$('#kpi-chart');
  const box = await svg.boundingBox();
  await t.page.mouse.move(box.x + 244, box.y + 60); // Wednesday
  await t.wait(200);
  const tip = await t.eval(() => document.querySelector('#kpi-chart ~ [role=status]')?.textContent);
  await t.check(`${mode}hover Wed: tooltip "${tip}"`, tip?.includes('$3,120') && tip.includes('+30% vs last Wed'));
  const r = await t.eval(() => [...document.querySelectorAll('#kpi-chart circle')][2].getAttribute('r'));
  await t.check(`${mode}hover Wed: dot grows to 5.5 (r=${r})`, Math.abs(+r - 5.5) < 0.05);
  await t.shot(`phase3-${reduced ? 'reduced-' : ''}hover`);
  await t.page.mouse.move(box.x + 600, box.y + 60); // Saturday — future, snaps to today
  await t.wait(200);
  const tip2 = await t.eval(() => document.querySelector('#kpi-chart ~ [role=status]')?.textContent);
  await t.check(`${mode}hover over a future day snaps to today ("${tip2}")`, tip2?.includes('$2,480'));
  await t.page.mouse.move(box.x + 300, box.y + 300);
  await t.wait(250);

  // 4. Select Wednesday ----------------------------------------------------------------------
  await t.click('button[aria-label="Wed, show that day"]');
  await t.wait(110);
  const wedMid = await t.eval(revenue);
  await t.wait(700);
  await t.check(`${mode}Wed: title "${await t.eval(chartTitle)}"`, (await t.eval(chartTitle)) === 'Wednesday, 23 Sep');
  await t.check(`${mode}Wed: revenue counts to $3,120 (mid ${wedMid})`, (await t.eval(revenue)) === '$3,120' && (reduced ? wedMid === '$3,120' : wedMid !== '$3,120'));
  await t.check(`${mode}Wed: label drops "today"`, await t.eval(() => document.querySelector('#kpi-tab-revenue').textContent.startsWith('Revenue$')));
  await t.check(`${mode}Wed: card "Top revenue generators · Wed"`, (await t.eval(cardTitle)) === 'Top revenue generators · Wed');
  await t.check(`${mode}Wed: Urgent shows done pills`, await t.eval(() => ['Resolved', 'Completed', 'Attended'].every((s) => document.body.textContent.includes(s))));
  await t.check(`${mode}Wed: dashed guide drawn`, await t.eval(() => !!document.querySelector('#kpi-chart path[stroke-dasharray="2 3"]')));
  await t.shot(`phase3-${reduced ? 'reduced-' : ''}wednesday`);
  await t.page.keyboard.press('Escape');
  await t.wait(700);
  await t.check(`${mode}Esc returns to today`, (await t.eval(chartTitle)) === 'Revenue over the last 7 days' && (await t.eval(revenue)) === '$2,480');

  // 5. Week toggle ---------------------------------------------------------------------------
  await t.click('text=Last week');
  await t.wait(700);
  await t.check(`${mode}Last week: title`, (await t.eval(chartTitle)) === 'Last week · 14–20 Sep');
  await t.check(`${mode}Last week: revenue $15,810`, (await t.eval(revenue)) === '$15,810');
  await t.check(`${mode}Last week: comparison line gone`, await t.eval(() => !document.querySelector('#kpi-chart .stroke-chart-compare:not([class*=pointer])')));
  await t.check(`${mode}Last week: 7 dots`, (await t.eval(() => document.querySelectorAll('#kpi-chart circle').length)) === 7);
  await t.shot(`phase3-${reduced ? 'reduced-' : ''}lastweek`);
  await t.click('text=This week');
  await t.wait(700);
  await t.check(`${mode}This week again: back to today`, (await t.eval(revenue)) === '$2,480' && (await t.eval(() => document.querySelectorAll('#kpi-chart circle').length)) === 4);

  // 6. Last sync -----------------------------------------------------------------------------
  await t.click('text=Last sync: 14:00');
  await t.wait(80);
  const syncing = await t.eval(() => document.querySelector('header button[aria-live]')?.textContent.trim());
  await t.wait(900);
  const synced = await t.eval(() => document.querySelector('header button[aria-live]')?.textContent.trim());
  await t.check(`${mode}Last sync: "Syncing…" then "${synced}"`, syncing === 'Syncing…' && synced === 'Last sync: 14:30');
  await t.check(`${mode}Last sync: greeting says 2:30 PM`, await t.eval(() => document.body.textContent.includes('Hop last checked everything at 2:30 PM.')));

  // 7. Remind Ife toast ----------------------------------------------------------------------
  await t.click('text=Remind Ife');
  await t.wait(300);
  await t.check(`${mode}Remind Ife shows a toast`, await t.eval(() => [...document.querySelectorAll('[role=status]')].some((s) => s.textContent === 'Reminder sent to Ife')));

  // 8. Keyboard ------------------------------------------------------------------------------
  await t.eval(() => document.querySelector('#kpi-tab-revenue').focus());
  await t.page.keyboard.press('ArrowRight');
  await t.wait(300);
  await t.check(`${mode}KPI tabs: → selects and focuses Orders`, await t.eval(() => document.activeElement?.id === 'kpi-tab-orders' && document.activeElement.getAttribute('aria-selected') === 'true'));
  await t.eval(() => document.querySelector('button[aria-label="Today"]').focus());
  await t.page.keyboard.press('ArrowLeft');
  await t.page.keyboard.press('Enter');
  await t.wait(700);
  await t.check(`${mode}Days: ← then Enter selects Wednesday`, (await t.eval(chartTitle)) === 'Wednesday, 23 Sep');
  await t.page.keyboard.press('Escape');
  await t.wait(500);
}
