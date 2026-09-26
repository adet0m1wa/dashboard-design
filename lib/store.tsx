'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import { createStore, useStore, type StoreApi } from 'zustand';
import { answerFor, DEFAULT_TAGGED_QUESTION, type Block } from '@/data/conversation';
import { TODAY_INDEX } from '@/data/kpis';
import { PAGE_TITLES } from '@/data/nav';
import type { Kpi, Page, PersonId } from '@/data/types';
import { clockLabel, START_MINUTES } from '@/lib/clock';
import { timing } from '@/lib/motion';

// App state, shaped like brief B3. One store per AppShell (created in a provider so SSR
// requests never share state).

export interface HopFrameRef {
  id: string;
  label: string;
  page: Page;
  jumpTarget?: Page;
}

export type Message =
  | { id: string; kind: 'user'; author: PersonId; time: string; text: string; tag?: HopFrameRef; page: Page }
  | { id: string; kind: 'hop'; time: string; reads: Page[]; blocks: Block[]; status: 'thinking' | 'streaming' | 'done' }
  | { id: string; kind: 'marker'; text: string; time: string };

/** A finished conversation, saved to History by New chat (brief B7.2). */
export interface SavedThread {
  id: string;
  savedAt: number; // clock minutes
  messages: Message[];
}

/** How a page change happened — decides what happens to jumpOrigin (brief B3). */
export type NavSource = 'sidebar' | 'jump' | 'link' | 'history' | 'tag';

export interface AnalyticsState {
  kpi: Kpi;
  range: 'thisWeek' | 'lastWeek';
  day: number | null; // null = today
}

export interface HistoryState {
  selectedId: string;
  expanded: boolean;
  person: string | 'all';
  pageFilter: Page | 'all';
  query: string;
}

export interface HopState {
  page: Page;
  analytics: AnalyticsState;
  selection: HopFrameRef | null;
  jumpOrigin: Page | null;
  history: HistoryState;
  /** The one orchestrated Analytics entrance plays the first time Analytics shows (B7.1). */
  analyticsIntroPending: boolean;
  messages: Message[];
  hopStatus: 'idle' | 'thinking' | 'streaming';
  scanning: boolean;
  clock: number; // minutes since midnight
  announce: string; // last finished answer, for the aria-live region
  threads: SavedThread[];
  hoverId: string | null; // deepest selectable under the pointer
  selectPulse: number; // bumps on every select, so the Select animation can replay
  revealPulse: number; // bumps when a tag in an old message asks for its frame to be scrolled into view
  activeTagId: string | null; // the old message whose tag is showing the "active" style
  sync: 'idle' | 'syncing' | 'synced';
  toast: { id: number; text: string } | null;

  navigate: (page: Page, source: NavSource) => void;
  finishAnalyticsIntro: () => void;
  setHover: (id: string | null) => void;
  select: (ref: HopFrameRef) => void;
  deselect: () => void;
  /** Urgent "Draft replies" / "Reorder": tag that row and ask in one go (brief B7.1). */
  askAbout: (ref: HopFrameRef, text: string) => void;
  /** Click on a tag in an earlier message: go to its page, highlight it again (brief B6). */
  rehighlight: (messageId: string) => void;
  /** Send a question. Uses the current selection as the tag. */
  ask: (text: string) => void;
  finishAnswer: (id: string) => void;
  newChat: () => void;
  startSync: () => void;
  showToast: (text: string) => void;
  hideToast: (id: number) => void;
  setKpi: (kpi: Kpi) => void;
  setRange: (range: AnalyticsState['range']) => void;
  /** Select a past day on the chart (0 = Mon). null or today's index = back to today. */
  setDay: (day: number | null) => void;
  /** Sidebar "Recent with Hop": open History with that brief selected. */
  openBrief: (briefId: string | null) => void;
}

export { PAGE_IDS, isPage } from './pages';

