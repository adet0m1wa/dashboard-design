'use client';

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { allBriefs } from '@/lib/briefs';
import { duration, easeIn, easeOut, press } from '@/lib/motion';
import { useHop, useHopApi } from '@/lib/store';
import { CaretLeftIcon } from '@/components/icons/figma';
import { BriefChain } from './BriefChain';
import { HISTORY_BACK, HistoryChat } from './HistoryChat';

// History inside the side panel (user feedback 2026-09-29: the panel stays on History with Hop's
// face — it can't be closed there, but it keeps its width and can be dragged narrower). The body
// is the brief chain; Expand swaps it for that brief's chat: the chain slides out right (x 0 → 16
// + fade, fast), the chat slides in (x 16 → 0, slow). Back or Esc reverses it, same brief selected.
export function HistoryPanel() {
  const api = useHopApi();
  const threads = useHop((s) => s.threads);
  const selectedId = useHop((s) => s.history.selectedId);
  const expanded = useHop((s) => s.history.expanded);
  const reduce = useReducedMotion();
  const briefs = useMemo(() => allBriefs(threads), [threads]);
  const brief = briefs.find((b) => b.id === selectedId) ?? briefs[0];
  const expandRef = useRef<HTMLButtonElement>(null);
  // Set when the chat closes, so the chain focuses the expand icon it was opened from.
  const [returning, setReturning] = useState(false);
  const [lastExpanded, setLastExpanded] = useState(expanded);
  if (lastExpanded !== expanded) {
    setLastExpanded(expanded);
    setReturning(!expanded);
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !e.defaultPrevented && api.getState().history.expanded) {
        e.preventDefault();
        api.getState().setExpanded(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [api]);

  const slide = {
    initial: reduce ? { opacity: 0 } : { opacity: 0, x: 16 },
    animate: { opacity: 1, x: 0, transition: { duration: reduce ? duration.fast : duration.slow, ease: easeOut } },
    exit: reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, x: 16, transition: { duration: duration.fast, ease: easeIn } },
  };

  return (
    <div className="relative min-h-0 flex-1 overflow-hidden" data-history-panel>
      <AnimatePresence mode="wait" initial={false}>
        {expanded ? (
          <motion.div key="chat" className="absolute inset-0" {...slide}>
            <HistoryChat brief={brief} />
          </motion.div>
        ) : (
          <motion.div key="chain" className="absolute inset-0" {...slide}>
            <BriefChain briefs={briefs} expandRef={expandRef} focusExpand={returning} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** The side panel header's title on History: "Hop", or "‹ Back" while a chat is open (Figma). */
export function HistoryTitle() {
  const expanded = useHop((s) => s.history.expanded);
  return (
    <AnimatePresence mode="wait" initial={false}>
      {expanded ? (
        <BackButton key="back" />
      ) : (
        <motion.span
          key="hop"
          className="text-14 font-600 text-text-primary"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: duration.base, ease: easeOut } }}
          exit={{ opacity: 0, transition: { duration: duration.fast, ease: easeIn } }}
        >
          Hop
        </motion.span>
      )}
    </AnimatePresence>
  );
}

/** "‹ Back": takes focus when it appears (Expand was the last thing pressed). */
function BackButton() {
  const setExpanded = useHop((s) => s.setExpanded);
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => ref.current?.focus({ preventScroll: true }), []);
  return (
    <motion.button
      ref={ref}
      id={HISTORY_BACK}
      type="button"
      whileTap={press}
      onClick={() => setExpanded(false)}
      aria-label="Back to the brief list"
      className="flex items-end gap-4 rounded-4 text-14 font-600 text-text-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: duration.base, ease: easeOut } }}
      exit={{ opacity: 0, transition: { duration: duration.fast, ease: easeIn } }}
    >
      <CaretLeftIcon />
      Back
    </motion.button>
  );
}
