'use client';

import { useReducedMotion } from 'motion/react';
import { useEffect, type RefObject } from 'react';
import { useHopApi } from '@/lib/store';
import { frameRefFrom } from './HopFrame';

// Page-wide selection behaviour (brief B6), attached once to the page area:
//   • plain click on a non-interactive surface → selects the deepest <HopFrame> under it
//   • buttons, links, tabs keep their normal action
//   • Alt/Option + click → tags whatever frame is under it, even an interactive one
//     (the brief's open question — chosen for this build, listed in the report)
//   • click on empty space → deselect; Esc → deselect (before anything else handles Esc)
//   • hover → faint outline on the deepest frame, but not over a button/tab unless Alt is held,
//     because a plain click there wouldn't select
const INTERACTIVE = 'button, a, input, textarea, select, label, [role=tab], [role=radio], [role=button], [data-interactive]';

export function useSelection(container: RefObject<HTMLElement | null>) {
  const api = useHopApi();
  const reduce = useReducedMotion();

  useEffect(() => {
    const root = container.current;
    if (!root) return;
    let alt = false;
    let last: Element | null = null;

    const hoverFor = (target: Element | null) => {
      const frame = target?.closest('[data-hop-frame]');
      if (!frame || !root.contains(frame)) return null;
      const control = target?.closest(INTERACTIVE);
      if (!alt && control && frame.contains(control)) return null;
      return (frame as HTMLElement).dataset.hopFrame ?? null;
    };

    const onMove = (e: PointerEvent) => {
      last = e.target as Element;
      api.getState().setHover(hoverFor(last));
    };
    const onLeave = () => {
      last = null;
      api.getState().setHover(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Alt' && alt !== (e.type === 'keydown')) {
        alt = e.type === 'keydown';
        if (last) api.getState().setHover(hoverFor(last));
      }
    };
    const onClick = (e: MouseEvent) => {
      const target = e.target as Element;
      const frame = target.closest('[data-hop-frame]');
      const s = api.getState();
      if (e.altKey && frame) {
        // Tag it; don't also run the button's own action.
        e.preventDefault();
        e.stopPropagation();
        s.select(frameRefFrom(frame));
        return;
      }
      const control = target.closest(INTERACTIVE);
      if (control && root.contains(control)) return; // normal action
      if (frame) s.select(frameRefFrom(frame));
      else s.deselect();
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      const s = api.getState();
      if (s.selection && !s.scanning) {
        s.deselect();
        e.preventDefault(); // tells later Esc handlers (day select) it's been used
      }
    };

    root.addEventListener('pointermove', onMove);
    root.addEventListener('pointerleave', onLeave);
    root.addEventListener('click', onClick, true);
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKey);
    window.addEventListener('keydown', onEsc, true);
    return () => {
      root.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerleave', onLeave);
      root.removeEventListener('click', onClick, true);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKey);
      window.removeEventListener('keydown', onEsc, true);
    };
  }, [api, container]);

  // A tag in an earlier message asked to see its frame again: scroll it into view
  // (after the page transition if it had to change page), then the Select animation replays.
  useEffect(() => {
    let raf = 0;
    let tries = 0;
    let previous = api.getState().revealPulse;
    const unsub = api.subscribe((s) => {
      if (s.revealPulse === previous) return;
      previous = s.revealPulse;
      const id = s.selection?.id;
      if (!id) return;
      cancelAnimationFrame(raf);
      tries = 0;
      const find = () => {
        const el = container.current?.querySelector(`[data-hop-frame="${CSS.escape(id)}"]`);
        if (el) el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
        else if (tries++ < 90) raf = requestAnimationFrame(find); // wait out the page transition
      };
      raf = requestAnimationFrame(find);
    });
    return () => {
      unsub();
      cancelAnimationFrame(raf);
    };
  }, [api, container, reduce]);
}