export function createHopStore(initialPage: Page) {
  return createStore<HopState>()((set, get) => ({
    page: initialPage,
    analytics: { kpi: 'revenue', range: 'thisWeek', day: null },
    selection: null,
    jumpOrigin: null,
    history: { selectedId: 'b-2-33', expanded: false, person: 'all', pageFilter: 'all', query: '' },
    analyticsIntroPending: true,
    messages: [],
    hopStatus: 'idle',
    scanning: false,
    clock: START_MINUTES,
    announce: '',
    threads: [],
    hoverId: null,
    selectPulse: 0,
    revealPulse: 0,
    activeTagId: null,
    sync: 'idle',
    toast: null,

    navigate: (page, source) => {
      const s = get();
      if (page === s.page) return;
      // With a thread open, moving page drops a "Moved to …" marker into it (brief B7.2).
      const marker = s.messages.length > 0;
      const clock = marker ? s.clock + 1 : s.clock;
      // jumpOrigin (brief B3): set only by a jump chip; cleared by the sidebar, card links,
      // "Go to Analytics", or anything else that lands back where the jump started.
      let jumpOrigin = s.jumpOrigin;
      if (source === 'sidebar' || source === 'link') jumpOrigin = null;
      else if (source === 'jump') jumpOrigin = page === 'analytics' ? null : s.page;
      if (jumpOrigin === page) jumpOrigin = null;
      set({
        page,
        jumpOrigin,
        // The selected frame belongs to the page she's leaving.
        selection: null,
        hoverId: null,
        activeTagId: null,
        clock,
        messages: marker
          ? [...s.messages, { id: nextId(), kind: 'marker', text: `Moved to ${PAGE_TITLES[page]}`, time: clockLabel(clock) }]
          : s.messages,
      });
    },

    ask: (raw) => {
      const s = get();
      if (s.hopStatus !== 'idle') return; // one question at a time
      const tag = s.selection ?? undefined;
      const text = raw.trim() || (tag ? DEFAULT_TAGGED_QUESTION : '');
      if (!text) return;
      const clock = s.clock + 1;
      const time = clockLabel(clock);
      const answer = answerFor(tag?.id, text);
      const answerId = nextId();
      set({
        clock,
        hopStatus: 'thinking',
        scanning: Boolean(tag),
        activeTagId: null,
        messages: [
          ...s.messages,
          { id: nextId(), kind: 'user', author: 'amara', time, text, tag, page: s.page },
          { id: answerId, kind: 'hop', time, reads: answer.reads, blocks: answer.blocks, status: 'thinking' },
        ],
      });
      // Scripted answers are ready at once; a tagged question still scans for at least
      // scanMin so the moment reads (brief B6), an untagged one shows typing dots briefly.
      setTimeout(() => {
        const now = get();
        if (!now.messages.some((m) => m.id === answerId)) return; // New chat in between
        set({
          hopStatus: 'streaming',
          scanning: false,
          // The answer is here: the highlight and the tag clear (brief B6 step 5).
          selection: tag ? null : now.selection,
          activeTagId: tag ? null : now.activeTagId,
          messages: now.messages.map((m) => (m.id === answerId && m.kind === 'hop' ? { ...m, status: 'streaming' } : m)),
        });
      }, (tag ? timing.scanMin : timing.think) * 1000);
    },

    finishAnswer: (id) => {
      const s = get();
      const msg = s.messages.find((m) => m.id === id);
      if (!msg || msg.kind !== 'hop') return;
      set({
        hopStatus: 'idle',
        announce: msg.blocks.map((b) => (b.kind === 'text' ? b.text : '')).join(' ').trim(),
        messages: s.messages.map((m) => (m.id === id && m.kind === 'hop' ? { ...m, status: 'done' } : m)),
      });
    },

    setHover: (id) => {
      if (get().hoverId !== id) set({ hoverId: id });
    },

    select: (ref) => {
      const s = get();
      if (s.scanning) return; // the frame being read stays put until the answer lands
      set({ selection: ref, selectPulse: s.selectPulse + 1, activeTagId: null });
    },

    deselect: () => {
      const s = get();
      if (s.scanning || !s.selection) return;
      set({ selection: null, activeTagId: null });
    },

    askAbout: (ref, text) => {
      if (get().hopStatus !== 'idle') return;
      get().select(ref);
      get().ask(text);
    },

    rehighlight: (messageId) => {
      const s = get();
      const msg = s.messages.find((m) => m.id === messageId);
      if (!msg || msg.kind !== 'user' || !msg.tag || s.scanning) return;
      if (msg.tag.page !== s.page) get().navigate(msg.tag.page, 'tag');
      const now = get();
      set({
        selection: msg.tag,
        selectPulse: now.selectPulse + 1,
        revealPulse: now.revealPulse + 1,
        activeTagId: messageId,
      });
    },

    newChat: () => {
      const s = get();
      if (s.messages.length === 0) return;
      const hasQuestion = s.messages.some((m) => m.kind === 'user');
      set({
        messages: [],
        hopStatus: 'idle',
        scanning: false,
        selection: null,
        activeTagId: null,
        threads: hasQuestion ? [{ id: nextId(), savedAt: s.clock, messages: s.messages }, ...s.threads] : s.threads,
      });
    },

    finishAnalyticsIntro: () => set({ analyticsIntroPending: false }),

    startSync: () => {
      if (get().sync === 'syncing') return;
      set({ sync: 'syncing' });
      setTimeout(() => set({ sync: 'synced' }), timing.syncSpin * 1000);
    },

    showToast: (text) => set({ toast: { id: Date.now(), text } }),
    hideToast: (id) => set((s) => (s.toast?.id === id ? { toast: null } : {})),

    setKpi: (kpi) => set((s) => ({ analytics: { ...s.analytics, kpi } })),
    setRange: (range) => set((s) => ({ analytics: { ...s.analytics, range, day: null } })),
    setDay: (day) =>
      set((s) => ({ analytics: { ...s.analytics, range: 'thisWeek', day: day === TODAY_INDEX ? null : day } })),

    openBrief: (briefId) => {
      if (briefId) set((s) => ({ history: { ...s.history, selectedId: briefId, expanded: false } }));
      get().navigate('history', 'sidebar');
    },
  }));
}

let idCounter = 0;
const nextId = () => `m${++idCounter}`;

const StoreContext = createContext<StoreApi<HopState> | null>(null);

export function HopStoreProvider({ initialPage, children }: { initialPage: Page; children: ReactNode }) {
  const [store] = useState(() => createHopStore(initialPage));
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

function useStoreApi() {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useHop must be used inside <HopStoreProvider>');
  return store;
}

/** Subscribe to a slice of state. Return primitives or stable references (or wrap with useShallow). */
export function useHop<T>(selector: (s: HopState) => T): T {
  return useStore(useStoreApi(), selector);
}

/** For event handlers that need the latest state without subscribing. */
export function useHopApi() {
  return useStoreApi();
}
