'use client';

import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'motion/react';
import { useEffect, useLayoutEffect, useRef } from 'react';
import { HISTORY_PEOPLE, type Brief } from '@/data/history';
import { TEAM } from '@/data/team';
import { matches } from '@/lib/briefs';
import { viaKeyboard } from '@/lib/input';
import { duration, easeExit, indicatorSlide, press } from '@/lib/motion';
import { useHop } from '@/lib/store';
import { ArrowsOutIcon, Chev13Icon, Frame11Icon, SearchIcon } from '@/components/icons/figma';
import { PersonAvatar } from '@/components/ui/PersonAvatar';
import { SmallButton } from '@/components/ui/SmallButton';
import { PageMenu } from './PageMenu';
import { Truncate } from '@/components/ui/Truncate';

// The brief chain (brief B7.5; Figma "Brief chain"): person chips, search and page filter, then
// the briefs grouped by day with the dotted trail. Selecting slides the soft background to the
// brief (layoutId, like the KPI pill) while its expand icon grows in alongside. The rows
// themselves never animate: filtering changes the list at once (user feedback 2026-10-01); the
// trail is drawn per brief from the filtered list, so it stays continuous.
const DAYS = ['Today', 'Yesterday'] as const;

export function BriefChain({
  briefs,
  expandRef,
  focusExpand,
  scrollMemory,
}: {
  briefs: Brief[];
  expandRef: React.RefObject<HTMLButtonElement | null>;
  focusExpand: boolean;
  /** Where the list was scrolled when a chat opened (HistoryPanel keeps it across the swap). */
  scrollMemory: React.RefObject<number | null>;
}) {
  const history = useHop((s) => s.history);
  const visible = briefs.filter((b) => matches(b, history));
  const list = useRef<HTMLDivElement>(null);
  // Only the highlight is a layout element, and it only slides when the pick changes. Motion
  // re-measures it whenever the rows change (rows leaving the list trigger that too), so on the
  // render a filter changed it lands at once with its row (switching names is instant).
  const layoutKey = history.selectedId;
  const filterKey = `${history.person}|${history.pageFilter}|${history.query}`;
  const lastFilter = useRef(filterKey);
  const refiltered = lastFilter.current !== filterKey;
  useEffect(() => {
    lastFilter.current = filterKey;
  });

  // Back from a chat: the list is where it was when the chat opened (user feedback 2026-10-01 —
  // it used to jump to the picked brief and hide "Yesterday").
  const restored = useRef(false);
  useLayoutEffect(() => {
    if (list.current && scrollMemory.current !== null) {
      list.current.scrollTop = scrollMemory.current;
      restored.current = true;
    }
  }, [scrollMemory]);

  // A brief selected from elsewhere (Recent with Hop) is brought into view — not on the way back
  // from a chat, which restores the scroll instead.
  useEffect(() => {
    if (restored.current) {
      restored.current = false;
      return;
    }
    list.current?.querySelector('[aria-current="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [history.selectedId]);

  // Back from the chat: focus goes to the Expand pill it was opened from.
  useEffect(() => {
    if (focusExpand) expandRef.current?.focus({ preventScroll: true });
  }, [focusExpand, expandRef]);

  return (
    <div className="flex h-full flex-col">
      <Filters />
      {/* layoutScroll: Motion reads the list's scroll, so bringing a brief into view isn't taken
          for the rows moving (they used to slide by the scrolled distance). */}
      <motion.div
        ref={list}
        layoutScroll
        onScroll={(e) => (scrollMemory.current = e.currentTarget.scrollTop)}
        className="min-h-0 flex-1 overflow-y-auto pb-14"
      >
        <LayoutGroup>
          {DAYS.map((day) => {
            const items = visible.filter((b) => b.day === day);
            if (items.length === 0) return null;
            return (
              <section key={day} aria-label={day}>
                <h2 className="px-16 pb-4 pt-14 text-11 font-500 text-text-muted">{day}</h2>
                <ul>
                  {items.map((b, i) => (
                    <BriefItem key={b.id} brief={b} first={i === 0} last={i === items.length - 1} expandRef={expandRef} layoutKey={layoutKey} instant={refiltered} />
                  ))}
                </ul>
              </section>
            );
          })}
        </LayoutGroup>
        {visible.length === 0 && <NoMatches />}
      </motion.div>
    </div>
  );
}

/** Filters that match nothing: say so, name the search, and offer the way back. */
function NoMatches() {
  const query = useHop((s) => s.history.query.trim());
  const setFilter = useHop((s) => s.setHistoryFilter);
  return (
    <div className="flex flex-col items-center gap-12 px-16 pt-24 text-center">
      <p className="text-12-5 text-text-secondary">{query ? `No briefs match “${query}”.` : 'No briefs match these filters.'}</p>
      <SmallButton onClick={() => setFilter({ person: 'all', pageFilter: 'all', query: '' })}>Clear filters</SmallButton>
    </div>
  );
}

function Filters() {
  const person = useHop((s) => s.history.person);
  const query = useHop((s) => s.history.query);
  const setFilter = useHop((s) => s.setHistoryFilter);
  const box = 'rounded-8 border border-surface-border-tint bg-surface-default transition-colors duration-(--dur-fast) ease-hop-color';

  return (
    <div className="shrink-0 border-b border-surface-divider-tint">
      <div role="group" aria-label="Show briefs from" className="flex flex-wrap gap-6 px-16 pb-10 pt-14">
        <Chip active={person === 'all'} onClick={() => setFilter({ person: 'all' })}>
          <span className="px-11 py-4">Everyone</span>
        </Chip>
        {HISTORY_PEOPLE.map((id) => (
          <Chip key={id} active={person === id} onClick={() => setFilter({ person: person === id ? 'all' : id })}>
            <span className="flex items-center gap-6 py-3 pl-4 pr-10">
              <PersonAvatar person={TEAM[id]} size={18} />
              {TEAM[id].name}
            </span>
          </Chip>
        ))}
      </div>
      {/* The search takes whatever the page menu (105) leaves: at the panel's full width it's
          8px narrower than before the menu widened (user feedback 2026-09-30). */}
      <div className="flex justify-between gap-8 px-16 pb-12">
        <label className={`flex min-w-0 flex-1 items-center gap-8 px-10 py-7 has-[input:focus]:border-selection ${box}`}>
          <SearchIcon className="shrink-0 text-text-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setFilter({ query: e.target.value })}
            placeholder="Search briefs"
            aria-label="Search briefs"
            className="min-w-0 flex-1 bg-transparent text-12-5 text-text-primary outline-none placeholder:text-text-muted"
          />
        </label>
        <PageMenu />
      </div>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <motion.button
      type="button"
      whileTap={press}
      onClick={onClick}
      aria-pressed={active}
      // The on/off look switches at once (user feedback 2026-09-29).
      className={`flex rounded-999 border text-12 font-500 ${
        active ? 'border-action-primary bg-action-primary text-text-on-dark' : 'border-surface-border-tint text-text-strong-secondary hover:bg-surface-subtle'
      }`}
    >
      {children}
    </motion.button>
  );
}

function BriefItem({
  brief,
  first,
  last,
  expandRef,
  layoutKey,
  instant,
}: {
  brief: Brief;
  first: boolean;
  last: boolean;
  expandRef: React.RefObject<HTMLButtonElement | null>;
  layoutKey: string | null;
  /** The filters just changed: the highlight lands with its row. */
  instant: boolean;
}) {
  const selected = useHop((s) => s.history.selectedId === brief.id);
  const selectBrief = useHop((s) => s.selectBrief);
  const setExpanded = useHop((s) => s.setExpanded);
  const reduce = useReducedMotion();
  const keys = viaKeyboard(); // picked with Enter: the background and expand icon land at once
  const person = TEAM[brief.who];
  const summaryId = `${brief.id}-summary`;
  const open = `Open the chat for “${brief.question}”`;

  return (
    <li className="relative overflow-hidden">
      {selected && (
        <motion.span
          layoutId="brief-selected"
          layoutDependency={layoutKey}
          transition={keys || instant ? { duration: 0 } : indicatorSlide}
          className="absolute inset-0 bg-palette-tone-28"
        />
      )}
      {/* The whole row is one button: it picks the brief, and on the picked brief it opens the chat
          (user feedback 2026-09-29). The expand icon sits above it. */}
      <button
        type="button"
        onClick={() => (selected ? setExpanded(true) : selectBrief(brief.id))}
        aria-current={selected}
        aria-label={selected ? open : `${person.name} · ${brief.time}: ${brief.question}`}
        aria-describedby={brief.summary ? summaryId : undefined}
        title={brief.summary || undefined} // the summary is clamped to 2 lines; hovering shows all of it
        className="absolute inset-0 z-0 rounded-4"
      />
      <div className="pointer-events-none relative flex gap-12 px-16">
        {/* Trail: a segment above the avatar and one below, hidden at the ends of a day. */}
        <div className="flex w-[18px] shrink-0 flex-col items-center self-stretch" aria-hidden="true">
          <span className={`h-[14px] ${first ? '' : 'hop-trail'}`} />
          <PersonAvatar person={person} size={18} />
          <span className={`flex-1 ${last ? '' : 'hop-trail'}`} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-5 py-14">
          <span className="flex items-center gap-8">
            <Truncate className="min-w-0 flex-1 text-11-5 font-500 text-text-muted">
              {person.name} · {brief.time}
            </Truncate>
            <span className="shrink-0 rounded-6 bg-surface-subtle px-7 py-1 text-11 font-500 text-text-secondary">{brief.pageLabel}</span>
            <AnimatePresence initial={false}>
              {selected && (
                <motion.button
                  key="expand"
                  ref={expandRef}
                  type="button"
                  onClick={() => setExpanded(true)}
                  whileTap={press}
                  aria-label={open}
                  className="pointer-events-auto relative -my-2 shrink-0 rounded-4 text-text-black after:absolute after:-inset-4"
                  // Grows in with the highlight's slide — same 250ms, same in-out curve, no spring
                  // (user feedback 2026-10-01). Reduced motion only fades — its start names scale(1),
                  // or Motion reads the missing transform as scale(0) and grows it from nothing.
                  initial={keys ? false : { opacity: 0, transform: reduce ? 'scale(1)' : 'scale(0.75)' }}
                  animate={{ opacity: 1, transform: 'scale(1)', transition: indicatorSlide }}
                  exit={{ opacity: 0, transition: { duration: duration.fast, ease: easeExit } }}
                >
                  <ArrowsOutIcon />
                </motion.button>
              )}
            </AnimatePresence>
          </span>
          <Truncate className="text-13-5 font-600 text-text-primary">{brief.question}</Truncate>
          {brief.tag && (
            <span className="flex max-w-full items-center gap-5 self-start rounded-6 border border-tag-border bg-tag-bg px-7 py-2 text-11 font-500 text-tag-text">
              <Frame11Icon className="shrink-0 text-selection" />
              <Truncate>{brief.tag.label}</Truncate>
            </span>
          )}
          {brief.summary && (
            <Truncate lines={2} id={summaryId} className="text-12-5 leading-18 text-text-secondary">
              {brief.summary}
            </Truncate>
          )}
        </div>
      </div>
    </li>
  );
}
