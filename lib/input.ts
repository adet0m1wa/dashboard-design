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
  // Only a real pointer: Motion's whileTap answers Enter on a button with a synthetic
  // pointerdown of its own (round 9: full screen from the keyboard still eased because of it).
  window.addEventListener('pointerdown', (e) => e.isTrusted && (keyboard = false), true);
}

export const viaKeyboard = () => keyboard;
