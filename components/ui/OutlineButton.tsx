'use client';

import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import { press } from '@/lib/motion';

// The white bordered button of the top bars and page headers ("All products", "Last 7 days",
// "Export", "Open post"): px 10, py 6, radius 8, 12.5/500, press 0.97.
export function OutlineButton({ onClick, children, label }: { onClick: () => void; children: ReactNode; label?: string }) {
  return (
    <motion.button
      type="button"
      whileTap={press}
      onClick={onClick}
      aria-label={label}
      className="flex shrink-0 items-center gap-6 rounded-8 border border-surface-border-tint bg-surface-default px-10 py-6 text-12-5 font-500 whitespace-nowrap text-text-strong-secondary transition-colors duration-(--dur-fast) ease-hop-color hover:bg-surface-subtle"
    >
      {children}
    </motion.button>
  );
}
