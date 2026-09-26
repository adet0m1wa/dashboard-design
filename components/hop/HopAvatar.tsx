'use client';

import { motion, useReducedMotion } from 'motion/react';
import { timing } from '@/lib/motion';

export type HopAvatarState = 'idle' | 'thinking' | 'scanning' | 'done';

// Hop's face. Drawn from the "fresh" panel header (Figma "Agent header" > Icon): a 30px dark
// head, a screen face and two glowing mint eyes. Placeholder until the Rive character lands
// (web runtime @rive-app/react-canvas) — keep the state names, they map to the state machine.
//
// The fresh header drawing has no antenna, so "scanning" pulses the eye glow instead of an
// antenna light (logged in CLAUDE.md > Decisions).
const BASE = 30;

export function HopAvatar({ state = 'idle', size = BASE }: { state?: HopAvatarState; size?: number }) {
  const reduce = useReducedMotion();
  const animate = !reduce && (state === 'thinking' || state === 'scanning');

  const eye = {
    // thinking: a slow blink; scanning: the glow breathes
    animate: !animate
      ? { scaleY: 1, opacity: 1 }
      : state === 'thinking'
        ? { scaleY: [1, 1, 0.25, 1, 1] }
        : { opacity: [1, 0.55, 1] },
    transition: animate
      ? { duration: timing.glowLoop, repeat: Infinity, ease: 'easeInOut' as const }
      : { duration: 0.12 },
  };

  return (
    <span
      className="relative inline-block shrink-0"
      style={{ width: size, height: size }}
      role="img"
      aria-label={state === 'idle' || state === 'done' ? 'Hop' : `Hop is ${state}`}
      data-state={state}
    >
      <span className="absolute left-0 top-0 origin-top-left" style={{ width: BASE, height: BASE, transform: `scale(${size / BASE})` }}>
        <span className="absolute inset-0 rounded-7-5" style={{ background: 'var(--gradient-hop-head)' }} />
        <span className="absolute left-[4px] top-[4px] h-[16px] w-[22px] rounded-6 border-(length:--stroke-0-75) border-hop-bezel bg-hop-screen" />
        {[10, 16.75].map((left) => (
          <motion.span
            key={left}
            className="absolute top-[8px] h-[7.5px] w-[3.75px] rounded-1-88 bg-hop-eye shadow-hop-eye"
            style={{ left }}
            animate={eye.animate}
            transition={eye.transition}
          />
        ))}
      </span>
    </span>
  );
}
