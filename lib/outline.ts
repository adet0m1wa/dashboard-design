// Where the highlight outline goes (Figma "example 3" > Selection outline; user feedback
// 2026-09-28): it doesn't draw a new box around a frame, it sits on the strokes that are already
// there.
//   1. A frame with its own box (a card, a tile): the outline covers that border.
//   2. A frame that spans a bordered box's width (a card row, a table row): its sides sit on the
//      box's side strokes. Top and bottom sit on the box's own edge or a divider line when one is
//      within reach, otherwise 4px out from the frame (the Figma row: 36 tall → 44).
//   3. Anything else (a KPI tab): the frame's own edges and corner radius.
// Returned as CSS insets for an absolutely positioned child of the frame, plus corner radii.

const REACH = 24; // how far a stroke can be from the frame and still count as "its" stroke
const PAD = 4; // Figma: row outline 4px above and below the row
const SPAN = 0.8; // a divider has to run under most of the frame to count

export interface OutlineBox {
  top: number;
  right: number;
  bottom: number;
  left: number;
  radius: string;
}

interface Edges {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

function strokes(el: Element) {
  const cs = getComputedStyle(el);
  const px = (v: string) => parseFloat(v) || 0;
  return {
    top: px(cs.borderTopWidth),
    right: px(cs.borderRightWidth),
    bottom: px(cs.borderBottomWidth),
    left: px(cs.borderLeftWidth),
    radii: [cs.borderTopLeftRadius, cs.borderTopRightRadius, cs.borderBottomRightRadius, cs.borderBottomLeftRadius].map(px),
  };
}

const boxed = (s: ReturnType<typeof strokes>) => s.top > 0 && s.right > 0 && s.bottom > 0 && s.left > 0;

/** The nearest ancestor that draws side strokes (a card, the stock table), inside the page. */
export function surfaceOf(frame: Element): HTMLElement | null {
  for (let el = frame.parentElement; el && !el.hasAttribute('data-page'); el = el.parentElement) {
    const s = strokes(el);
    if (s.left > 0 && s.right > 0) return el;
  }
  return null;
}

/** A horizontal stroke just above (edge "top") or just below ("bottom") the frame, if any. */
function dividerNear(surface: Element, frame: Element, f: DOMRect, edge: 'top' | 'bottom'): { y0: number; y1: number } | null {
  let best: { y0: number; y1: number } | null = null;
  const candidates = [frame, ...surface.querySelectorAll('*')];
  for (const el of candidates) {
    if (el !== frame && frame.contains(el)) continue; // strokes inside the frame aren't its edges
    const s = strokes(el);
    if ((s.top === 0 && s.bottom === 0) || boxed(s)) continue; // buttons, pills: not dividers
    const r = el.getBoundingClientRect();
    if (Math.min(r.right, f.right) - Math.max(r.left, f.left) < SPAN * f.width) continue;
    const lines = [];
    if (s.top > 0) lines.push({ y0: r.top, y1: r.top + s.top });
    if (s.bottom > 0) lines.push({ y0: r.bottom - s.bottom, y1: r.bottom });
    for (const line of lines) {
      if (edge === 'top' && line.y1 <= f.top + 1 && line.y1 >= f.top - REACH && (!best || line.y1 > best.y1)) best = line;
      if (edge === 'bottom' && line.y0 >= f.bottom - 2 && line.y0 <= f.bottom + REACH && (!best || line.y0 < best.y0)) best = line;
    }
  }
  return best;
}

export function outlineBox(frame: HTMLElement, fallbackRadius: number): OutlineBox {
  const f = frame.getBoundingClientRect();
  const own = strokes(frame);
  // Insets are measured from the frame's padding box (inside its own border).
  const inset = (t: Edges, radii: number[]): OutlineBox => ({
    top: t.top - (f.top + own.top),
    left: t.left - (f.left + own.left),
    right: f.right - own.right - t.right,
    bottom: f.bottom - own.bottom - t.bottom,
    radius: radii.map((r) => `${r}px`).join(' '),
  });

  // 1. Its own box.
  if (boxed(own)) return inset(f, own.radii);

  // 2. A row across a bordered box.
  const surface = surfaceOf(frame);
  if (surface) {
    const s = surface.getBoundingClientRect();
    const sr = strokes(surface).radii;
    if (f.left - s.left <= REACH && s.right - f.right <= REACH) {
      const onTop = f.top - s.top <= REACH;
      const onBottom = s.bottom - f.bottom <= REACH;
      const above = onTop ? null : dividerNear(surface, frame, f, 'top');
      const below = onBottom ? null : dividerNear(surface, frame, f, 'bottom');
      return inset(
        {
          left: s.left,
          right: s.right,
          top: onTop ? s.top : above ? above.y0 : f.top - PAD,
          bottom: onBottom ? s.bottom : below ? below.y1 : f.bottom + PAD,
        },
        [onTop ? sr[0] : 0, onTop ? sr[1] : 0, onBottom ? sr[2] : 0, onBottom ? sr[3] : 0],
      );
    }
  }

  // 3. Its own edges.
  const radii = own.radii.some((r) => r > 0) ? own.radii : [0, 0, 0, 0].map(() => fallbackRadius);
  return inset(f, radii);
}
