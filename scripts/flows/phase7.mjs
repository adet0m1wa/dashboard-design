// Phase 7: History — chain + trail, selection, the three left-side kinds, filters, Expand/Back,
// Recent with Hop, New chat threads becoming briefs.
// Each brief is an <li>: an overlay button (aria-current) plus the visible text beside it.
const items = () => [...document.querySelectorAll('[data-history-panel] li')].map((li) => li.querySelector('.text-13-5')?.textContent);
const selectedQ = () => document.querySelector('[data-history-panel] button[aria-current="true"]')?.closest('li').querySelector('.text-13-5')?.textContent ?? null;
const note = () => document.querySelector('[data-page=history] p.bg-surface-subtle')?.textContent ?? '';
const pick = (q) => [...document.querySelectorAll('[data-history-panel] li')].find((li) => li.textContent.includes(q)).querySelector('button[aria-current]').click();
const menuPick = async (t, label) => {
  await t.click('button[aria-label^="Show briefs asked on"]');
  await t.wait(500);
  await t.eval((l) => [...document.querySelectorAll('[role=option]')].find((o) => o.textContent === l).click(), label);
  await t.wait(900);
};
const recent = (q) => [...document.querySelectorAll('section[aria-labelledby=recent-heading] button')].find((b) => b.textContent.includes(q)).click();
// Trail: for each visible brief, whether its above/below segments are drawn.
const trail = () =>
  [...document.querySelectorAll('[data-history-panel] section[aria-label=Today], [data-history-panel] section[aria-label=Yesterday]')].map((sec) =>
    [...sec.querySelectorAll('li')].map((li) => {
      const [above, , below] = li.querySelector('[aria-hidden=true]').children;
      return `${above.classList.contains('hop-trail') ? '|' : '.'}${below.classList.contains('hop-trail') ? '|' : '.'}`;
    }).join(' '),
  );

