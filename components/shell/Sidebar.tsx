'use client';

import { AnimatePresence, motion, useAnimate, useIsPresent, useReducedMotion } from 'motion/react';
import { useEffect, useRef } from 'react';
import { NAV } from '@/data/nav';
import { RECENT_WITH_HOP } from '@/data/history';
import { CURRENT_USER, TEAM } from '@/data/team';
import type { Page, Tone } from '@/data/types';
import { duration, enter, layoutSpring, leave, press, timing } from '@/lib/motion';
import { useHop } from '@/lib/store';
import { ChevIcon, HistoryIcon, PanelIcon, SlidersIcon } from '@/components/icons/figma';
import { PageIcon } from './PageIcon';
import { PersonAvatar } from '@/components/ui/PersonAvatar';

// The sidebar, open (Figma "Analytics" > Sidebar, 224) or collapsed to an icon rail ("example 1",
// 56). The panel icon toggles it. The width slides (slow, CSS so it can use the layout tokens) and
// the two layouts crossfade inside it; each keeps its own width, so nothing reflows mid-slide.
export function Sidebar() {
  const collapsed = useHop((s) => s.sidebarCollapsed);

  return (
    <aside
      aria-label="Sidebar"
      className={`relative shrink-0 overflow-hidden transition-[width] duration-(--dur-slow) ease-hop-out motion-reduce:transition-none ${
        collapsed ? 'w-sidebar-rail' : 'w-sidebar'
      }`}
    >
      <AnimatePresence initial={false}>{collapsed ? <Rail key="rail" /> : <Full key="full" />}</AnimatePresence>
    </aside>
  );
}

// A keyboard press on the toggle swaps the button for its twin in the other layout; this carries
// the focus across so she isn't dropped back at the top of the page.
let refocusToggle = false;

function useLayer() {
  const present = useIsPresent();
  const reduce = useReducedMotion();
  const toggleRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (refocusToggle) {
      refocusToggle = false;
      toggleRef.current?.focus();
    }
  }, []);
  const layer = {
    className: 'absolute inset-y-0 left-0 flex flex-col gap-2 px-4 py-6',
    initial: reduce ? false : { opacity: 0 },
    animate: { opacity: 1, transition: enter() },
    exit: { opacity: 0, transition: reduce ? { duration: 0 } : leave(duration.fast) },
    // The layer on its way out can't be clicked or tabbed to.
    inert: !present,
  } as const;
  return { layer, toggleRef };
}

function Toggle({ collapsed, toggleRef }: { collapsed: boolean; toggleRef: React.RefObject<HTMLButtonElement | null> }) {
  const toggle = useHop((s) => s.toggleSidebar);
  return (
    <motion.button
      ref={toggleRef}
      type="button"
      whileTap={press}
      onClick={(e) => {
        refocusToggle = e.detail === 0; // detail 0 = Enter/Space, not a mouse click
        toggle();
      }}
      aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      aria-expanded={!collapsed}
      className="rounded-4 text-text-muted transition-colors duration-(--dur-fast) ease-hop-out hover:text-text-primary"
    >
      <PanelIcon />
    </motion.button>
  );
}

function Full() {
  const page = useHop((s) => s.page);
  const navigate = useHop((s) => s.navigate);
  const openBrief = useHop((s) => s.openBrief);
  const { layer, toggleRef } = useLayer();

  return (
    <motion.div {...layer} className={`${layer.className} w-sidebar`}>
      {/* Figma "Stack / AA": store switcher + nav, no gap between them */}
      <div className="flex flex-col">
        {/* Store switcher (static in this prototype); the panel icon collapses the sidebar */}
        <div className="flex items-center justify-between px-8 py-6">
          <div className="flex items-center gap-8">
            <span className="flex size-[22px] items-center justify-center rounded-6 bg-action-primary text-9 font-700 text-text-on-dark">
              {CURRENT_USER.storeInitials}
            </span>
            <span className="text-13 font-600 text-text-primary">{CURRENT_USER.store}</span>
            <ChevIcon className="text-text-muted" />
          </div>
          <Toggle collapsed={false} toggleRef={toggleRef} />
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
                {active && <NavPill id="nav-pill" />}
                <PageIcon page={item.id} className={`relative ${iconTone(active)}`} />
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
            onClick={() => openBrief(item)}
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
    </motion.div>
  );
}

/** The collapsed rail (Figma "example 1" > Sidebar): icons only, badges under their icons. */
function Rail() {
  const page = useHop((s) => s.page);
  const navigate = useHop((s) => s.navigate);
  const openBrief = useHop((s) => s.openBrief);
  const { layer, toggleRef } = useLayer();

  return (
    <motion.div {...layer} className={`${layer.className} w-sidebar-rail items-center`}>
      <div className="flex w-full flex-col items-center">
        <div className="flex px-8 py-6">
          <Toggle collapsed toggleRef={toggleRef} />
        </div>

        <nav aria-label="Pages" className="flex w-full flex-col items-center gap-2 pt-16">
          {NAV.map((item) => {
            const active = item.id === page;
            return (
              <motion.button
                key={item.id}
                type="button"
                onClick={() => navigate(item.id, 'sidebar')}
                whileTap={press}
                aria-current={active ? 'page' : undefined}
                aria-label={item.badge ? `${item.label}, ${item.badge.count} need attention` : item.label}
                title={item.label}
                className={`relative flex flex-col items-center gap-2 rounded-8 px-10 py-7 transition-colors duration-(--dur-fast) ease-hop-out ${
                  active ? '' : 'hover:bg-surface-faint'
                }`}
              >
                {active && <NavPill id="nav-pill-rail" />}
                <PageIcon page={item.id} className={`relative ${iconTone(active)}`} />
                {item.badge && <Badge count={item.badge.count} tone={item.badge.tone} />}
              </motion.button>
            );
          })}
        </nav>
      </div>

      <section aria-label="Recent with Hop" className="flex w-full flex-col items-center gap-2 pt-16">
        <div className="flex px-10 pb-6">
          <HistoryIcon className="text-text-muted" />
        </div>
        {RECENT_WITH_HOP.map((item) => (
          <motion.button
            key={item.text}
            type="button"
            whileTap={press}
            onClick={() => openBrief(item)}
            aria-label={item.text}
            title={item.text}
            className="flex rounded-6 px-10 py-6 transition-colors duration-(--dur-fast) ease-hop-out hover:bg-surface-faint"
          >
            <PersonAvatar person={TEAM[item.who]} size={16} />
          </motion.button>
        ))}
      </section>

      <div className="flex-1" />

      <div className="flex py-7 text-text-secondary">
        <SlidersIcon />
        <span className="sr-only">Settings</span>
      </div>

      <div className="flex px-10 py-8" title={`${CURRENT_USER.fullName}, ${CURRENT_USER.role}`}>
        <PersonAvatar person={TEAM.amara} size={28} />
      </div>
    </motion.div>
  );
}

const iconTone = (active: boolean) =>
  `transition-colors duration-(--dur-base) ease-hop-out ${active ? 'text-text-primary' : 'text-text-secondary'}`;

/** The white pill behind the current page; slides between items (layoutId, brief B7.6). */
function NavPill({ id }: { id: string }) {
  return (
    <motion.span
      layoutId={id}
      transition={layoutSpring}
      className="absolute inset-0 rounded-8 border-(length:--stroke-0-5) border-surface-border-tint bg-surface-default shadow-nav-active"
    />
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
