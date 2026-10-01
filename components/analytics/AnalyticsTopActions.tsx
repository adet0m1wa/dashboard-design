'use client';

import { motion, useReducedMotion } from 'motion/react';
import { NOW, SYNC } from '@/data/team';
import { easeInOut, press, timing } from '@/lib/motion';
import { useHop } from '@/lib/store';
import { ArrowsClockwiseIcon } from '@/components/icons/figma';

// Analytics top bar, right side: "Thursday, 24 Sep - 2:30 PM" and the dark Last sync button.
// Click: the icon spins 360° (700ms, ease-in-out), the label reads "Syncing…", then
// "Last sync: 14:30" (brief B7.1). The greeting line updates too (AnalyticsPage).
export function AnalyticsTopActions() {
  const sync = useHop((s) => s.sync);
  const startSync = useHop((s) => s.startSync);
  const reduce = useReducedMotion();
  const label = sync === 'syncing' ? 'Syncing…' : `Last sync: ${sync === 'synced' ? SYNC.after : SYNC.before}`;

  return (
    <div className="flex items-center gap-16">
      <p className="flex items-center gap-4 text-12-5 font-500 text-text-strong-secondary">
        <span>{NOW.dayLabel}</span>
        <span aria-hidden="true">-</span>
        <span>{NOW.time}</span>
      </p>
      <motion.button
        type="button"
        whileTap={press}
        onClick={startSync}
        aria-live="polite"
        className="flex items-center gap-6 rounded-8 bg-action-primary px-10 py-6 text-12-5 font-500 text-text-on-dark transition-colors duration-(--dur-fast) ease-hop-color hover:bg-palette-tone-25"
      >
        <motion.span
          className="flex"
          animate={{ transform: sync === 'syncing' && !reduce ? 'rotate(360deg)' : 'rotate(0deg)' }}
          transition={sync === 'syncing' && !reduce ? { duration: timing.syncSpin, ease: easeInOut } : { duration: 0 }}
        >
          <ArrowsClockwiseIcon />
        </motion.span>
        <span className="tabular-nums">{label}</span>
      </motion.button>
    </div>
  );
}
