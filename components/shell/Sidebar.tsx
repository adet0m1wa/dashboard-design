'use client';

import { motion, useAnimate, useReducedMotion } from 'motion/react';
import { useEffect, useRef } from 'react';
import { NAV } from '@/data/nav';
import { RECENT_WITH_HOP } from '@/data/history';
import { CURRENT_USER, TEAM } from '@/data/team';
import type { Page, Tone } from '@/data/types';
import { press, timing } from '@/lib/motion';
import { useHop } from '@/lib/store';
import { ChevIcon, HistoryIcon, PanelIcon, SlidersIcon } from '@/components/icons/figma';
import { PageIcon } from './PageIcon';
import { PersonAvatar } from '@/components/ui/PersonAvatar';
import { Truncate } from '@/components/ui/Truncate';

// The sidebar, open (Figma "Analytics" > Sidebar, 224) or collapsed to an icon rail ("example 1",
// 56). The panel icon toggles it — instantly, like the Claude app's sidebar (user feedback
// 2026-09-29: no slide, no crossfade).
//
// One layout for both states (user feedback 2026-10-01): every row keeps its height, so each icon
// keeps its y and only moves across to the rail's centre. Labels stay in the flow but are hidden
// and squeezed to no width, so they still set the row height. The same buttons stay mounted, so a
// press (scale 0.97) plays out even while the sidebar shrinks under it. In the rail a nav badge
// sits on its icon's corner rather than under it (Figma), which would push the rows below down.
export function Sidebar() {
  const collapsed = useHop((s) => s.sidebarCollapsed);
  const page = useHop((s) => s.page);
  const navigate = useHop((s) => s.navigate);
  const openBrief = useHop((s) => s.openBrief);
  const width = collapsed ? 'w-sidebar-rail' : 'w-sidebar';
  const label = collapsed ? 'invisible w-0 overflow-hidden whitespace-nowrap' : 'min-w-0 flex-1'; // a label, open or squeezed
  const center = collapsed ? 'items-center' : '';

  return (
    <aside aria-label="Sidebar" className={`relative shrink-0 overflow-hidden ${width}`}>
      <div className={`absolute inset-y-0 left-0 flex flex-col gap-2 px-4 py-6 ${width}`}>
        {/* Figma "Stack / AA": store switcher + nav, no gap between them */}
        <div className={`flex flex-col ${center}`}>
          {/* Store switcher (static in this prototype); the panel icon collapses the sidebar. The
              row keeps the switcher's height when only the toggle is left. */}
          <div className={`flex min-h-[34px] items-center px-8 py-6 ${collapsed ? 'justify-center' : 'w-full justify-between'}`}>
            {!collapsed && (
              <div className="flex items-center gap-8">
                <span className="flex size-[22px] items-center justify-center rounded-6 bg-action-primary text-9 font-700 text-text-on-dark">
                  {CURRENT_USER.storeInitials}
                </span>
                <span className="text-13 font-600 text-text-primary">{CURRENT_USER.store}</span>
                <ChevIcon className="text-text-muted" />
              </div>
            )}
            <Toggle collapsed={collapsed} />
          </div>

          <nav aria-label="Pages" className={`flex w-full flex-col gap-2 pt-16 ${center}`}>
            {NAV.map((item) => {
              const active = item.id === page;
              return (
                <motion.button
                  key={item.id}
                  type="button"
                  onClick={() => navigate(item.id, 'sidebar')}
                  whileTap={press}
                  aria-current={active ? 'page' : undefined}
                  aria-label={collapsed ? (item.badge ? `${item.label}, ${item.badge.count} need attention` : item.label) : undefined}
                  title={collapsed ? item.label : undefined}
                  className={`relative flex items-center rounded-8 px-10 py-7 text-left text-13 ${collapsed ? '' : 'w-full gap-10'} ${
                    active ? 'font-600 text-text-primary' : 'font-500 text-text-secondary hover:bg-surface-faint'
                  }`}
                >
                  {active && <NavPill />}
                  <PageIcon page={item.id} className={`relative ${iconTone(active)}`} />
                  <span className={`relative ${label}`}>{item.label}</span>
                  {item.badge && <Badge count={item.badge.count} tone={item.badge.tone} onIcon={collapsed} />}
                </motion.button>
              );
            })}
          </nav>
        </div>

        <section aria-labelledby="recent-heading" className={`flex flex-col gap-2 pt-16 ${center}`}>
          <div className={`flex items-center px-10 pb-6 ${collapsed ? '' : 'justify-between'}`}>
            <h2 id="recent-heading" className={`text-11-5 font-500 text-text-muted ${collapsed ? 'invisible w-0 overflow-hidden whitespace-nowrap' : ''}`}>
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
              aria-label={collapsed ? item.text : undefined}
              title={collapsed ? item.text : undefined}
              className={`flex items-center rounded-6 px-10 py-6 text-left transition-colors duration-(--dur-fast) ease-hop-color hover:bg-surface-faint ${collapsed ? '' : 'w-full gap-8'}`}
            >
              <PersonAvatar person={TEAM[item.who]} size={16} />
              {collapsed ? (
                <span className={`text-12-5 ${label}`}>{item.text}</span>
              ) : (
                <Truncate className="min-w-0 flex-1 text-12-5 text-text-tone-01">{item.text}</Truncate>
              )}
            </motion.button>
          ))}
        </section>

        <div className="flex-1" />

        {/* Settings isn't part of this prototype: shown as designed, not interactive. */}
        <div className={`flex items-center rounded-8 px-10 py-7 text-13 font-500 text-text-strong-secondary ${collapsed ? 'self-center' : 'gap-10'}`}>
          <SlidersIcon className="text-text-secondary" />
          <span className={collapsed ? 'sr-only' : ''}>Settings</span>
          {collapsed && <span aria-hidden="true" className={label}>Settings</span>}
        </div>

        <div className={`flex items-center px-10 py-8 ${collapsed ? 'self-center' : 'gap-10'}`} title={collapsed ? `${CURRENT_USER.fullName}, ${CURRENT_USER.role}` : undefined}>
          <PersonAvatar person={TEAM.amara} size={28} />
          <div className={`flex flex-col gap-1 ${collapsed ? 'invisible w-0 overflow-hidden whitespace-nowrap' : ''}`}>
            <span className="whitespace-nowrap text-13 font-500 text-text-primary">{CURRENT_USER.fullName}</span>
            <span className="whitespace-nowrap text-11-5 text-text-muted">{CURRENT_USER.role}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

