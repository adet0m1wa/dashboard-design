'use client';

import { motion, useReducedMotion } from 'motion/react';
import { useId } from 'react';
import { duration, timing } from '@/lib/motion';

export type HopAvatarState = 'idle' | 'thinking' | 'scanning' | 'done';

// Hop's face: the user's icon (2026-10-02, replacing the Figma "Agent character" with its
// antenna): a 30×30 dark rounded square, a screen with a 1.5px inner bezel, two mint eyes with a
// green glow. Drawn from the icon's own geometry, in the palette's tokens. Placeholder until the
// Rive character lands — keep the state names, they map to the state machine.
//   thinking → the eyes blink · scanning → the eyes' glow pulses (brief B6) · idle/done → still
export function HopAvatar({ state = 'idle', size = 30 }: { state?: HopAvatarState; size?: number }) {
  const reduce = useReducedMotion();
  const id = useId();
  const loop = { duration: timing.glowLoop, repeat: Infinity, ease: 'easeInOut' as const };
  const blink = !reduce && state === 'thinking';
  const pulse = !reduce && state === 'scanning';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 30 30"
      fill="none"
      role="img"
      aria-label={state === 'thinking' ? 'Hop is thinking' : state === 'scanning' ? 'Hop is reading' : 'Hop'}
      data-state={state}
      className="shrink-0 overflow-visible"
    >
      <defs>
        <linearGradient id={`${id}-head`} x1="15" y1="0" x2="15" y2="30" gradientUnits="userSpaceOnUse">
          <stop style={{ stopColor: 'var(--gradient-hop-head-from)' }} />
          <stop offset="1" style={{ stopColor: 'var(--gradient-hop-head-to)' }} />
        </linearGradient>
      </defs>
      <rect width="30" height="30" rx="7.5" fill={`url(#${id}-head)`} />
      {/* The icon's screen (4,4 22×16, r6) with its 1.5px stroke drawn inside: a 1.5px stroke on
          a rect inset by 0.75 covers the same pixels. */}
      <rect x="4" y="4" width="22" height="16" rx="6" className="fill-hop-screen" />
      <rect x="4.75" y="4.75" width="20.5" height="14.5" rx="5.25" strokeWidth="1.5" className="stroke-hop-bezel" />
      {[10, 16.75].map((x) => (
        <motion.rect
          key={x}
          x={x}
          y="8"
          width="3.75"
          height="7.5"
          rx="1.875"
          className="fill-hop-eye"
          style={{ filter: 'drop-shadow(0 0 3px var(--color-hop-glow))', transformBox: 'fill-box', transformOrigin: 'center' }}
          // SVG: Motion's scale props (a transform string becomes a broken SVG attribute).
          animate={blink ? { scaleY: [1, 1, 0.2, 1, 1] } : pulse ? { opacity: [1, 0.55, 1] } : { scaleY: 1, opacity: 1 }}
          transition={blink || pulse ? loop : { duration: duration.fast }}
        />
      ))}
    </svg>
  );
}
