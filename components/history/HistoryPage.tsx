'use client';

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { allBriefs } from '@/lib/briefs';
import { duration, easeIn, easeOut } from '@/lib/motion';
import { useHop, useHopApi } from '@/lib/store';
import { BriefChain } from './BriefChain';
import { HistoryChat } from './HistoryChat';
import { Snapshot } from './Snapshot';

// History (brief B7.5; Figma "History — …"). No Hop panel here: the page area is the whole
// workspace, split into the snapshot (left) and the brief chain (right, 360). Expand swaps the
// chain for that brief's chat (368, like the Hop panel): the chain slides out right (x 0 → 16 +
// fade, fast), the chat slides in (x 16 → 0, slow). Back or Esc reverses it; the brief stays selected.
export function HistoryPage() {
  const api = useHopApi();
  const threads = useHop((s) => s.threads);
  const selectedId = useHop((s) => s.history.selectedId);
  const expanded = useHop((s) => s.history.expanded);
  const reduce = useReducedMotion();
  const briefs = useMemo(() => allBriefs(threads), [threads]);
  const brief = briefs.find((b) => b.id === selectedId) ?? briefs[0];
  const expandRef = useRef<HTMLButtonElement>(null);
  // Set when the chat closes, so the chain focuses the Expand pill it was opened from.
  const [returning, setReturning] = useState(false);

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

  const [lastExpanded, setLastExpanded] = useState(expanded);
  if (lastExpanded !== expanded) {
    setLastExpanded(expanded);
    setReturning(!expanded);
  }

  const slide = {
    initial: reduce ? { opacity: 0 } : { opacity: 0, x: 16 },
    animate: { opacity: 1, x: 0, transition: { duration: reduce ? duration.fast : duration.slow, ease: easeOut } },
    exit: reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, x: 16, transition: { duration: duration.fast, ease: easeIn } },
  };

  return (
    <div className="flex h-full">
      <div className="min-w-0 flex-1 overflow-y-auto pb-24">
        <AnimatePresence mode="wait" initial={false}>
          <Snapshot key={brief.id} brief={brief} />
        </AnimatePresence>
      </div>
      <div
        className={`relative shrink-0 overflow-hidden border-l border-surface-divider-tint transition-[width] duration-(--dur-slow) ease-hop-out motion-reduce:transition-none ${
          expanded ? 'w-panel' : 'w-chain'
        }`}
      >
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
    </div>
  );
}
