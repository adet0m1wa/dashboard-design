'use client';

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';
import { cardFor, periodOf, SNAPSHOTS } from '@/data/analytics';
import { URGENT_QUESTIONS } from '@/data/conversation';
import { SYNC } from '@/data/team';
import type { UrgentItem } from '@/data/types';
import { duration, easeOut, enter, leave, timing } from '@/lib/motion';
import { useHop, useHopApi } from '@/lib/store';
import { INTRO, IntroContext } from '@/components/analytics/intro';
import { KpiCard } from '@/components/analytics/KpiCard';
import { KpiTabs } from '@/components/analytics/KpiTabs';
import { TrendChart } from '@/components/analytics/TrendChart';
import { UrgentCard } from '@/components/analytics/UrgentCard';

// Analytics (brief B7.1). The first time it shows, one orchestrated entrance plays
// (see components/analytics/intro.tsx); after that nothing moves unless she does something.
export function AnalyticsPage() {
  const api = useHopApi();
  const reduce = useReducedMotion();
  const [intro] = useState(() => api.getState().analyticsIntroPending);
  const view = useHop((s) => s.analytics);
  const sync = useHop((s) => s.sync);
  const setDay = useHop((s) => s.setDay);
  const showToast = useHop((s) => s.showToast);
  const askAbout = useHop((s) => s.askAbout);
  const period = periodOf(view);
  const card = cardFor(view);
  const play = intro && !reduce;

  useEffect(() => {
    if (intro) api.getState().finishAnalyticsIntro();
  }, [intro, api]);

  // Esc returns a selected day to today (brief B7.1). Selection and History take Esc first
  // once they exist (phases 5 and 7), because they stop the event before it gets here.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !e.defaultPrevented && api.getState().analytics.day !== null) setDay(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [api, setDay]);

  // Urgent actions (brief B7.1): "Draft replies" and "Reorder" send a Hop message tagged with
  // that row, which runs the normal scan → answer flow; "Remind Ife" is a toast.
  const onUrgentAction = (item: UrgentItem) => {
    const ref = { id: `analytics.urgent.${item.id}`, label: item.title, page: 'analytics' as const, jumpTarget: item.jumpTarget };
    if (item.action?.kind === 'draft') askAbout(ref, URGENT_QUESTIONS.draft);
    else if (item.action?.kind === 'reorder') askAbout(ref, URGENT_QUESTIONS.reorder);
    else if (item.action?.kind === 'remind') showToast('Reminder sent to Ife');
  };

  const checkedAt = sync === 'synced' ? SYNC.checkedAfter : SYNC.checkedBefore;
  const fadeUp = (i: number) =>
    play
      ? {
          initial: { opacity: 0, y: 6 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: duration.base, ease: easeOut, delay: INTRO.cards + i * timing.cardStagger },
        }
      : {};

  return (
    <IntroContext.Provider value={play}>
      <div className="flex flex-col gap-24 px-28 py-24">
        <motion.div
          className="flex flex-col gap-4"
          initial={play ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={{ duration: duration.base, ease: easeOut, delay: INTRO.greeting }}
        >
          <h2 className="text-26 font-600 tracking-px-0-52 text-text-primary">Good afternoon, Amara</h2>
          <p className="grid text-14 leading-20 text-text-secondary">
            <AnimatePresence initial={false}>
              <motion.span
                key={checkedAt}
                className="col-start-1 row-start-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: enter() }}
                exit={{ opacity: 0, transition: leave() }}
              >
                Below is your analytics. Hop last checked everything at {checkedAt}.
              </motion.span>
            </AnimatePresence>
          </p>
        </motion.div>

        <section aria-label="Key numbers" className="flex flex-col gap-4 rounded-12 border border-surface-border-tint p-6">
          <KpiTabs />
          <TrendChart />
        </section>

        {/* Equal heights: one grid row, both cards stretch to the taller; the row animates its
            height when either card grows (brief B7.1). */}
        <motion.div layout transition={{ layout: { duration: duration.base, ease: easeOut } }} className="grid min-h-[246px] grid-cols-2 items-stretch gap-12">
          <motion.div layout className="flex min-w-0" {...fadeUp(0)}>
            <KpiCard card={card} period={period} className="flex-1" />
          </motion.div>
          <motion.div layout className="flex min-w-0" {...fadeUp(1)}>
            <UrgentCard items={SNAPSHOTS[period].urgent} swapKey={period} onAction={onUrgentAction} className="flex-1" />
          </motion.div>
        </motion.div>
      </div>
    </IntroContext.Provider>
  );
}