export default async function (t) {
  await t.goto('/analytics');
  const reduced = await t.eval(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const m = reduced ? '[reduced] ' : '';
  await t.wait(2600);

  // A finished conversation goes to History on New chat
  await t.click('text=How are we doing today?');
  await t.wait(3500);
  await t.click('button[aria-label="New chat"]');
  await t.wait(500);

  // Sidebar → History
  await t.eval(() => document.querySelector('nav[aria-label=Pages] button:nth-child(2)').click());
  await t.wait(150);
  const panelMid = await t.eval(() => document.querySelector('aside[aria-label^=Hop]').getBoundingClientRect().width);
  await t.settle(300);
  await t.check(`${m}History: the side panel stays (${panelMid.toFixed(0)} mid-way), same width, Hop's face, can't be closed`, async () =>
    (await t.eval(() => document.querySelector('aside[aria-label^=Hop]').getBoundingClientRect().width)) === 368 &&
    (await t.eval(() => !document.querySelector('button[aria-label="Close Hop"]') && document.querySelector('aside[aria-label^=Hop] header svg[role=img]') !== null && document.querySelector('aside[aria-label^=Hop] header').textContent.includes('Hop'))),
  );
  await t.check(`${m}chain: the saved thread is on top of Today (${(await t.eval(items))[0]})`, async () => {
    const list = await t.eval(items);
    return list[0] === 'How are we doing today?' && list.length === 8 && list[2] === 'What am I seeing?'; // 7 today + 1 yesterday
  });
  await t.check(`${m}chain: newest brief reads "Amara · 2:31 PM"`, () => t.eval(() => document.querySelector('[data-history-panel] li').textContent.includes('Amara · 2:31 PM')));
  await t.check(`${m}default selection: the 2:33 Adire brief with its 18px expand icon beside the page pill`, async () =>
    (await t.eval(selectedQ)) === 'What am I seeing?' &&
    (await t.eval(() => {
      const icon = [...document.querySelectorAll('[data-history-panel] li button[aria-label^="Open the chat"]')].find((b) => !b.hasAttribute('aria-current'));
      const r = icon?.querySelector('svg').getBoundingClientRect();
      return !!r && r.width === 18 && icon.previousElementSibling?.textContent === 'Inventory' && !document.body.innerText.includes('Expand');
    })),
  );
  await t.check(`${m}trail: segments hidden at the ends of each day (${(await t.eval(trail)).join(' / ')})`, async () => {
    const [today, yesterday] = await t.eval(trail);
    return today === ['.|', '||', '||', '||', '||', '||', '|.'].join(' ') && yesterday === '..';
  });
  await t.check(`${m}trail: 1.5px wide, tone-27 dashes`, () =>
    t.eval(() => {
      const seg = document.querySelector('.hop-trail');
      const cs = getComputedStyle(seg);
      return seg.getBoundingClientRect().width === 1.5 && cs.backgroundImage.includes('repeating-linear-gradient') && cs.backgroundImage.includes('rgb(201, 198, 191)');
    }),
  );
  await t.check(`${m}tagged: note "${await t.eval(note)}"`, async () => (await t.eval(note)) === 'Screenshot of Inventory — taken at 2:33 PM when Amara tagged “Adire shirt dress”');
  await t.check(`${m}tagged: the Inventory page in a card, Adire row outlined`, () =>
    t.eval(() => {
      const card = document.querySelector('[data-page=history] .shadow-screenshot-card');
      return !!card && !!card.querySelector('[data-hop-frame="inventory.row.adire-blue"] > span[aria-hidden] .border-selection') && card.querySelector('[inert]') !== null;
    }),
  );
  await t.shot(`phase7-${reduced ? 'reduced-' : ''}tagged`);

  // Select the 2:14 brief: background slides, Expand pops, left side swaps to Analytics
  const bgBefore = await t.eval(() => document.querySelector('li > span.bg-palette-tone-28').getBoundingClientRect().top);
  await t.eval(pick, '2:14 PM');
  await t.wait(60);
  const bgMid = await t.eval(() => document.querySelector('li > span.bg-palette-tone-28').getBoundingClientRect().top);
  await t.wait(800);
  const bgAfter = await t.eval(() => document.querySelector('li > span.bg-palette-tone-28').getBoundingClientRect().top);
  if (!reduced) await t.check(`select: the background slides (${bgBefore.toFixed(0)} → ${bgMid.toFixed(0)} → ${bgAfter.toFixed(0)})`, bgMid > bgBefore && bgMid < bgAfter);
  await t.check(`${m}analytics kind: note "${await t.eval(note)}"`, async () => (await t.eval(note)) === 'Analytics as it was at 2:14 PM, Thu 24 Sep — when Amara asked');
  await t.check(`${m}analytics kind: the real Analytics page, read-only`, () =>
    t.eval(() => {
      const snap = document.querySelector('[data-page=history] [inert]');
      return !!snap && snap.textContent.includes('Good afternoon, Amara') && snap.textContent.includes('$2,480');
    }),
  );
  await t.shot(`phase7-${reduced ? 'reduced-' : ''}analytics`);

  // Zee's Instagram brief: the screenshot image
  await t.eval(pick, 'Why is the Sand reel');
  await t.wait(800);
  await t.check(`${m}screenshot kind: Instagram image in a card`, () =>
    t.eval(() => {
      const img = document.querySelector('[data-page=history] .shadow-screenshot-card img');
      return !!img && img.complete && img.naturalWidth === 1530;
    }),
  );
  await t.check(`${m}screenshot kind: note`, async () => (await t.eval(note)) === 'Screenshot of Instagram — taken at 1:40 PM, Thu 24 Sep, when Zee asked');
  await t.shot(`phase7-${reduced ? 'reduced-' : ''}screenshot`);

  // Hop's morning brief shows Wednesday
  await t.eval(pick, 'Morning brief');
  await t.wait(800);
  await t.check(`${m}morning brief: Analytics on Wednesday`, async () =>
    (await t.eval(note)).startsWith('Analytics as it was at 8:00 AM') && (await t.eval(() => document.querySelector('[data-page=history] [inert]').textContent.includes('Wednesday, 23 Sep'))),
  );

  // Filters
  await t.click('button[aria-pressed][class*=rounded-999]:nth-of-type(2)'); // Amara
  await t.wait(80);
  const collapsing = await t.eval(() => [...document.querySelectorAll('[data-history-panel] li')].length);
  await t.wait(600);
  await t.check(`${m}person filter: Amara's 4 briefs (${(await t.eval(items)).length})`, async () => (await t.eval(items)).length === 4);
  if (!reduced) await t.check(`person filter: removed briefs collapse out (${collapsing} items mid-way)`, collapsing > 4);
  await t.check(`${m}person filter: trail stays continuous (${(await t.eval(trail)).join(' / ')})`, async () => (await t.eval(trail)).join(' / ') === '.| || || |.');
  await t.click('button[aria-pressed][class*=rounded-999]:nth-of-type(1)'); // Everyone
  await t.wait(500);
  await menuPick(t, 'Inventory');
  await t.check(`${m}page filter: Inventory briefs (${(await t.eval(items)).join(', ')})`, async () => (await t.eval(items)).join('|') === 'What am I seeing?|Draft a restock plan for the linen sets');
  await menuPick(t, 'All pages');
  await t.click('[data-history-panel] input[type=search]');
  await t.page.keyboard.type('adire');
  await t.wait(500);
  await t.check(`${m}search "adire": one brief`, async () => (await t.eval(items)).join('|') === 'What am I seeing?');
  await t.check(`${m}search box border turns blue while typing`, () => t.eval(() => getComputedStyle(document.querySelector('[data-history-panel] input[type=search]').closest('label')).borderTopColor === 'rgb(37, 99, 235)'));
  await t.page.keyboard.type('zzz');
  await t.wait(400);
  await t.check(`${m}search with no match: names the search, offers Clear filters`, () => t.eval(() => document.body.innerText.includes('No briefs match “adirezzz”.')));
  await t.click('text=Clear filters');
  await t.wait(500);
  await t.check(`${m}Clear filters brings every brief back`, async () => (await t.eval(items)).length === 8 && (await t.eval(() => document.querySelector('[data-history-panel] input[type=search]').value)) === '');

  // Expand the 2:33 brief
  await t.eval(pick, 'What am I seeing?');
  await t.wait(600);
  await t.eval(pick, 'What am I seeing?'); // a second click on the picked brief opens its chat
  await t.wait(100);
  const chatX = await t.eval(() => document.querySelector('[data-history-panel] [role=log]')?.getBoundingClientRect().left ?? null);
  const panelLeft = await t.eval(() => document.querySelector('aside[aria-label^=Hop]').getBoundingClientRect().left);
  const flashing = await t.page
    .waitForFunction(() => !!document.querySelector('[data-msg="h233-q"] .bg-selection'), { timeout: 1500, polling: 'raf' })
    .then(() => true)
    .catch(() => false);
  await t.wait(900);
  await t.check(`${m}expand: the chat replaces the chain, "Back" on top and focused`, () =>
    t.eval(() => !!document.querySelector('[data-history-panel] [role=log]') && !document.querySelector('[data-history-panel] button[aria-current]') && document.activeElement?.textContent.trim() === 'Back'),
  );
  await t.check(`${m}expand: whole thread — 2:31 Sand, marker, 2:33 Adire`, () =>
    t.eval(() => {
      const l = document.querySelector('[data-history-panel] [role=log]').innerText;
      return l.includes('Tell me more about this') && l.includes('Moved to Inventory · 2:32 PM') && l.includes('What am I seeing?') && l.includes('Notify me when back');
    }),
  );
  await t.check(`${m}expand: the 2:33 message is in view`, () =>
    t.eval(() => {
      const log = document.querySelector('[data-history-panel] [role=log]').getBoundingClientRect();
      const q = document.querySelector('[data-msg="h233-q"]').getBoundingClientRect();
      return q.top >= log.top && q.bottom <= log.bottom;
    }),
  );
  await t.check(`${m}expand: its tag flashed the active blue, then settled`, async () => flashing && !(await t.eval(() => !!document.querySelector('[data-msg="h233-q"] .bg-selection'))));
  if (!reduced && chatX !== null) await t.check(`expand: the chat slides in from the right (x ${chatX.toFixed(0)} mid-way)`, chatX > panelLeft + 1);
  await t.check(`${m}expand: the side panel keeps its width`, async () => (await t.eval(() => document.querySelector('aside[aria-label^=Hop]').getBoundingClientRect().width)) === 368);
  await t.check(`${m}expand: the snapshot stays`, async () => (await t.eval(note)).startsWith('Screenshot of Inventory — taken at 2:33 PM'));
  await t.shot(`phase7-${reduced ? 'reduced-' : ''}expanded`);
  await t.page.keyboard.press('Escape');
  await t.wait(800);
  await t.check(`${m}Esc: back to the chain, same brief selected, expand icon focused`, async () =>
    (await t.eval(selectedQ)) === 'What am I seeing?' && (await t.eval(() => document.activeElement?.getAttribute('aria-label')?.startsWith('Open the chat') && !document.activeElement.hasAttribute('aria-current'))),
  );

  // Leaving History brings the Hop panel back
  await t.eval(() => document.querySelector('nav[aria-label=Pages] button:nth-child(1)').click());
  await t.wait(100);
  await t.settle();
  await t.check(`${m}back on Analytics: the chat is back in the panel`, async () => (await t.eval(() => !!document.querySelector('aside[aria-label=Hop] textarea') && !document.querySelector('[data-history-panel]'))));

  // Recent with Hop
  await t.eval(recent, 'Restock plan for linen sets');
  await t.wait(100);
  await t.settle(300);
  await t.check(`${m}Recent with Hop: opens History on Ife's restock brief`, async () => (await t.eval(() => location.pathname)) === '/history' && (await t.eval(selectedQ)) === 'Draft a restock plan for the linen sets');
  await t.eval(recent, 'Reply drafts for late DMs');
  await t.wait(900);
  await t.check(`${m}Recent with Hop: Dayo's brief from yesterday, scrolled into view`, async () => {
    const inView = await t.eval(() => {
      const el = document.querySelector('[data-history-panel] button[aria-current="true"]').getBoundingClientRect();
      return el.top >= 0 && el.bottom <= innerHeight;
    });
    return (await t.eval(selectedQ)) === 'Reply drafts for late DMs' && inView && (await t.eval(note)) === 'Screenshot of Customers — taken at 5:10 PM, Wed 23 Sep, when Dayo asked';
  });
  await t.eval(recent, 'Weekend content ideas');
  await t.wait(900);
  await t.check(`${m}Recent with Hop: "Weekend content ideas" shows Zee's briefs`, async () => (await t.eval(items)).join('|') === 'Why is the Sand reel doing so well?');
}
