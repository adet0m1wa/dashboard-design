'use client';

import { useReducedMotion } from 'motion/react';
import { useEffect, type RefObject } from 'react';
import { useHopApi } from '@/lib/store';
import { frameRefFrom } from './HopFrame';

// Page-wide selection behaviour (brief B6), attached once to the page area. Picking frames only
// works in highlight mode (the BoundingBox button in Hop's header — user feedback 2026-09-28):
//   • mode on: hovering shows a blue highlight on the deepest frame under the pointer — any
//     frame, buttons and tabs included — and a click picks it instead of doing its normal action.
//     A click on empty page space drops the selection.
//   • mode off: the page behaves normally; nothing highlights on hover or gets picked by clicking
//     (a click on plain page space still puts away a highlight that's showing).
//   • Esc: drops the selection first, then (a second Esc) leaves highlight mode.
const CONTROLS = 'button, a, input, textarea, select, label, [role=tab], [role=radio], [role=button], [data-interactive]';

export function useSelection(container: RefObject<HTMLElement | null>) {
  const api = useHopApi();
  const reduce = useReducedMotion();

  useEffect(() => {
    const root = container.current;
    if (!root) return;

    const frameAt = (target: EventTarget | null) => {
      const frame = (target as Element | null)?.closest?.('[data-hop-frame]');
      return frame && root.contains(frame) ? frame : null;
    };

    const onMove = (e: PointerEvent) => {
      const s = api.getState();
      if (!s.highlightMode) return;
      s.setHover((frameAt(e.target) as HTMLElement | null)?.dataset.hopFrame ?? null);
    };
    const onLeave = () => api.getState().setHover(null);
    // In highlight mode a press on a frame belongs to the picker: stop it reaching buttons
    // (their press animation, focus) before it starts.
    const onDown = (e: PointerEvent) => {
      if (api.getState().highlightMode && frameAt(e.target)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    const onClick = (e: MouseEvent) => {
      const s = api.getState();
      if (!s.highlightMode) {
        // Outside the mode a highlight can still be up (a tag clicked in the chat, an Urgent
        // action): a click on the page that isn't on a control puts it away.
        if (!(e.target as Element).closest?.(CONTROLS)) s.deselect();
        return;
      }
      const frame = frameAt(e.target);
      if (frame) {
        e.preventDefault();
        e.stopPropagation();
        s.select(frameRefFrom(frame));
      } else {
        s.deselect();
      }
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      const s = api.getState();
      if (s.selection && !s.scanning) {
        s.deselect();
        e.preventDefault(); // tells later Esc handlers (day select) it's been used
      } else if (s.highlightMode) {
        s.setHighlightMode(false);
        e.preventDefault();
      }
    };

    root.addEventListener('pointermove', onMove);
    root.addEventListener('pointerleave', onLeave);
    root.addEventListener('pointerdown', onDown, true);
    root.addEventListener('click', onClick, true);
    window.addEventListener('keydown', onEsc, true);
    return () => {
      root.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerleave', onLeave);
      root.removeEventListener('pointerdown', onDown, true);
      root.removeEventListener('click', onClick, true);
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
