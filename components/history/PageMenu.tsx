'use client';

import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react';
import { useEffect, useId, useRef, useState } from 'react';
import { HISTORY_PAGES } from '@/data/history';
import type { Page } from '@/data/types';
import { easeInOut, travelTime } from '@/lib/motion';
import { useHop } from '@/lib/store';
import { Chev13Icon } from '@/components/icons/figma';

// History's page filter (Figma "All pages" 1934:1925 and "transition" 1935:1993). Closed, it's a
// 105×32 box showing the chosen page (Figma draws 97; widened by user feedback 2026-09-30).
// Open, the box grows down to list every page, with the chevron beside the current one. Picking
// a page: the chevron travels to it, then the drawer closes by scrolling — the picked row keeps
// pace with the chevron as the list rolls up into the box, pushing "All pages" out of the top
// while the rows below follow it up. Every move takes travel time by distance (lib/motion
// `travel.menu`), so a long move isn't a slow one.
const OPTIONS: { id: Page | 'all'; label: string }[] = [{ id: 'all', label: 'All pages' }, ...HISTORY_PAGES];
const ROW = 22; // 16px line + 6px gap (Figma)
const CLOSED = 32; // py 7 + 16 + border
const OPEN = CLOSED + ROW * (OPTIONS.length - 1); // 142 (Figma)

export function PageMenu() {
  const pageFilter = useHop((s) => s.history.pageFilter);
  const setFilter = useHop((s) => s.setHistoryFilter);
  const reduce = useReducedMotion();
  const id = useId();
  const selected = Math.max(0, OPTIONS.findIndex((o) => o.id === pageFilter));
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(selected); // keyboard highlight while open
  const [refocus, setRefocus] = useState(false); // give the button focus back once it's rendered
  const busy = useRef(false);
  const wrap = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const listbox = useRef<HTMLDivElement>(null);

  const height = useMotionValue(CLOSED);
  const scroll = useMotionValue(-selected * ROW); // list offset: the chosen row sits in the box
  const chevron = useMotionValue(selected * ROW); // chevron's row, in px
  const turn = useMotionValue(0); // 0 = ⌄ (closed), 180 = ⌃ (open)
  const rotate = useTransform(turn, (t) => `rotate(${t}deg)`);

  const go = (mv: typeof height, to: number, rows: number) =>
    animate(mv, to, { duration: reduce ? 0 : travelTime('menu', Math.max(1, rows)), ease: easeInOut });

  const openMenu = async () => {
    if (busy.current || open) return;
    busy.current = true;
    setActive(selected);
    setOpen(true);
    await Promise.all([go(height, OPEN, selected), go(scroll, 0, selected), go(turn, 180, selected)]);
    busy.current = false;
    listbox.current?.focus({ preventScroll: true });
  };

  const close = async (to: number, refocus: boolean) => {
    busy.current = true;
    const from = Math.round(chevron.get() / ROW);
    await go(chevron, to * ROW, Math.abs(to - from)); // 1. the chevron travels to the pick
    if (OPTIONS[to].id !== pageFilter) setFilter({ pageFilter: OPTIONS[to].id }); // the list below starts moving
    await Promise.all([go(height, CLOSED, to), go(scroll, -to * ROW, to), go(turn, 0, to)]); // 2. roll up and shut
    setOpen(false);
    setRefocus(refocus);
    busy.current = false;
  };

  useEffect(() => {
    if (open || !refocus) return;
    trigger.current?.focus({ preventScroll: true });
    setRefocus(false);
  }, [open, refocus]);

  // Outside the menu, a press closes it without changing the pick.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node) && !busy.current) close(selected, false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  });

  // The filter can change from elsewhere (Recent with Hop): keep the closed box on it.
  useEffect(() => {
    if (open || busy.current) return;
    scroll.set(-selected * ROW);
    chevron.set(selected * ROW);
  }, [selected, open, scroll, chevron]);

  const onKey = (e: React.KeyboardEvent) => {
    if (busy.current) return e.preventDefault();
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.min(OPTIONS.length - 1, Math.max(0, a + (e.key === 'ArrowDown' ? 1 : -1))));
    } else if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault();
      setActive(e.key === 'Home' ? 0 : OPTIONS.length - 1);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      close(active, true);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      close(selected, true);
    } else if (e.key === 'Tab') {
      close(selected, false);
    }
  };

  return (
    <div ref={wrap} className="relative h-[32px] w-[105px] shrink-0">
      <motion.div
        ref={listbox}
        role={open ? 'listbox' : undefined}
        aria-label={open ? 'Show briefs asked on' : undefined}
        aria-activedescendant={open ? `${id}-${active}` : undefined}
        tabIndex={open ? -1 : undefined}
        onKeyDown={open ? onKey : undefined}
        className={`absolute left-0 top-0 w-[105px] overflow-hidden rounded-8 border border-surface-border-tint bg-surface-default outline-none ${open ? 'z-30' : ''}`}
        style={{ height }}
      >
        <motion.div className="relative flex flex-col gap-6 px-10 py-7" style={{ y: scroll }}>
          {OPTIONS.map((o, i) => (
            <div
              key={o.id}
              id={`${id}-${i}`}
              role={open ? 'option' : undefined}
              aria-selected={open ? i === selected : undefined}
              onClick={open ? () => !busy.current && close(i, true) : undefined}
              onPointerEnter={open ? () => setActive(i) : undefined}
              className={`flex h-[16px] w-[83px] items-center whitespace-nowrap text-12-5 font-500 transition-colors duration-(--dur-fast) ease-hop-out ${
                open ? 'cursor-pointer' : ''
              } ${open && i === active ? 'text-text-primary' : 'text-text-strong-secondary'}`}
            >
              {o.label}
            </div>
          ))}
          {/* The chevron marks the chosen row and rides with the list. */}
          <motion.span className="pointer-events-none absolute left-[80px] top-[8.5px] flex" style={{ y: chevron }} aria-hidden="true">
            <motion.span className="flex text-text-secondary" style={{ transform: rotate }}>
              <Chev13Icon />
            </motion.span>
          </motion.span>
        </motion.div>
      </motion.div>
      {!open && (
        <button
          ref={trigger}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={false}
          aria-label={`Show briefs asked on: ${OPTIONS[selected].label}`}
          onClick={openMenu}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
              e.preventDefault();
              openMenu();
            }
          }}
          className="absolute inset-0 rounded-8"
        />
      )}
    </div>
  );
}
