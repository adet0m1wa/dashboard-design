// Motion tokens (brief B4). Every animation in the app takes its timing from here.
// Durations are in seconds, because that's what Motion expects.

export const duration = {
  fast: 0.12, // hover, press, small fades
  base: 0.2, // most enters/exits, chip swaps
  slow: 0.32, // page transitions, panel swaps
  data: 0.45, // chart and number changes
} as const;

export const easeOut = [0.22, 1, 0.36, 1] as const; // everything that enters
export const easeIn = [0.4, 0, 1, 1] as const; // everything that leaves
export const easeInOut = [0.45, 0, 0.55, 1] as const; // loops: scan sweep, sync spin

// Sliding pills and indicators (layoutId). No bouncy springs anywhere else.
export const layoutSpring = { type: 'spring', stiffness: 500, damping: 40 } as const;

// Exits run at ~65% of the matching enter (brief B4 rule of thumb).
export const exitOf = (enter: number) => +(enter * 0.65).toFixed(3);

export const enter = (d: number = duration.base) => ({ duration: d, ease: easeOut });
export const leave = (d: number = duration.base) => ({ duration: exitOf(d), ease: easeIn });

// Buttons and chips: scale 0.97 over 100ms.
export const press = { scale: 0.97, transition: { duration: 0.1, ease: easeOut } } as const;

// Named one-offs from the brief, kept here so no component invents its own number.
export const timing = {
  lineDraw: 0.6, // first-load chart line draw
  dotStagger: 0.06, // first-load dots
  cardStagger: 0.04, // first-load cards, card rows entering
  rowExitStagger: 0.02, // card rows leaving, messages lifting on New chat
  handleStagger: 0.02, // selection corner handles
  tooltipFollow: 0.08, // chart tooltip position updates
  guideDraw: 0.16, // dashed day guide
  weekLineDraw: 0.45, // full-week line draw
  think: 0.5, // typing dots before an untagged answer streams (not in the brief — kept short)
  scanSweep: 1.1, // one scan band pass (loops)
  scanMin: 0.9, // scan always runs at least this long
  glowLoop: 1.2, // selection glow pulse loop
  typingLoop: 1.2, // typing dots loop
  streamWord: 0.02, // streamed answer, per word
  actionStagger: 0.04, // Hop action buttons
  badgePulse: 0.24, // sidebar badge 1 → 1.15 → 1
  syncSpin: 0.7, // Last sync icon 360°
  tagFlash: 0.4, // History expand: tag flashes once
  reducedFade: 0.1, // reduced motion: page slides become 100ms fades
  stockBarStagger: 0.03, // inventory stock bars
  toast: 5, // how long a toast stays up (5s: the accessibility floor for a timed message)
  scrollbarLinger: 0.8, // a scrollbar stays visible this long after scrolling stops
} as const;

// Distance-based timing (user feedback 2026-09-29): moving further takes longer, but the speed
// reads the same — a fixed start-up time plus a little per step, so five rows don't take five
// times as long as one.
export const travel = {
  menu: { first: 0.16, perStep: 0.04 }, // "All pages" menu: chevron move, drawer open/close; per row
} as const;
export const travelTime = (kind: keyof typeof travel, steps: number) =>
  travel[kind].first + Math.max(0, Math.abs(steps) - 1) * travel[kind].perStep;

