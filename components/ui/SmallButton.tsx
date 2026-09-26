'use client';

import { motion, type HTMLMotionProps } from 'motion/react';
import { press } from '@/lib/motion';

// The 12px buttons used across Analytics and Hop answers (Figma "Button/Draft replies",
// "Button/Reorder"): px 10, py 6, radius 8, 12/500. Primary = dark fill; secondary = white + border.
const STYLE = {
  primary: 'bg-action-primary text-text-on-dark hover:bg-palette-tone-25',
  secondary: 'border border-surface-border-tint bg-surface-default text-text-primary hover:bg-surface-subtle',
} as const;

export function SmallButton({
  variant = 'secondary',
  className = '',
  ...props
}: { variant?: keyof typeof STYLE } & HTMLMotionProps<'button'>) {
  return (
    <motion.button
      type="button"
      whileTap={press}
      className={`shrink-0 whitespace-nowrap rounded-8 px-10 py-6 text-12 font-500 transition-colors duration-(--dur-fast) ease-hop-out ${STYLE[variant]} ${className}`}
      {...props}
    />
  );
}
