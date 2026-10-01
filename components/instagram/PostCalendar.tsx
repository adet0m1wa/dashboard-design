'use client';

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { IG_DEFAULT_POST, IG_POST_DAYS, IG_WEEK, postsOn } from '@/data/instagram';
import { dateOf, TODAY, weekdayOf } from '@/data/orders';
import { viaKeyboard } from '@/lib/input';
import { duration, easeExit, easeOut, exitOf, press } from '@/lib/motion';
import { useHop } from '@/lib/store';
import { CalendarIcon, Chev13Icon } from '@/components/icons/figma';

// The calendar beside "Posted this week" (user feedback 2026-10-01): a 13px icon, the size of the
// sidebar's "Recent with Hop" one, opening a month view. Days something was posted carry a small
// dot in the action colour and can be picked: the list then shows that day's posts. It grows out
// of the icon's corner (scale 0.97 → 1 and a fade, fast), at once from the keyboard; months
// switch at once. August (the store opened on the 3rd) and September so far.
const MONTHS = [
  { name: 'August 2026', days: 31, offset: 5, first: -2 }, // 1 Aug is a Saturday, day −2
  { name: 'September 2026', days: 30, offset: 1, first: 29 }, // 1 Sep is a Tuesday, day 29
];
const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const monthOf = (day: number | null) => (day !== null && day < MONTHS[1].first ? 0 : 1);

export function PostCalendar() {
  const day = useHop((s) => s.pages.igDay);
  const setPages = useHop((s) => s.setPages);
  const reduce = useReducedMotion();
  const keys = viaKeyboard();
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(monthOf(day));
  const wrap = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const m = MONTHS[month];

  const close = (refocus: boolean) => {
    setOpen(false);
    if (refocus) trigger.current?.focus({ preventScroll: true });
  };
  const pickDay = (d: number) => {
    setPages({ igDay: d, igPost: postsOn(d)[0].id });
    close(true);
  };

  useEffect(() => {
    if (!open) return;
    (panel.current?.querySelector<HTMLElement>('[aria-pressed="true"]') ?? panel.current?.querySelector<HTMLElement>('button[data-day]'))?.focus({ preventScroll: true });
    const onDown = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);

  return (
    <div ref={wrap} className="relative flex">
      <motion.button
        ref={trigger}
        type="button"
        whileTap={press}
        aria-label="Show what was posted on a day"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          if (open) return close(false);
          setMonth(monthOf(day));
          setOpen(true);
        }}
        className={`relative rounded-4 transition-colors duration-(--dur-fast) ease-hop-color after:absolute after:-inset-6 hover:text-text-primary ${open || day !== null ? 'text-text-primary' : 'text-text-muted'}`}
      >
        <CalendarIcon />
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.div
            ref={panel}
            role="dialog"
            aria-label="Pick a day"
            onKeyDown={(e) => {
              if (e.key !== 'Escape') return;
              e.preventDefault();
              e.stopPropagation();
              close(true);
            }}
            initial={keys ? false : { opacity: 0, transform: reduce ? 'scale(1)' : 'scale(0.97)' }}
            animate={{ opacity: 1, transform: 'scale(1)', transition: { duration: duration.fast, ease: easeOut } }}
            exit={{ opacity: 0, transition: { duration: exitOf(duration.fast), ease: easeExit } }}
            style={{ transformOrigin: 'top right' }}
            className="absolute right-0 top-[calc(100%+8px)] z-30 flex w-[234px] flex-col gap-8 rounded-10 border border-surface-border-tint bg-surface-default p-12 shadow-screenshot-card"
          >
            <div className="flex items-center justify-between">
              <MonthButton dir={-1} disabled={month === 0} onClick={() => setMonth(0)} />
              <span className="text-12-5 font-600 text-text-primary" aria-live="polite">
                {m.name}
              </span>
              <MonthButton dir={1} disabled={month === MONTHS.length - 1} onClick={() => setMonth(1)} />
            </div>
            <div className="grid grid-cols-7 text-center text-10-5 font-500 text-text-muted" aria-hidden="true">
              {WEEKDAYS.map((w, i) => (
                <span key={i}>{w}</span>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {Array.from({ length: m.offset }, (_, i) => (
                <span key={`gap-${i}`} />
              ))}
              {Array.from({ length: m.days }, (_, i) => {
                const d = m.first + i;
                const n = i + 1;
                const posts = IG_POST_DAYS.has(d) ? postsOn(d).length : 0;
                const today = d === TODAY ? 'ring-1 ring-inset ring-surface-border-tint' : '';
                if (!posts)
                  return (
                    <span key={n} className={`flex h-[30px] items-center justify-center rounded-6 text-12 tabular-nums ${d > TODAY ? 'text-chart-future' : 'text-text-muted'} ${today}`}>
                      {n}
                    </span>
                  );
                const on = d === day;
                const { month: mon } = dateOf(d);
                return (
                  <button
                    key={n}
                    type="button"
                    data-day={d}
                    aria-pressed={on}
                    aria-label={`${weekdayOf(((d % 7) + 7) % 7)} ${n} ${mon}, ${posts} post${posts > 1 ? 's' : ''}`}
                    onClick={() => pickDay(d)}
                    className={`relative flex h-[30px] items-center justify-center rounded-6 text-12 font-500 tabular-nums ${today} ${
                      on ? 'bg-action-primary text-text-on-dark' : 'text-text-primary hover:bg-surface-subtle'
                    }`}
                  >
                    {n}
                    <span aria-hidden="true" className={`absolute bottom-[4px] left-1/2 size-[4px] -translate-x-1/2 rounded-full ${on ? 'bg-surface-default' : 'bg-action-primary'}`} />
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MonthButton({ dir, disabled, onClick }: { dir: 1 | -1; disabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={dir < 0 ? 'Previous month' : 'Next month'}
      className="flex size-[22px] items-center justify-center rounded-6 text-text-secondary hover:bg-surface-subtle disabled:text-chart-future disabled:hover:bg-transparent"
    >
      <Chev13Icon className={dir < 0 ? 'rotate-90' : '-rotate-90'} />
    </button>
  );
}

/** Back from a day to the last 7 days, keeping the open post if it's one of them. */
export function useBackToWeek() {
  const setPages = useHop((s) => s.setPages);
  const post = useHop((s) => s.pages.igPost);
  return () => setPages({ igDay: null, igPost: IG_WEEK.some((p) => p.id === post) ? post : IG_DEFAULT_POST });
}
