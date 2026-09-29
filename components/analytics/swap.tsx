'use client';

import { AnimatePresence, motion, useReducedMotion, type Variants } from 'motion/react';
import type { ReactNode } from 'react';
import { duration, easeIn, easeOut, timing } from '@/lib/motion';

// Shared swap motion for the Analytics cards (brief B7.1):
//   old rows exit: fade + y −4, fast, 20ms stagger → new rows enter: fade + y 6→0, base, 40ms stagger.
// Reduced motion: data swaps instantly.
const GROUP: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: timing.cardStagger } },
  gone: { transition: { staggerChildren: timing.rowExitStagger } },
};
export const SWAP_ROW: Variants = {
  hidden: { opacity: 0, y: 6 },
  shown: { opacity: 1, y: 0, transition: { duration: duration.base, ease: easeOut } },
  gone: { opacity: 0, y: -4, transition: { duration: duration.fast, ease: easeIn } },
};
const INSTANT: Variants = { hidden: { opacity: 1 }, shown: { opacity: 1 }, gone: { opacity: 0, transition: { duration: 0 } } };

/** Rows that swap as a group when `swapKey` changes. Children should be <SwapRow>s. */
export function SwapRows({ swapKey, className, children }: { swapKey: string; className?: string; children: ReactNode }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div key={swapKey} className={className} variants={GROUP} initial="hidden" animate="shown" exit="gone">
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export function SwapRow({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div className={className} variants={reduce ? INSTANT : SWAP_ROW}>
      {children}
    </motion.div>
  );
}
