'use client';

import { AnimatePresence, motion, useReducedMotion, type Variants } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { allBriefs } from '@/lib/briefs';
import { viaKeyboard } from '@/lib/input';
import { duration, easeExit, easeOut, press } from '@/lib/motion';
import { useHop, useHopApi } from '@/lib/store';
import { CaretLeftIcon } from '@/components/icons/figma';
import { BriefChain } from './BriefChain';
import { HISTORY_BACK, HistoryChat } from './HistoryChat';

// History inside the side panel (user feedback 2026-09-29: the panel stays on History with Hop's
// face — it can't be closed there, but it keeps its width and can be dragged narrower). The body
// is the brief chain; Expand swaps it for that brief's chat: the chain slides out right (x 0 → 16
// + fade, fast), the chat slides in (x 16 → 0, slow). Back or Esc reverses it, same brief selected.
// From the keyboard (Enter, Esc) the swap is instant: `custom` carries that to the leaving side.
export function HistoryPanel() {
  const api = useHopApi();
  const threads = useHop((s) => s.threads);
  const selectedId = useHop((s) => s.history.selectedId);
  const expanded = useHop((s) => s.history.expanded);
  const reduce = useReducedMotion();
  const briefs = useMemo(() => allBriefs(threads), [threads]);
  const brief = briefs.find((b) => b.id === selectedId) ?? briefs[0];
  const expandRef = useRef<HTMLButtonElement>(null);
  const chainScroll = useRef<number | null>(null); // the list's scroll, kept while a chat is open
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

  const keys = viaKeyboard();
  const slide: Variants = {
    hidden: (instant: boolean) =>
      instant || reduce
        ? { opacity: 0, transition: { duration: 0 } }
        : { opacity: 0, transform: 'translateX(16px)', transition: { duration: duration.fast, ease: easeExit } },
    shown: (instant: boolean) => ({
      opacity: 1,
      transform: 'translateX(0px)',
      transition: instant ? { duration: 0 } : { duration: reduce ? duration.fast : duration.slow, ease: easeOut },
    }),
  };
  const swap = { variants: slide, custom: keys, initial: 'hidden', animate: 'shown', exit: 'hidden' } as const;

  return (
    <div className="relative min-h-0 flex-1 overflow-hidden" data-history-panel>
      <AnimatePresence mode="wait" initial={false} custom={keys}>
        {expanded ? (
          <motion.div key="chat" className="absolute inset-0" {...swap}>
            <HistoryChat brief={brief} />
          </motion.div>
        ) : (
          <motion.div key="chain" className="absolute inset-0" {...swap}>
            <BriefChain briefs={briefs} expandRef={expandRef} focusExpand={returning} scrollMemory={chainScroll} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** The side panel header's title on History: "Hop", or "‹ Back" while a chat is open (Figma). */
const TITLE: Variants = {
  hidden: (instant: boolean) => ({ opacity: 0, transition: instant ? { duration: 0 } : { duration: duration.fast, ease: easeExit } }),
  shown: (instant: boolean) => ({ opacity: 1, transition: instant ? { duration: 0 } : { duration: duration.base, ease: easeOut } }),
};

export function HistoryTitle() {
  const expanded = useHop((s) => s.history.expanded);
  const keys = viaKeyboard();
  return (
    <AnimatePresence mode="wait" initial={false} custom={keys}>
      {expanded ? (
        <BackButton key="back" instant={keys} />
      ) : (
        <motion.span
          key="hop"
          className="text-14 font-600 text-text-primary"
          variants={TITLE}
          custom={keys}
          initial="hidden"
          animate="shown"
          exit="hidden"
        >
          Hop
        </motion.span>
      )}
    </AnimatePresence>
  );
}

/** "‹ Back": takes focus when it appears (Expand was the last thing pressed). */
function BackButton({ instant }: { instant: boolean }) {
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
      variants={TITLE}
      custom={instant}
      initial="hidden"
      animate="shown"
      exit="hidden"
    >
      <CaretLeftIcon />
      Back
    </motion.button>
  );
}
