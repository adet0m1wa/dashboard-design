'use client';

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { ElementType, ReactNode } from 'react';
import type { Page } from '@/data/types';
import { duration, easeIn, easeInOut, easeOut, exitOf, timing } from '@/lib/motion';
import { useHop, type HopFrameRef } from '@/lib/store';

// Wraps every selectable part of a page (brief B6). The frame itself only carries data
// attributes; clicks and hover are handled once for the whole page by SelectionController,
// which picks the deepest frame under the pointer.
export interface HopFrameProps {
  id: string;
  label: string;
  page: Page;
  jumpTarget?: Page;
  as?: ElementType;
  className?: string;
  /** Corner radius of the outline, from the radius tokens. Rows use 8 (Figma); cards 14. */
  radius?: 8 | 10 | 14;
  role?: string;
  children: ReactNode;
}

export function HopFrame({ id, label, page, jumpTarget, as: Tag = 'div', className, radius = 8, role, children }: HopFrameProps) {
  return (
    <Tag
      role={role}
      data-hop-frame={id}
      data-hop-label={label}
      data-hop-page={page}
      data-hop-jump={jumpTarget}
      className={`relative ${className ?? ''}`}
    >
      {children}
      <FrameOverlay id={id} radius={radius} />
    </Tag>
  );
}

/** Read a frame's ref back off the DOM (used by the controller). */
export function frameRefFrom(el: Element): HopFrameRef {
  const d = (el as HTMLElement).dataset;
  return { id: d.hopFrame!, label: d.hopLabel!, page: d.hopPage as Page, jumpTarget: (d.hopJump as Page) || undefined };
}

const RADIUS = { 8: 'rounded-8', 10: 'rounded-10', 14: 'rounded-14' } as const;
// Figma "Selection outline": 2px outside the frame left/right, 4px above/below.
const BOX = 'pointer-events-none absolute -inset-x-2 -inset-y-4';
const CORNERS = [
  '-left-5 -top-5',
  '-right-5 -top-5',
  '-left-5 -bottom-5',
  '-right-5 -bottom-5',
] as const;

function FrameOverlay({ id, radius }: { id: string; radius: 8 | 10 | 14 }) {
  const selected = useHop((s) => s.selection?.id === id);
  const hovered = useHop((s) => s.hoverId === id && s.selection?.id !== id);
  const scanning = useHop((s) => s.scanning && s.selection?.id === id);
  const pulse = useHop((s) => (s.selection?.id === id ? s.selectPulse : 0));
  const reduce = useReducedMotion();
  const r = RADIUS[radius];

  return (
    <>
      {/* Hover: 1px selection blue at 35%, fades in (fast). No label on the canvas. */}
      <AnimatePresence>
        {hovered && (
          <motion.span
            key="hover"
            aria-hidden="true"
            className={`${BOX} ${r} z-10 border border-selection/35`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: duration.fast, ease: easeOut } }}
            exit={{ opacity: 0, transition: { duration: exitOf(duration.fast), ease: easeIn } }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selected && (
          <motion.span key={`sel-${pulse}`} aria-hidden="true" className={`${BOX} z-10`} initial="hidden" animate="shown" exit="gone">
            {/* Scan (brief B6 step 3): a soft band sweeps left → right, clipped to the radius. */}
            <AnimatePresence>
              {scanning && !reduce && (
                <motion.span
                  key="scan"
                  className={`absolute inset-0 overflow-hidden ${r}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { duration: duration.fast } }}
                  exit={{ opacity: 0, transition: { duration: duration.fast, ease: easeIn } }}
                >
                  <motion.span
                    className="absolute inset-y-0 left-0 w-2/5 bg-linear-to-r from-transparent via-selection/12 to-transparent"
                    initial={{ x: '-100%' }}
                    animate={{ x: '250%' }}
                    transition={{ duration: timing.scanSweep, ease: easeInOut, repeat: Infinity }}
                  />
                </motion.span>
              )}
            </AnimatePresence>
            {/* Glow: a 3px blue ring at 18% that pulses while Hop reads (1.2s loop). */}
            {scanning && !reduce && (
              <motion.span
                className={`absolute inset-0 ${r} ring-3 ring-selection/18`}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ duration: timing.glowLoop, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}
            {/* Outline: 1.5px, grows 98% → 100% while fading in (base, easeOut). */}
            <motion.span
              className={`absolute inset-0 ${r} border-(length:--stroke-1-5) border-selection`}
              variants={{
                hidden: reduce ? { opacity: 0 } : { opacity: 0, scale: 0.98 },
                shown: { opacity: 1, scale: 1, transition: { duration: duration.base, ease: easeOut } },
                gone: { opacity: 0, transition: { duration: duration.base, ease: easeIn } },
              }}
            />
            {/* Handles: 7×7 white squares, scale in 0 → 1 staggered 20ms; leave shrinking to 60%. */}
            {CORNERS.map((pos, i) => (
              <motion.span
                key={pos}
                className={`absolute ${pos} size-[7px] border-(length:--stroke-1-2) border-selection bg-surface-default`}
                variants={{
                  hidden: reduce ? { opacity: 0 } : { scale: 0 },
                  shown: { scale: 1, opacity: 1, transition: { duration: duration.fast, ease: easeOut, delay: reduce ? 0 : i * timing.handleStagger } },
                  gone: { scale: reduce ? 1 : 0.6, opacity: 0, transition: { duration: duration.base, ease: easeIn } },
                }}
              />
            ))}
            {/* Reduced motion: no sweep — a static outline and a line of text instead (B5). */}
            {scanning && reduce && (
              <span className="absolute -top-5 right-8 -translate-y-full rounded-4 bg-selection px-6 py-2 text-11 font-500 text-text-on-dark">Hop is reading…</span>
            )}
          </motion.span>
        )}
      </AnimatePresence>
    </>
  );
}
