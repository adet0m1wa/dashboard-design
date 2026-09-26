'use client';

import { motion, useReducedMotion } from 'motion/react';
import { timing } from '@/lib/motion';

// Three dots, 1.2s staggered opacity loop (brief B7.2). Reduced motion: still dots.
export function TypingDots() {
  const reduce = useReducedMotion();
  return (
    <span className="flex h-[19px] items-center gap-4" role="status" aria-label="Hop is typing">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="size-[5px] rounded-full bg-text-muted"
          animate={reduce ? { opacity: 0.6 } : { opacity: [0.25, 1, 0.25] }}
          transition={reduce ? { duration: 0 } : { duration: timing.typingLoop, repeat: Infinity, ease: 'easeInOut', delay: (i * timing.typingLoop) / 6 }}
        />
      ))}
    </span>
  );
}
