// Phase 4: Hop panel — cues, send, typing dots, streaming, New chat, markers, fade mask.
const panelText = () => document.querySelector('[role=log]')?.innerText ?? '';
const cuesVisible = () => [...document.querySelectorAll('aside[aria-label=Hop] button')].some((b) => b.textContent === 'Any flags?');

export default async function (t) {
  await t.goto('/analytics');
  await t.wait(900);

  // 1. Send a prompt cue
  await t.click('text=How are we doing today?');
  await t.wait(80);
  await t.check('cue: her bubble appears as "Amara · 2:31 PM"', async () => (await t.eval(panelText)).includes('Amara · 2:31 PM'));
  await t.check('cue: typing dots while Hop thinks', () => t.eval(() => !!document.querySelector('[aria-label="Hop is typing"]')));
  await t.check('cue: avatar goes to thinking', () => t.eval(() => document.querySelector('aside[aria-label=Hop] header svg[data-state]')?.dataset.state === 'thinking'));
  await t.wait(250);
  await t.check('cue: prompt cues fade out while the answer comes in', async () => !(await t.eval(cuesVisible)));
  await t.shot('phase4-typing');
  await t.wait(400); // thinking (500ms) is over, streaming has started
  const partial = await t.eval(() => document.querySelector('[role=log] p')?.textContent ?? '');
  await t.wait(1500);
  const full = await t.eval(() => [...document.querySelectorAll('[role=log] p')].map((p) => p.textContent).join(' '));
  await t.check(`answer streams word by word (${partial.split(' ').length} words mid-way)`, partial.length > 0 && partial.length < full.length);
  await t.check('answer text is the scripted one', full.startsWith('A good day so far. $2,480 from 34 orders'));
  await t.check('meta shows "Hop · 2:31 PM · read Sales, Instagram, Customers"', async () => (await t.eval(panelText)).includes('Hop · 2:31 PM · read Sales, Instagram, Customers'));
  await t.check('cues return after the answer', () => t.eval(cuesVisible));
  await t.check('answer announced politely', () => t.eval(() => document.querySelector('aside[aria-label=Hop] .sr-only[aria-live=polite]')?.textContent.startsWith('A good day so far')));
  await t.check('fade mask on the conversation above the cues', () => t.eval(() => getComputedStyle(document.querySelector('[role=log]')).maskImage.includes('gradient')));
  await t.shot('phase4-answered');

  // 2. Typed question: Shift+Enter adds a line, Enter sends, unknown → polite fallback
  await t.click('textarea[aria-label="Message Hop"]');
  await t.page.keyboard.type('Anything else');
  await t.page.keyboard.down('Shift');
  await t.page.keyboard.press('Enter');
  await t.page.keyboard.up('Shift');
  await t.page.keyboard.type('for today?');
  await t.check('Shift+Enter adds a new line (no send)', () => t.eval(() => document.querySelector('textarea').value === 'Anything else\nfor today?'));
  const h2 = await t.eval(() => document.querySelector('textarea').getBoundingClientRect().height);
  await t.check(`composer grows with the text (${h2}px for 2 lines)`, h2 >= 34);
  await t.page.keyboard.press('Enter');
  await t.wait(1200);
  await t.check('Enter sends; clock moves to 2:32 PM', async () => (await t.eval(panelText)).includes('Amara · 2:32 PM'));
  await t.check('unknown question gets the polite fallback', async () => (await t.eval(panelText)).includes('I can answer that once this page is connected.'));
  await t.check('composer clears after sending', () => t.eval(() => document.querySelector('textarea').value === ''));

  // 3. Page marker: moving page alone adds none (feedback 2026-09-28 — only a tagged question
  // asked on another page does; see phase6)
  await t.click('text=Sales');
  await t.wait(500);
  await t.check('moving page adds no "Moved to" marker', async () => !(await t.eval(panelText)).includes('Moved to'));
  await t.check('no prompt cues on Sales', async () => !(await t.eval(cuesVisible)));
  await t.shot('phase4-marker');
  await t.click('text=Analytics');
  await t.wait(500);

  // 4. New chat
  await t.click('button[aria-label="New chat"]');
  await t.wait(60);
  const exiting = await t.eval(() => [...document.querySelectorAll('[role=log] > div > div')].map((d) => +getComputedStyle(d).opacity));
  await t.wait(500);
  const reduced = await t.eval(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  if (reduced) await t.check('[reduced] New chat: messages clear at once', exiting.length === 0);
  else await t.check(`New chat: messages lift out (opacities mid-exit ${exiting.map((o) => o.toFixed(2)).join(',')})`, exiting.length > 0 && exiting.some((o) => o < 1));
  await t.check('New chat: panel is empty', async () => (await t.eval(panelText)).trim() === '');
  await t.check('New chat: prompt cues are back', () => t.eval(cuesVisible));
  await t.shot('phase4-new-chat');
}
