'use client';

import { motion } from 'motion/react';
import { NOW, SYNC } from '@/data/team';
import { press } from '@/lib/motion';
import { ArrowsClockwiseIcon } from '@/components/icons/figma';

// Analytics top bar, right side: "Thursday, 24 Sep - 2:30 PM" and the dark Last sync button.
// The sync interaction (spin + label) is phase 3.
export function AnalyticsTopActions() {
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
        className="flex items-center gap-6 rounded-8 bg-action-primary px-10 py-6 text-12-5 font-500 text-text-on-dark"
      >
        <ArrowsClockwiseIcon />
        <span>Last sync: {SYNC.before}</span>
      </motion.button>
    </div>
  );
}
