'use client';

import { motion, useReducedMotion } from 'motion/react';
import { useId } from 'react';
import { timing } from '@/lib/motion';

export type HopAvatarState = 'idle' | 'thinking' | 'scanning' | 'done';

// Hop's face: the Figma component "Agent character" (40×40), also used as the panel's
// "Hop · character (Rive slot)" at 30px. A dark head, a screen face, two glowing mint eyes and
// a green antenna light. Placeholder until the Rive character lands (@rive-app/react-canvas) —
// keep the state names, they map to the state machine.
//   thinking → the eyes blink · scanning → the antenna light pulses (brief B6) · idle/done → still
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
      viewBox="0 0 40 40"
      fill="none"
      role="img"
      aria-label={state === 'thinking' ? 'Hop is thinking' : state === 'scanning' ? 'Hop is reading' : 'Hop'}
      data-state={state}
      className="shrink-0 overflow-visible"
    >
      <defs>
        <linearGradient id={`${id}-head`} x1="20" y1="7" x2="20" y2="40" gradientUnits="userSpaceOnUse">
          <stop style={{ stopColor: 'var(--gradient-hop-head-from)' }} />
          <stop offset="1" style={{ stopColor: 'var(--gradient-hop-head-to)' }} />
        </linearGradient>
      </defs>
      <rect x="19" y="3" width="2" height="5" className="fill-palette-tone-25" />
      <motion.circle
        cx="20"
        cy="3"
        r="3"
        className="fill-status-live"
        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        animate={pulse ? { opacity: [1, 0.35, 1], scale: [1, 1.25, 1] } : { opacity: 1, scale: 1 }}
        transition={pulse ? loop : { duration: 0.12 }}
      />
      <rect y="7" width="40" height="33" rx="13" fill={`url(#${id}-head)`} />
      <rect x="5.5" y="14.5" width="29" height="18" rx="7.5" className="fill-hop-screen stroke-hop-bezel" />
      {[13, 22].map((x) => (
        <motion.rect
          key={x}
          x={x}
          y="19"
          width="5"
          height="9"
          rx="2.5"
          className="fill-hop-eye"
          style={{ filter: 'drop-shadow(0 0 2px var(--color-hop-glow))', transformBox: 'fill-box', transformOrigin: 'center' }}
          animate={blink ? { scaleY: [1, 1, 0.2, 1, 1] } : { scaleY: 1 }}
          transition={blink ? loop : { duration: 0.12 }}
        />
      ))}
    </svg>
  );
}
