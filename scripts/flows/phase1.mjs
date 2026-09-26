// Phase 1: shell + routing for all six pages.
const PAGES = [
  ['History', '/history'],
  ['Sales', '/sales'],
  ['Instagram', '/instagram'],
  ['Inventory', '/inventory'],
  ['Customers', '/customers'],
  ['Analytics', '/analytics'],
];

export default async function (t) {
  await t.goto('/analytics');
  await t.check('loads /analytics with Analytics active', () =>
    t.eval(() => document.querySelector('[aria-current=page]')?.textContent.trim() === 'Analytics'),
  );

  const pillY = () => t.eval(() => document.querySelector('[aria-current=page] > span')?.getBoundingClientRect().y);
  for (const [label, path] of PAGES) {
    const from = await pillY();
    await t.eval((l) => {
      [...document.querySelectorAll('nav[aria-label=Pages] button')].find((b) => b.textContent.includes(l)).click();
    }, label);
    // Mid-transition the pill should be between its old and new rows (it slides, not jumps).
    await t.wait(60);
    const mid = await pillY();
    await t.wait(500);
    const to = await pillY();
    const state = await t.eval(() => ({
      path: location.pathname,
      titles: [...document.querySelectorAll('header h1')].map((h) => h.textContent.trim()),
      pages: [...document.querySelectorAll('[data-page]')].map((p) => p.dataset.page),
      active: document.querySelector('[aria-current=page]')?.textContent.trim(),
      pill: (() => {
        const b = document.querySelector('[aria-current=page] > span')?.getBoundingClientRect();
        const btn = document.querySelector('[aria-current=page]')?.getBoundingClientRect();
        return b && btn ? Math.abs(b.y - btn.y) < 1 && Math.abs(b.height - btn.height) < 1 : false;
      })(),
    }));
    const slug = path.slice(1);
    await t.check(`${label}: URL ${path}`, state.path === path);
    await t.check(`${label}: top bar title`, state.titles.length === 1 && state.titles[0] === label);
    await t.check(`${label}: one page in the page area`, state.pages.length === 1 && state.pages[0] === slug);
    await t.check(`${label}: sidebar active item`, state.active?.startsWith(label));
    await t.check(`${label}: pill settled on the active item`, state.pill);
    await t.check(
      `${label}: pill slides (at 60ms: ${mid?.toFixed(1)} between ${from?.toFixed(1)} → ${to?.toFixed(1)})`,
      mid > Math.min(from, to) + 1 && mid < Math.max(from, to) - 1,
    );
    await t.shot(`phase1-${slug}`);
  }

  // Placeholder pages (B7.7)
  await t.goto('/instagram');
  await t.check('Instagram placeholder says "This page is being designed"', () =>
    t.eval(() => document.querySelector('[data-page]')?.textContent.includes('This page is being designed')),
  );

  // Browser back/forward
  await t.goto('/analytics');
  await t.eval(() => [...document.querySelectorAll('nav[aria-label=Pages] button')].find((b) => b.textContent.includes('Customers')).click());
  await t.wait(500);
  await t.page.goBack();
  await t.wait(600);
  await t.check('Back button returns to Analytics', () =>
    t.eval(() => location.pathname === '/analytics' && document.querySelector('[aria-current=page]')?.textContent.trim() === 'Analytics'),
  );
  await t.page.goForward();
  await t.wait(600);
  await t.check('Forward button returns to Customers', () =>
    t.eval(() => location.pathname === '/customers' && document.querySelector('[data-page]')?.dataset.page === 'customers'),
  );

  // Deep link
  await t.goto('/inventory');
  await t.check('Deep link /inventory renders Inventory', () =>
    t.eval(() => document.querySelector('[aria-current=page]')?.textContent.trim().startsWith('Inventory')),
  );
  await t.goto('/');
  await t.check('/ redirects to /analytics', () => t.eval(() => location.pathname === '/analytics'));
}
