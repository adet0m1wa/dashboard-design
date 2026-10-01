// Motion tokens (brief B4, brought in line with Emil Kowalski's standards 2026-09-30 — the
// user's call: "follow all of Emil skill"). Every animation in the app takes its timing from here.
// Durations are in seconds, because that's what Motion expects. UI motion stays under 300ms.

export const duration = {
  fast: 0.12, // hover, press, small fades
  base: 0.2, // most enters/exits, chip swaps
  slow: 0.25, // panel swaps (was 0.32)
  data: 0.28, // chart and number changes (was 0.45)
} as const;

// Emil's curves. Enter and exit both ease out: ease-in starts slow, holding up the moment the
// user is watching (the brief's B4 had ease-in [0.4, 0, 1, 1] for exits). Exits stay shorter
// than enters (exitOf). On-screen movement (a pill sliding, the menu travelling) eases in-out.
export const easeOut = [0.23, 1, 0.32, 1] as const;
export const easeExit = easeOut;
export const easeInOut = [0.77, 0, 0.175, 1] as const;
// CSS `ease`: colour changes, and toasts (Emil's toast: 400ms `ease`, a touch slower and softer).
export const easeSoft = [0.25, 0.1, 0.25, 1] as const;

// Sliding indicators (layoutId): the KPI pill, the week thumb, the selected brief. Emil's tab
// indicator: 250ms, strong ease-in-out. (Was a spring.)
export const indicatorSlide = { duration: 0.25, ease: easeInOut } as const;

// Exits run at ~65% of the matching enter (brief B4 rule of thumb).
export const exitOf = (enter: number) => +(enter * 0.65).toFixed(3);

export const enter = (d: number = duration.base) => ({ duration: d, ease: easeOut });
export const leave = (d: number = duration.base) => ({ duration: exitOf(d), ease: easeExit });

/** Fade in rising from `from`px below; leave fading and lifting `to`px (fast). Moves by transform
 *  (Emil Kowalski: never Motion's x/y shorthands — they drop frames while the page is busy).
 *  Reduced motion keeps the fade and drops the movement. */
export const rise = (reduce: boolean | null, from = 6, to = -4) => ({
  initial: { opacity: 0, ...(reduce ? {} : { transform: `translateY(${from}px)` }) },
  animate: { opacity: 1, ...(reduce ? {} : { transform: 'translateY(0px)' }), transition: { duration: duration.base, ease: easeOut } },
  exit: { opacity: 0, ...(reduce ? {} : { transform: `translateY(${to}px)` }), transition: { duration: duration.fast, ease: easeExit } },
});

// Buttons and chips: scale 0.97 over 100ms.
export const press = { scale: 0.97, transition: { duration: 0.1, ease: easeOut } } as const;

// Named one-offs from the brief, kept here so no component invents its own number.
export const timing = {
  lineDraw: 0.6, // first-load chart line draw
  dotStagger: 0.06, // first-load dots
  cardStagger: 0.04, // first-load cards
  rowExitStagger: 0.03, // messages lifting on New chat (Emil: staggers 30–80ms)
  handleStagger: 0.03, // selection corner handles
  tooltipFollow: 0.08, // chart tooltip position updates
  guideDraw: 0.16, // dashed day guide
  weekLineDraw: 0.28, // full-week line draw (was 0.45)
  think: 0.5, // typing dots before an untagged answer streams (not in the brief — kept short)
  scanSweep: 1.1, // one scan band pass (loops, linear: constant motion)
  scanMin: 0.9, // scan always runs at least this long
  glowLoop: 1.2, // selection glow pulse loop
  typingLoop: 1.2, // typing dots loop
  streamWord: 0.02, // streamed answer, per word
  actionStagger: 0.04, // Hop action buttons
  badgePulse: 0.24, // sidebar badge 1 → 1.15 → 1
  syncSpin: 0.5, // Last sync icon 360° (was 0.7: a faster spinner reads as a faster sync)
  tagFlash: 0.4, // History expand: tag flashes once
  stockBarStagger: 0.03, // inventory stock bars
  toastMove: 0.4, // a toast rising in / sinking out (Emil's toast recipe)
  toast: 5, // how long a toast stays up (5s: the accessibility floor for a timed message)
  scrollbarLinger: 0.8, // a scrollbar stays visible this long after scrolling stops
} as const;

// Distance-based timing (user feedback 2026-09-29): moving further takes longer, but the speed
// reads the same — a fixed start-up time plus a little per step, so five rows don't take five
// times as long as one.
export const travel = {
  menu: { first: 0.15, perStep: 0.025 }, // "All pages" menu: chevron move, drawer open/close; per row (≤ 250ms, a dropdown's budget)
} as const;
export const travelTime = (kind: keyof typeof travel, steps: number) =>
  travel[kind].first + Math.max(0, Math.abs(steps) - 1) * travel[kind].perStep;

