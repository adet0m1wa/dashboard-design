// Phase 6: Inventory, jump chips, page markers, sidebar clearing the chips.
const SAND = '[data-hop-frame="analytics.card.linen-sand"]';
const ADIRE = '[data-hop-frame="inventory.row.adire-blue"]';
const chips = () => [...document.querySelectorAll('aside[aria-label=Hop] button')].filter((b) => b.textContent.startsWith('Go to')).map((b) => `${b.textContent.trim()}${b.getAttribute('aria-disabled') === 'true' ? '(off)' : '(on)'}`).join(' | ');
const log = () => document.querySelector('[role=log]')?.innerText ?? '';
const selected = (sel) => document.querySelector(`${sel} > span[aria-hidden] .border-selection`) !== null;

export default async function (t) {
  await t.goto('/analytics');
  const reduced = await t.eval(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const m = reduced ? '[reduced] ' : '';
  await t.wait(900);

  // Ask about the Sand row on Analytics (2:31), then bring the highlight back from the tag
  await t.click(`${SAND} span.truncate`);
  await t.wait(250);
  await t.click('textarea[aria-label="Message Hop"]');
  await t.page.keyboard.press('Enter');
  await t.wait(3500);
  await t.click('button[aria-label="Show Linen two-piece (Sand) on the page"]');
  await t.wait(400);
  await t.check(`${m}before the jump: ${await t.eval(chips)}`, async () => (await t.eval(chips)) === 'Go to Inventory(on) | Go to Analytics(off)');

  // Jump
  const before = await t.eval(() => getComputedStyle([...document.querySelectorAll('aside[aria-label=Hop] button')].find((b) => b.textContent.startsWith('Go to Inventory'))).backgroundColor);
  await t.click('text=Go to Inventory');
  await t.wait(80);
  const mid = await t.eval(() => getComputedStyle([...document.querySelectorAll('aside[aria-label=Hop] button')].find((b) => b.textContent.startsWith('Go to Inventory'))).backgroundColor);
  await t.wait(700);
  await t.check(`${m}jump: now on /inventory`, () => t.eval(() => location.pathname === '/inventory' && document.querySelector('[data-page]').dataset.page === 'inventory'));
  await t.check(`${m}jump: marker "Moved to Inventory · 2:32 PM"`, async () => (await t.eval(log)).includes('Moved to Inventory · 2:32 PM'));
  await t.check(`${m}jump: chips flip (${await t.eval(chips)})`, async () => (await t.eval(chips)) === 'Go to Inventory(off) | Go to Analytics(on)');
  if (!reduced) await t.check(`jump: chip fill crossfades (${before} → ${mid} mid-way)`, mid !== before && mid !== 'rgb(240, 240, 238)');
  await t.check(`${m}Inventory: tiles, pill and 8 stock rows`, () =>
    t.eval(() => document.body.innerText.includes('Stock value') && document.body.innerText.includes('3 need attention') && document.querySelectorAll('[data-hop-frame^="inventory.row."]').length === 8),
  );

  // First visit: the stock bars grew from 0 (checked by sampling a fresh visit below)
  // Select the Adire row and ask (2:33)
  await t.click(`${ADIRE} span.truncate`);
  await t.wait(300);
  await t.check(`${m}Inventory: selecting a row keeps the chips (${await t.eval(chips)})`, async () => (await t.eval(chips)) === 'Go to Inventory(off) | Go to Analytics(on)');
  await t.click('textarea[aria-label="Message Hop"]');
  await t.page.keyboard.type('What am I seeing?');
  await t.page.keyboard.press('Enter');
  await t.wait(3800);
  await t.check(`${m}Adire: "Amara · 2:33 PM" + tag + question`, async () => {
    const l = await t.eval(log);
    return l.includes('Amara · 2:33 PM') && l.includes('Adire shirt dress') && l.includes('What am I seeing?');
  });
  await t.check(`${m}Adire: answer with Add to restock / Notify me when back`, async () => {
    const l = await t.eval(log);
    return l.includes('This is the Adire shirt dress in Blue') && l.includes('Add to restock') && l.includes('Notify me when back') && l.includes('read Inventory, Customers');
  });
  await t.check(`${m}after the answer: nothing selected, chips stay`, async () => !(await t.eval(selected, ADIRE)) && (await t.eval(chips)) === 'Go to Inventory(off) | Go to Analytics(on)');
  await t.page.mouse.move(700, 880);
  await t.wait(300);
  await t.shot(`phase6-${reduced ? 'reduced-' : ''}inventory-chips-stay`);

  // Hover a row: faint fill + outline
  const row = await (await t.page.$('[data-hop-frame="inventory.row.slip-emerald"]')).boundingBox();
  await t.page.mouse.move(row.x + 150, row.y + row.height / 2);
  await t.wait(250);
  await t.check(`${m}row hover: faint fill + outline`, () =>
    t.eval(() => {
      const r = document.querySelector('[data-hop-frame="inventory.row.slip-emerald"]');
      return getComputedStyle(r).backgroundColor === 'rgb(250, 250, 248)' && !!r.querySelector(':scope > span[aria-hidden][class*="border-selection/35"]');
    }),
  );
  await t.click('button[aria-label="Edit Satin slip dress, Emerald"]');
  await t.wait(250);
  await t.check(`${m}Edit is a stub toast`, () => t.eval(() => document.body.innerText.includes('Product page coming soon')));

  // Go to Analytics: back, chips gone, marker
  await t.click('text=Go to Analytics');
  await t.wait(700);
  await t.check(`${m}Go to Analytics: back on /analytics, chips gone`, async () => (await t.eval(() => location.pathname)) === '/analytics' && (await t.eval(chips)) === '');
  await t.check(`${m}Go to Analytics: marker "Moved to Analytics · 2:34 PM"`, async () => (await t.eval(log)).includes('Moved to Analytics · 2:34 PM'));

  // Sidebar navigation clears jumpOrigin
  await t.click(`${SAND} span.truncate`);
  await t.wait(250);
  await t.click('text=Go to Inventory');
  await t.wait(600);
  await t.check(`${m}jump again: chips on Inventory`, async () => (await t.eval(chips)) !== '');
  await t.eval(() => [...document.querySelectorAll('nav[aria-label=Pages] button')].find((b) => b.textContent.includes('Sales')).click());
  await t.wait(600);
  await t.check(`${m}sidebar navigation clears the chips`, async () => (await t.eval(chips)) === '');

  // Tag in an old message → navigates back to Analytics and re-highlights
  await t.click('button[aria-label="Show Linen two-piece (Sand) on the page"]');
  await t.wait(1000);
  await t.check(`${m}tag from another page: back on Analytics with the Sand row highlighted`, async () => (await t.eval(() => location.pathname)) === '/analytics' && (await t.eval(selected, SAND)));
  await t.page.keyboard.press('Escape');
  await t.wait(300);

  // Card link: navigates without chips
  await t.click('text=Open Sales');
  await t.wait(600);
  await t.check(`${m}card link "Open Sales" navigates without chips`, async () => (await t.eval(() => location.pathname)) === '/sales' && (await t.eval(chips)) === '');

  // Stock bars grow from 0 on the first visit (fresh load)
  await t.page.goto((process.env.HOP_URL ?? 'http://localhost:3000') + '/inventory', { waitUntil: 'domcontentloaded' });
  await t.page.waitForSelector('[data-hop-frame="inventory.row.scarf-rust"]');
  await t.wait(60);
  const early = await t.eval(() => document.querySelector('[data-hop-frame="inventory.row.scarf-rust"] [aria-hidden=true] > span').getBoundingClientRect().width);
  await t.wait(900);
  const late = await t.eval(() => document.querySelector('[data-hop-frame="inventory.row.scarf-rust"] [aria-hidden=true] > span').getBoundingClientRect().width);
  if (reduced) await t.check(`[reduced] stock bars appear full at once (${early} → ${late})`, early === 70 && late === 70);
  else await t.check(`stock bars grow from 0 on first visit (${early.toFixed(1)}px → ${late}px)`, early < 60 && late === 70);
}
