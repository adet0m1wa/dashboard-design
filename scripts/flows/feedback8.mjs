// Feedback round 8 (2026-10-02): Instagram stat tiles start level with the reel, every line fits on
// one line, New followers before Saves, the canvas scrolls inside itself; the user's Hop icon;
// the Sales chart draws and moves like Analytics (dots, line draw, counting tiles); Analytics'
// side panel goes full screen and Hop lists what needs attending to; selection outlines are never
// cut off and never widen the page; the Customers chat header lines up with the details header.
const nav = (n) => `document.querySelector('nav[aria-label=Pages] button:nth-child(${n})').click()`;

export default async function (t) {
  const base = process.env.HOP_URL ?? 'http://localhost:3000';
  await t.goto('/instagram');
  const reduced = await t.eval(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const m = reduced ? '[reduced] ' : '';

  // 1–3. Instagram, at the narrow width too (tiles are 106px there)
  for (const w of [1440, 1336]) {
    await t.page.setViewport({ width: w, height: 760, deviceScaleFactor: 1 });
    await t.page.goto(`${base}/instagram`, { waitUntil: 'networkidle0' });
    await t.wait(500);
    const posts = await t.eval(() => [...document.querySelectorAll('[data-hop-frame^="instagram.post."]')].map((f) => f.dataset.hopFrame));
    const issues = [];
    for (const id of posts) {
      await t.click(`[data-hop-frame="${id}"] button`);
      await t.wait(60);
      const r = await t.eval(() => {
        const preview = document.querySelector('[data-hop-frame^="instagram.preview."]').getBoundingClientRect().top;
        const tiles = [...document.querySelectorAll('[data-hop-frame^="instagram.stat."]')];
        const labels = tiles.map((f) => f.querySelector('span').textContent);
        const cut = tiles.flatMap((f) => [...f.querySelectorAll('span.whitespace-nowrap')].filter((s) => s.scrollWidth > s.clientWidth + 0.5).map((s) => s.textContent));
        return { level: Math.abs(tiles[0].getBoundingClientRect().top - preview) < 0.5, labels, cut };
      });
      if (!r.level) issues.push(`${id} not level`);
      if (r.cut.length) issues.push(`${id}: ${r.cut.join(', ')}`);
      if (r.labels.some((l) => l.startsWith('Watched'))) issues.push(`${id} still says Watched`);
      if (r.labels.includes('Saves') && r.labels.indexOf('New followers') > r.labels.indexOf('Saves')) issues.push(`${id}: Saves before New followers`);
    }
    await t.check(`${m}1–3 Instagram @${w}: ${posts.length} posts — tiles level with the reel, every line on one line, "Viewed", New followers before Saves${issues.length ? ` (${issues.join('; ')})` : ''}`, issues.length === 0);
    await t.click('[data-hop-frame="instagram.post.post-sand-reel"] button'); // 8 comments: taller than 760
    await t.wait(60);
    const scroll = await t.eval(() => {
      const pageArea = document.querySelector('[data-page]');
      const canvas = document.querySelector('[data-hop-frame^="instagram.preview."]').closest('.overflow-y-auto');
      return { page: pageArea.scrollHeight - pageArea.clientHeight, canvas: !!canvas && canvas.scrollHeight > canvas.clientHeight };
    });
    await t.check(`${m}3 Instagram @${w}×760: the grey canvas scrolls itself (page overflow ${scroll.page}px)`, scroll.page <= 0 && scroll.canvas);
  }
  await t.page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

  // 4. The user's Hop icon: a 30×30 rounded square, no antenna
  const icon = await t.eval(() => {
    const svg = document.querySelector('aside[aria-label^=Hop] header svg[role=img]');
    return { box: svg.getAttribute('viewBox'), circles: svg.querySelectorAll('circle').length, eyes: svg.querySelectorAll('rect.fill-hop-eye').length };
  });
  await t.check(`${m}4 Hop's icon: viewBox ${icon.box}, ${icon.eyes} eyes, ${icon.circles} antenna`, icon.box === '0 0 30 30' && icon.eyes === 2 && icon.circles === 0);

  // 5. Sales: a dot on every day with takings; a new week draws in; the tiles count to it
  await t.page.goto(`${base}/sales`, { waitUntil: 'networkidle0' });
  await t.wait(1200);
  const dots = () => t.eval(() => document.querySelectorAll('[data-hop-frame^="sales.chart."] g circle').length);
  const thisWeekDots = await dots();
  const during = await t.eval(async () => {
    [...document.querySelectorAll('main [role=radio]')].find((b) => b.textContent.includes('Last week')).click();
    const seen = new Set();
    const offsets = new Set();
    const t0 = performance.now();
    while (performance.now() - t0 < 400) {
      await new Promise((r) => requestAnimationFrame(r));
      seen.add(document.querySelector('[data-hop-frame^="sales.tile.revenue."] .tabular-nums span').textContent);
      const line = [...document.querySelectorAll('[data-hop-frame^="sales.chart."] g path.stroke-status-success')].at(-1);
      offsets.add(line?.getAttribute('stroke-dasharray') ?? ''); // Motion draws pathLength through the dash
    }
    return { values: [...seen], offsets: offsets.size };
  });
  await t.wait(300);
  const lastWeekDots = await dots();
  const final = await t.eval(() => document.querySelector('[data-hop-frame^="sales.tile.revenue."] .tabular-nums span').textContent);
  await t.check(`${m}5 Sales dots: ${thisWeekDots} this week (Mon–Thu), ${lastWeekDots} last week`, thisWeekDots === 4 && lastWeekDots === 7);
  if (reduced) await t.check(`${m}5 reduced: the revenue lands at once (${during.values.join(' → ')})`, final === '$15,810' && during.values.length === 1);
  else await t.check(`${m}5 last week draws in (${during.offsets} line states) while revenue counts ${during.values[0]} → ${final} (${during.values.length} values)`, final === '$15,810' && during.values.length > 3 && during.offsets > 3);

  // 6. Analytics: full screen; Hop lists what needs attending to and offers to do it all
  await t.page.goto(`${base}/analytics`, { waitUntil: 'networkidle0' });
  await t.wait(2800);
  await t.click('button[aria-label="Full screen"]');
  await t.wait(reduced ? 100 : 450);
  const full = await t.eval(() => {
    const aside = document.querySelector('aside[aria-label^=Hop]');
    const ws = aside.parentElement;
    return { aside: Math.round(aside.getBoundingClientRect().width), ws: ws.clientWidth, page: Math.round(document.querySelector('main').parentElement.parentElement.getBoundingClientRect().width), border: getComputedStyle(aside).borderLeftWidth };
  });
  await t.check(`${m}6 full screen: the panel is ${full.aside}/${full.ws}px, the page ${full.page}px, no stroke (${full.border})`, full.aside === full.ws && full.page === 0 && full.border === '0px');
  await t.click('textarea[aria-label="Message Hop"]');
  await t.page.keyboard.type('Hey Hop, go through my page and tell me what needs to be attended to');
  await t.page.keyboard.press('Enter');
  const listed = await t.page.waitForFunction(() => document.querySelector('aside[aria-label^=Hop]').textContent.includes('Just say the word.'), { timeout: 15000 }).then(() => true, () => false);
  const items = await t.eval(() => [...document.querySelectorAll('aside[aria-label^=Hop] ol li')].map((li) => li.querySelector('span:last-child span').textContent));
  await t.check(`${m}6 Hop lists ${items.length} things (${items[0]} …) and offers to handle them all`, listed && items.length === 6 && items[1] === '6 orders to pack');
  await t.page.keyboard.press('Escape');
  await t.wait(reduced ? 100 : 450);
  const back = await t.eval(() => Math.round(document.querySelector('aside[aria-label^=Hop]').getBoundingClientRect().width));
  await t.click('button[aria-label="Full screen"]');
  await t.wait(reduced ? 100 : 450);
  await t.eval(nav(3));
  await t.settle();
  const elsewhere = await t.eval(() => ({ w: Math.round(document.querySelector('aside[aria-label^=Hop]').getBoundingClientRect().width), button: !!document.querySelector('button[aria-label="Full screen"], button[aria-label="Exit full screen"]') }));
  await t.check(`${m}6 Esc brings it back to ${back}px; on Sales it's ${elsewhere.w}px with no full-screen button`, back === 368 && elsewhere.w === 368 && !elsewhere.button);

  // 9. Every frame on every page, picked: its corner handles are all visible and the page never
  // gets wider (that 3px sideways scrollbar shrank the Customers conversation)
  const bad = [];
  let picked = 0;
  for (const w of [1440, 1336]) {
    await t.page.setViewport({ width: w, height: 900, deviceScaleFactor: 1 });
    for (const p of ['analytics', 'sales', 'instagram', 'inventory', 'customers']) {
      await t.page.goto(`${base}/${p}`, { waitUntil: 'networkidle0' });
      await t.wait(p === 'analytics' ? 2800 : 700);
      await t.click('button[aria-label="Highlight a frame"]');
      const ids = await t.eval(() => [...document.querySelectorAll('main [data-hop-frame]')].filter((f) => !f.closest('[inert]')).map((f) => f.dataset.hopFrame));
      for (const id of ids) {
        const focused = await t.eval((id) => {
          const f = document.querySelector(`[data-hop-frame="${CSS.escape(id)}"]`);
          const target = f && (f.getAttribute('tabindex') === '0' ? f : f.querySelector('button:not([tabindex="-1"]), [role=tab]'));
          target?.focus();
          return !!target;
        }, id);
        if (!focused) continue;
        await t.page.keyboard.press('Enter');
        await t.wait(40);
        const cut = await t.eval((id) => {
          const f = document.querySelector(`[data-hop-frame="${CSS.escape(id)}"]`);
          const handles = [...f.querySelectorAll(':scope > span.z-10 > span.size-\\[7px\\]')];
          if (handles.length !== 4) return [`${handles.length} handles`];
          const out = [];
          for (const h of handles) {
            const r = h.getBoundingClientRect();
            for (let el = h.parentElement; el; el = el.parentElement) {
              const cs = getComputedStyle(el);
              const b = el.getBoundingClientRect();
              const L = b.left + el.clientLeft, T = b.top + el.clientTop;
              if (cs.overflowX !== 'visible' && (r.left < L - 0.5 || r.right > L + el.clientWidth + 0.5)) out.push('cut sideways');
              if (cs.overflowY !== 'visible' && (r.top < T - 0.5 || r.bottom > T + el.clientHeight + 0.5)) out.push('cut top/bottom');
            }
          }
          const pa = document.querySelector('[data-page]');
          if (pa.scrollWidth > pa.clientWidth) out.push('page wider');
          return [...new Set(out)];
        }, id);
        picked++;
        if (cut.length) bad.push(`${p}@${w} ${id}: ${cut.join(', ')}`);
      }
    }
  }
  await t.page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await t.check(`${m}9 ${picked} frames picked on 5 pages at 1440 and 1336: every handle visible, page never wider${bad.length ? ` — ${bad.slice(0, 4).join(' | ')}` : ''}`, picked > 150 && bad.length === 0);

  // 10. Customers: the chat header's bottom line meets the details header's
  await t.page.goto(`${base}/customers`, { waitUntil: 'networkidle0' });
  await t.wait(600);
  const lines = await t.eval(() => {
    const details = document.querySelector('[data-hop-frame^="customers.profile."] > div > div:first-child').getBoundingClientRect();
    const chat = document.querySelector('[data-hop-frame="customers.thread"] > div:first-child');
    const c = chat.getBoundingClientRect();
    const name = chat.querySelector('.text-15').getBoundingClientRect();
    return { details: details.bottom, chat: c.bottom, centred: Math.abs(name.top + name.height / 2 - (c.top + c.height / 2)) <= 1 };
  });
  await t.check(`${m}10 Customers: header lines at ${lines.details} and ${lines.chat}; the chat header's content centred`, lines.details === lines.chat && lines.centred);
}
