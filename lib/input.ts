// Which kind of input caused the change being rendered. Emil Kowalski: never animate
// keyboard-initiated actions — arrow keys through the KPI tabs, Enter on a brief, Esc out of a
// chat repeat all day, and motion makes them feel slow. Components that animate a change a key
// can cause read `viaKeyboard()` while rendering that change and land it at once instead.
//
// It's the latest input anywhere, so it's only asked where the change itself comes from the user
// (a tab, a toggle, a pick) — never for things the system does on its own, like Hop's answer.
let keyboard = false;

if (typeof window !== 'undefined') {
  window.addEventListener('keydown', () => (keyboard = true), true);
  window.addEventListener('pointerdown', () => (keyboard = false), true);
}

export const viaKeyboard = () => keyboard;
