'use client';

import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'motion/react';
import { useEffect, useRef } from 'react';
import { HISTORY_PEOPLE, type Brief } from '@/data/history';
import { TEAM } from '@/data/team';
import { matches } from '@/lib/briefs';
import { duration, easeIn, easeOut, layoutSpring, press } from '@/lib/motion';
import { useHop } from '@/lib/store';
import { ArrowsOutIcon, Chev13Icon, Frame11Icon, SearchIcon } from '@/components/icons/figma';
import { PersonAvatar } from '@/components/ui/PersonAvatar';
import { SmallButton } from '@/components/ui/SmallButton';
import { PageMenu } from './PageMenu';
import { Truncate } from '@/components/ui/Truncate';

// The brief chain (brief B7.5; Figma "Brief chain"): person chips, search and page filter, then
// the briefs grouped by day with the dotted trail. Selecting slides the soft background to the
// brief (layoutId) and pops its Expand pill. Filtering collapses the removed briefs (base) and
// the rest move up (layout); the trail is drawn per brief from the filtered list, so it stays
// continuous.
const DAYS = ['Today', 'Yesterday'] as const;

export function BriefChain({
  briefs,
  expandRef,
  focusExpand,
}: {
  briefs: Brief[];
  expandRef: React.RefObject<HTMLButtonElement | null>;
  focusExpand: boolean;
}) {
  const history = useHop((s) => s.history);
  const visible = briefs.filter((b) => matches(b, history));
  const list = useRef<HTMLDivElement>(null);

  // A brief selected from elsewhere (Recent with Hop, Back from Expand) is brought into view.
  useEffect(() => {
    list.current?.querySelector('[aria-current="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [history.selectedId]);

  // Back from the chat: focus goes to the Expand pill it was opened from.
  useEffect(() => {
    if (focusExpand) expandRef.current?.focus({ preventScroll: true });
  }, [focusExpand, expandRef]);

  return (
    <div className="flex h-full flex-col">
      <Filters />
      <div ref={list} className="min-h-0 flex-1 overflow-y-auto pb-14">
        <LayoutGroup>
          <AnimatePresence initial={false}>
            {DAYS.map((day) => {
              const items = visible.filter((b) => b.day === day);
              if (items.length === 0) return null;
              return (
                <motion.section
                  key={day}
                  layout="position"
                  aria-label={day}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { duration: duration.base, ease: easeOut } }}
                  exit={{ opacity: 0, transition: { duration: duration.fast, ease: easeIn } }}
                >
                  <h2 className="px-16 pb-4 pt-14 text-11 font-500 text-text-muted">{day}</h2>
                  <ul>
                    <AnimatePresence initial={false}>
                      {items.map((b, i) => (
                        <BriefItem key={b.id} brief={b} first={i === 0} last={i === items.length - 1} expandRef={expandRef} />
                      ))}
                    </AnimatePresence>
                  </ul>
                </motion.section>
              );
            })}
          </AnimatePresence>
        </LayoutGroup>
        {visible.length === 0 && <NoMatches />}
      </div>
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
  const box = 'rounded-8 border border-surface-border-tint bg-surface-default transition-colors duration-(--dur-fast) ease-hop-out';

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
      <div className="flex gap-8 px-16 pb-12">
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
      className={`flex rounded-999 border text-12 font-500 transition-colors duration-(--dur-fast) ease-hop-out ${
        active ? 'border-action-primary bg-action-primary text-text-on-dark' : 'border-surface-border-tint text-text-strong-secondary hover:bg-surface-subtle'
      }`}
    >
      {children}
    </motion.button>
  );
}

function BriefItem({ brief, first, last, expandRef }: { brief: Brief; first: boolean; last: boolean; expandRef: React.RefObject<HTMLButtonElement | null> }) {
  const selected = useHop((s) => s.history.selectedId === brief.id);
  const selectBrief = useHop((s) => s.selectBrief);
  const setExpanded = useHop((s) => s.setExpanded);
  const reduce = useReducedMotion();
  const person = TEAM[brief.who];
  const summaryId = `${brief.id}-summary`;
  const open = `Open the chat for “${brief.question}”`;

  return (
    <motion.li
      layout="position"
      className="relative overflow-hidden"
      initial={reduce ? false : { opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto', transition: { duration: duration.base, ease: easeOut } }}
      exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, height: 0, transition: { duration: duration.base, ease: easeIn } }}
      transition={layoutSpring}
    >
      {selected && <motion.span layoutId="brief-selected" transition={layoutSpring} className="absolute inset-0 bg-palette-tone-28" />}
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
                  initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1, transition: { duration: duration.base, ease: easeOut } }}
                  exit={{ opacity: 0, transition: { duration: duration.fast, ease: easeIn } }}
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
    </motion.li>
  );
}