function Toggle({ collapsed }: { collapsed: boolean }) {
  const toggle = useHop((s) => s.toggleSidebar);
  return (
    <motion.button
      type="button"
      whileTap={press}
      onClick={toggle}
      aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      aria-expanded={!collapsed}
      className="relative rounded-4 text-text-muted transition-colors duration-(--dur-fast) ease-hop-color after:absolute after:-inset-4 hover:text-text-primary"
    >
      <PanelIcon />
    </motion.button>
  );
}

const iconTone = (active: boolean) => (active ? 'text-text-primary' : 'text-text-secondary');

/** The white pill behind the current page. It moves to the new page at once (user feedback
 *  2026-09-29: page changes are instant, the sidebar included). */
function NavPill() {
  return <span className="absolute inset-0 rounded-8 border-(length:--stroke-0-5) border-surface-border-tint bg-surface-default shadow-nav-active" />;
}

const BADGE_TONE: Record<Extract<Tone, 'warning' | 'danger'>, string> = {
  warning: 'bg-status-warning-soft text-status-warning-text',
  danger: 'bg-status-danger-soft text-status-danger-text',
};

/** Nav badge. Pulses 1 → 1.15 → 1 when its count changes (brief B7.6). */
function Badge({ count, tone, onIcon = false }: { count: number; tone: Extract<Tone, 'warning' | 'danger'>; onIcon?: boolean }) {
  const [scope, animate] = useAnimate();
  const reduce = useReducedMotion();
  const previous = useRef(count);

  useEffect(() => {
    if (previous.current === count) return;
    previous.current = count;
    if (!reduce) animate(scope.current, { transform: ['scale(1)', 'scale(1.15)', 'scale(1)'] }, { duration: timing.badgePulse });
  }, [count, reduce, animate, scope]);

  return (
    <span
      ref={scope}
      // In the rail it sits on the icon's top-right corner, out of the flow, so the row keeps its height.
      className={`rounded-10 px-7 py-1 text-11 font-600 tabular-nums ${onIcon ? 'absolute -top-3 left-[18px] px-4 py-0' : 'relative'} ${BADGE_TONE[tone]}`}
    >
      <span className="sr-only">, </span>
      {count}
      <span className="sr-only"> need attention</span>
    </span>
  );
}

export type { Page };
