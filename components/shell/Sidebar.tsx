'use client';

import { motion, useAnimate, useReducedMotion } from 'motion/react';
import { useEffect, useRef } from 'react';
import { NAV } from '@/data/nav';
import { RECENT_WITH_HOP } from '@/data/history';
import { CURRENT_USER, TEAM } from '@/data/team';
import type { Page, Tone } from '@/data/types';
import { layoutSpring, press, timing } from '@/lib/motion';
import { useHop } from '@/lib/store';
import { ChevIcon, HistoryIcon, PanelIcon, SlidersIcon } from '@/components/icons/figma';
import { PageIcon } from './PageIcon';
import { PersonAvatar } from '@/components/ui/PersonAvatar';

export function Sidebar() {
  const page = useHop((s) => s.page);
  const navigate = useHop((s) => s.navigate);
  const openBrief = useHop((s) => s.openBrief);

  return (
    <aside className="flex w-sidebar shrink-0 flex-col gap-2 overflow-hidden px-4 py-6" aria-label="Sidebar">
      {/* Figma "Stack / AA": store switcher + nav, no gap between them */}
      <div className="flex flex-col">
        {/* Store switcher (static in this prototype) */}
        <div className="flex items-center justify-between px-8 py-6">
          <div className="flex items-center gap-8">
            <span className="flex size-[22px] items-center justify-center rounded-6 bg-action-primary text-9 font-700 text-text-on-dark">
              {CURRENT_USER.storeInitials}
            </span>
            <span className="text-13 font-600 text-text-primary">{CURRENT_USER.store}</span>
            <ChevIcon className="text-text-muted" />
          </div>
          <PanelIcon className="text-text-muted" />
        </div>

        <nav aria-label="Pages" className="flex flex-col gap-2 pt-16">
          {NAV.map((item) => {
            const active = item.id === page;
            return (
              <motion.button
                key={item.id}
                type="button"
                onClick={() => navigate(item.id, 'sidebar')}
                whileTap={press}
                aria-current={active ? 'page' : undefined}
                className={`relative flex w-full items-center gap-10 rounded-8 px-10 py-7 text-left text-13 transition-colors duration-(--dur-fast) ease-hop-out ${
                  active ? 'font-600 text-text-primary' : 'font-500 text-text-secondary hover:bg-surface-faint'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    transition={layoutSpring}
                    className="absolute inset-0 rounded-8 border-(length:--stroke-0-5) border-surface-border-tint bg-surface-default shadow-nav-active"
                  />
                )}
                <PageIcon
                  page={item.id}
                  className={`relative transition-colors duration-(--dur-base) ease-hop-out ${active ? 'text-text-primary' : 'text-text-secondary'}`}
                />
                <span className="relative min-w-0 flex-1">{item.label}</span>
                {item.badge && <Badge count={item.badge.count} tone={item.badge.tone} />}
              </motion.button>
            );
          })}
        </nav>
      </div>

      <section aria-labelledby="recent-heading" className="flex flex-col gap-2 pt-16">
        <div className="flex items-center justify-between px-10 pb-6">
          <h2 id="recent-heading" className="text-11-5 font-500 text-text-muted">
            Recent with Hop
          </h2>
          <HistoryIcon className="text-text-muted" />
        </div>
        {RECENT_WITH_HOP.map((item) => (
          <motion.button
            key={item.text}
            type="button"
            whileTap={press}
            onClick={() => openBrief(item.briefId)}
            className="flex w-full items-center gap-8 rounded-6 px-10 py-6 text-left transition-colors duration-(--dur-fast) ease-hop-out hover:bg-surface-faint"
          >
            <PersonAvatar person={TEAM[item.who]} size={16} />
            <span className="min-w-0 flex-1 truncate text-12-5 text-text-tone-01">{item.text}</span>
          </motion.button>
        ))}
      </section>

      <div className="flex-1" />

      {/* Settings isn't part of this prototype: shown as designed, not interactive. */}
      <div className="flex items-center gap-10 rounded-8 px-10 py-7 text-13 font-500 text-text-strong-secondary">
        <SlidersIcon className="text-text-secondary" />
        <span>Settings</span>
      </div>

      <div className="flex items-center gap-10 px-10 py-8">
        <PersonAvatar person={TEAM.amara} size={28} />
        <div className="flex flex-col gap-1">
          <span className="text-13 font-500 text-text-primary">{CURRENT_USER.fullName}</span>
          <span className="text-11-5 text-text-muted">{CURRENT_USER.role}</span>
        </div>
      </div>
    </aside>
  );
}

const BADGE_TONE: Record<Extract<Tone, 'warning' | 'danger'>, string> = {
  warning: 'bg-status-warning-soft text-status-warning-text',
  danger: 'bg-status-danger-soft text-status-danger-text',
};

/** Nav badge. Pulses 1 → 1.15 → 1 when its count changes (brief B7.6). */
function Badge({ count, tone }: { count: number; tone: Extract<Tone, 'warning' | 'danger'> }) {
  const [scope, animate] = useAnimate();
  const reduce = useReducedMotion();
  const previous = useRef(count);

  useEffect(() => {
    if (previous.current === count) return;
    previous.current = count;
    if (!reduce) animate(scope.current, { scale: [1, 1.15, 1] }, { duration: timing.badgePulse });
  }, [count, reduce, animate, scope]);

  return (
    <span ref={scope} className={`relative rounded-10 px-7 py-1 text-11 font-600 tabular-nums ${BADGE_TONE[tone]}`}>
      <span className="sr-only">, </span>
      {count}
      <span className="sr-only"> need attention</span>
    </span>
  );
}

export type { Page };
