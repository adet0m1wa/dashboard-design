'use client';

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useLayoutEffect, useState, type ElementType, type ReactNode } from 'react';
import type { Page } from '@/data/types';
import { duration, easeIn, easeInOut, easeOut, exitOf, timing } from '@/lib/motion';
import { outlineBox, surfaceOf, type OutlineBox } from '@/lib/outline';
import { useHop, type HopFrameRef } from '@/lib/store';

// Wraps every selectable part of a page (brief B6). The frame itself only carries data
// attributes; clicks and hover are handled once for the whole page (useSelection), which picks
// the deepest frame under the pointer — and only while highlight mode is on.
export interface HopFrameProps {
  id: string;
  label: string;
  page: Page;
  jumpTarget?: Page;
  as?: ElementType;
  className?: string;
  /** Corner radius for the outline when the frame has none of its own and no box to sit on. */
  radius?: 8 | 10 | 14;
  role?: string;
  children: ReactNode;
}

export function HopFrame({ id, label, page, jumpTarget, as: Tag = 'div', className, radius = 8, role, children }: HopFrameProps) {
  // A state ref, not useRef: a frame that mounts already selected (a tag re-highlighting it on
  // another page) must re-measure once its element exists.
  const [el, setEl] = useState<HTMLElement | null>(null);
  return (
    <Tag
      ref={setEl}
      role={role}
      data-hop-frame={id}
      data-hop-label={label}
      data-hop-page={page}
      data-hop-jump={jumpTarget}
      className={`relative ${className ?? ''}`}
    >
      {children}
      <FrameOverlay id={id} frame={el} radius={radius} />
    </Tag>
  );
}

/** Read a frame's ref back off the DOM (used by the controller). */
export function frameRefFrom(el: Element): HopFrameRef {
  const d = (el as HTMLElement).dataset;
  return { id: d.hopFrame!, label: d.hopLabel!, page: d.hopPage as Page, jumpTarget: (d.hopJump as Page) || undefined };
}

// Figma "example 3": handles are 7×7 white squares with a 1.2px blue edge, on the outline's corners.
const CORNERS = ['-left-5 -top-5', '-right-5 -top-5', '-left-5 -bottom-5', '-right-5 -bottom-5'] as const;

/** Measures where the outline goes while it's showing, and again whenever the frame or its box resizes. */
function useOutline(el: HTMLElement | null, showing: boolean, radius: number) {
  const [box, setBox] = useState<OutlineBox | null>(null);
  useLayoutEffect(() => {
    if (!showing || !el) return;
    const update = () => setBox(outlineBox(el, radius));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    const surface = surfaceOf(el);
    if (surface) ro.observe(surface);
    return () => ro.disconnect();
  }, [el, showing, radius]);
  return box;
}

function FrameOverlay({ id, frame, radius }: { id: string; frame: HTMLElement | null; radius: number }) {
  const selected = useHop((s) => s.selection?.id === id);
  const hovered = useHop((s) => s.hoverId === id && s.selection?.id !== id);
  const scanning = useHop((s) => s.scanning && s.selection?.id === id);
  const pulse = useHop((s) => (s.selection?.id === id ? s.selectPulse : 0));
  const reduce = useReducedMotion();
  const box = useOutline(frame, selected || hovered, radius);
  if (!box) return null;
  const place = { top: box.top, right: box.right, bottom: box.bottom, left: box.left, borderRadius: box.radius };

  return (
    <>
      {/* Hover (highlight mode): the stroke under the frame turns blue — 1px, no handles. */}
      <AnimatePresence>
        {hovered && (
          <motion.span
            key="hover"
            aria-hidden="true"
            className="pointer-events-none absolute z-10 border border-selection"
            style={place}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: duration.fast, ease: easeOut } }}
            exit={{ opacity: 0, transition: { duration: exitOf(duration.fast), ease: easeIn } }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selected && (
          <motion.span
            key={`sel-${pulse}`}
            aria-hidden="true"
            className="pointer-events-none absolute z-10"
            style={place}
            initial="hidden"
            animate="shown"
            exit="gone"
          >
            {/* Scan (brief B6 step 3): a soft band sweeps left → right, clipped to the outline. */}
            <AnimatePresence>
              {scanning && !reduce && (
                <motion.span
                  key="scan"
                  className="absolute inset-0 overflow-hidden"
                  style={{ borderRadius: box.radius }}
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
                className="absolute inset-0 ring-3 ring-selection/18"
                style={{ borderRadius: box.radius }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ duration: timing.glowLoop, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}
            {/* Outline: 1.5px on the existing strokes, fades in growing 98% → 100% (base). */}
            <motion.span
              className="absolute inset-0 border-(length:--stroke-1-5) border-selection"
              style={{ borderRadius: box.radius }}
              variants={{
                hidden: reduce ? { opacity: 0 } : { opacity: 0, scale: 0.98 },
                shown: { opacity: 1, scale: 1, transition: { duration: duration.base, ease: easeOut } },
                gone: { opacity: 0, transition: { duration: duration.base, ease: easeIn } },
              }}
            />
            {/* Handles: pop in at the corners once it's picked (0 → 1, staggered 20ms); leave shrinking. */}
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
