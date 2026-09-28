'use client';

import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import type { Brief } from '@/data/history';
import { duration, press, timing } from '@/lib/motion';
import { useHop } from '@/lib/store';
import { CaretLeftIcon } from '@/components/icons/figma';
import { HopMessage, Marker, UserMessage } from '@/components/hop/Message';

// Expanded History (brief B7.5; Figma "History — chat expanded"): the brief's whole thread with
// "‹ Back" on top, scrolled to the brief's own question, whose tag flashes the active blue once
// (400ms) after the chat has slid in. Read-only: no composer.
export function HistoryChat({ brief }: { brief: Brief }) {
  const setExpanded = useHop((s) => s.setExpanded);
  const showToast = useHop((s) => s.showToast);
  const reduce = useReducedMotion();
  const scroller = useRef<HTMLDivElement>(null);
  const back = useRef<HTMLButtonElement>(null);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    back.current?.focus({ preventScroll: true });
    scroller.current?.querySelector(`[data-msg="${brief.anchor}"]`)?.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
    const on = setTimeout(() => setFlash(true), (reduce ? 0 : duration.slow) * 1000);
    const off = setTimeout(() => setFlash(false), ((reduce ? 0 : duration.slow) + timing.tagFlash) * 1000);
    return () => {
      clearTimeout(on);
      clearTimeout(off);
    };
  }, [brief.anchor, reduce]);

  return (
    <div className="flex h-full flex-col">
      <header className="flex h-bar shrink-0 items-center border-b border-surface-faint px-16">
        <motion.button
          ref={back}
          type="button"
          whileTap={press}
          onClick={() => setExpanded(false)}
          className="flex items-end gap-4 rounded-4 text-14 font-600 text-text-black"
          aria-label="Back to the brief list"
        >
          <CaretLeftIcon />
          Back
        </motion.button>
      </header>
      <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto px-16 py-14" role="log" aria-label={`Conversation: ${brief.question}`}>
        <div className="flex flex-col gap-16">
          {brief.thread.map((m) => (
            <div key={m.id} data-msg={m.id}>
              {m.kind === 'user' ? (
                <UserMessage msg={m} tagActive={flash && m.id === brief.anchor} />
              ) : m.kind === 'hop' ? (
                <HopMessage msg={m} onAction={showToast} />
              ) : (
                <Marker msg={m} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
