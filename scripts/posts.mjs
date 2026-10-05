// Static post images (2026-10-05): each page at 1440×900, 2× pixels, in a state that shows what
// was designed there. Run: node scripts/flow.mjs scripts/posts.mjs
const out = 'posts/static';
export default async function (t) {
  const base = process.env.HOP_URL ?? 'http://localhost:3000';
  const shot = (name) => t.page.screenshot({ path: `${out}/${name}.png` });
  const fresh = async (path) => {
    await t.page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    await t.page.goto(`${base}${path}`, { waitUntil: 'networkidle0' });
    await t.wait(path === '/analytics' ? 3200 : 900);
  };
  const ask = async (text) => {
    await t.click('textarea[aria-label="Message Hop"]');
    if (text) await t.page.keyboard.type(text);
    await t.page.keyboard.press('Enter');
    await t.page.waitForFunction(() => !document.querySelector('aside[aria-label^=Hop] [role=log] [aria-label*="typing"], aside[aria-label^=Hop] [data-state=thinking]'), { timeout: 15000 }).catch(() => {});
  };
  const settled = async (needle) => {
    await t.page.waitForFunction((n) => document.querySelector('aside[aria-label^=Hop] [role=log]').textContent.includes(n), { timeout: 20000 }, needle);
    await t.wait(1500);
    await t.eval(() => document.activeElement?.blur()); // no focus ring on the message box
    await t.page.mouse.move(1430, 450);
    await t.wait(300);
  };

  // 1. Analytics: the week so far, and Hop listing what needs attending to
  await fresh('/analytics');
  await ask('Hey Hop, go through my page and tell me what needs to be attended to');
  await settled('Just say the word.');
  await shot('1-analytics');

  // 2. Sales: a day picked on the chart
  await fresh('/sales');
  await t.click('button[aria-label^="Wednesday, 23 Sep"]');
  await t.wait(900);
  await t.page.mouse.move(1430, 450);
  await shot('2-sales');

  // 3. Instagram: the Sand reel and its numbers
  await fresh('/instagram');
  await t.page.mouse.move(1430, 450);
  await shot('3-instagram');

  // 4. Inventory: the Sand set picked and asked about
  await fresh('/inventory');
  await t.click('button[aria-label="Highlight a frame"]');
  await t.click('[data-hop-frame="inventory.row.linen-sand"]');
  await ask('');
  await settled('arriving next Wednesday.');
  await shot('4-inventory');

  // 5. Customers: Chioma's conversation, her details and orders
  await fresh('/customers');
  await t.page.mouse.move(1430, 450);
  await shot('5-customers');

  // 6. History: the brief chain beside a snapshot of the page as it was
  await fresh('/history');
  await t.page.mouse.move(1430, 450);
  await shot('6-history');
}
