'use client';

import { animate, useReducedMotion } from 'motion/react';
import { useEffect, useRef, type ReactNode } from 'react';
import { NAV } from '@/data/nav';
import type { Page } from '@/data/types';
import { easeIn, easeOut, timing, travelTime, WIPE_SPLIT } from '@/lib/motion';
import { useHopApi } from '@/lib/store';

// Page transitions (user feedback 2026-09-29; replaces brief B7.6's slide). Everything inside the
// white workspace — top bar, page and side panel — wipes out through a soft gradient edge, the
// workspace stays blank white for a beat, then the new page wipes in the same way. Moving down
// the sidebar (Analytics → History) both wipes run top → bottom; moving up, bottom → top. Time:
// 2 : 1 : 2 (out : blank : in) of travelTime('page', steps) — further pages take a little longer
// at the same felt speed. The sidebar pill and the URL move at once; the content swaps (store
// `shownPage`) in the blank middle. Reduced motion: a 100ms fade out and in.
const EDGE = 30; // the soft edge, % of the height
const order = (p: Page) => NAV.findIndex((n) => n.id === p);
const frames = (n: number) => new Promise<void>((r) => { const tick = () => (--n <= 0 ? r() : requestAnimationFrame(tick)); requestAnimationFrame(tick); });

export function PageStage({ children }: { children: ReactNode }) {
  const api = useHopApi();
  const reduce = useReducedMotion();
  const stage = useRef<HTMLDivElement>(null);
  const running = useRef(false);

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const paint = (mask: string, phase: string) => {
      el.style.maskImage = mask;
      el.style.webkitMaskImage = mask;
      el.dataset.transition = phase;
    };
    // p: 0 → 1 across one wipe. "out" hides from the leading edge, "in" shows from it.
    const wipe = (kind: 'out' | 'in', down: boolean, p: number) => {
      const at = p * (100 + EDGE) - EDGE;
      const dir = down ? 'to bottom' : 'to top';
      return kind === 'out'
        ? `linear-gradient(${dir}, transparent ${at}%, black ${at + EDGE}%)`
        : `linear-gradient(${dir}, black ${at}%, transparent ${at + EDGE}%)`;
    };

    const run = async () => {
      if (running.current) return;
      const start = api.getState();
      if (start.page === start.shownPage) return;
      running.current = true;
      const steps = Math.abs(order(start.page) - order(start.shownPage)) || 1;
      const down = order(start.page) > order(start.shownPage);

      if (reduce) {
        el.dataset.transition = 'out';
        await animate(1, 0, { duration: timing.reducedFade, onUpdate: (o) => (el.style.opacity = String(o)) });
        el.dataset.transition = 'blank';
        api.getState().showPage(api.getState().page);
        await frames(2);
        el.dataset.transition = 'in';
        await animate(0, 1, { duration: timing.reducedFade, onUpdate: (o) => (el.style.opacity = String(o)) });
        el.style.removeProperty('opacity');
      } else {
        const total = travelTime('page', steps);
        await animate(0, 1, { duration: total * WIPE_SPLIT.out, ease: easeIn, onUpdate: (p) => paint(wipe('out', down, p), 'out') });
        paint(wipe('out', down, 1), 'blank');
        await new Promise((r) => setTimeout(r, total * WIPE_SPLIT.blank * 1000));
        api.getState().showPage(api.getState().page); // the latest target, if she clicked on
        await frames(2); // let the new page render and lay out while it's hidden
        await animate(0, 1, { duration: total * WIPE_SPLIT.in, ease: easeOut, onUpdate: (p) => paint(wipe('in', down, p), 'in') });
      }
      paint('', 'idle');
      running.current = false;
      run(); // she may have moved on again while this one played
    };

    paint('', 'idle');
    return api.subscribe((s, prev) => {
      if (s.page !== prev.page) run();
    });
  }, [api, reduce]);

  return (
    <div ref={stage} className="flex min-w-min flex-1" data-transition="idle">
      {children}
    </div>
  );
}
