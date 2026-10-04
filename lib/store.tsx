'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import { createStore, useStore, type StoreApi } from 'zustand';
import { answerFor, answerForFrames, DEFAULT_TAGGED_QUESTION, type Block } from '@/data/conversation';
import { DEFAULT_THREAD, type InboxTab } from '@/data/customers';
import { IG_DEFAULT_POST, igListDay } from '@/data/instagram';
import { rangeOf, type SalesFilter, type SalesPeriod, type SalesRange, type SalesWhich } from '@/data/sales';
import { PAGE_TITLES } from '@/data/nav';
import type { Kpi, Page, PersonId } from '@/data/types';
import { clockLabel, START_MINUTES } from '@/lib/clock';
import { PANEL_MAX, PANEL_MIN } from '@/lib/layout';
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
  | {
      id: string;
      kind: 'user';
      author: PersonId;
      time: string;
      text: string;
      tag?: HopFrameRef;
      /** Frames added to the tag with Shift (round 9). */
      moreTags?: HopFrameRef[];
      page: Page;
      /** What Analytics was showing when she asked there — History redraws it (brief B7.5). */
      view?: AnalyticsState;
      /** The post or conversation open when she asked on Instagram / Customers, so a tag can
       *  bring it back (its frames only exist while it's open). */
      openItem?: string;
    }
  | { id: string; kind: 'hop'; time: string; reads: Page[]; blocks: Block[]; status: 'thinking' | 'streaming' | 'done' }
  | { id: string; kind: 'marker'; text: string; time: string; page: Page };

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
  person: PersonId | 'all';
  pageFilter: Page | 'all';
  query: string;
}

/** What's open on the Sales, Instagram and Customers pages (user feedback 2026-10-01). */
export interface PagesState {
  salesFilter: SalesFilter;
  salesPeriod: SalesPeriod; // the top bar's menu: Weekly / Monthly / All time
  salesWhich: SalesWhich; // the chart's toggle: this week (month) or last
  salesDay: number | null; // a day picked on the Sales chart (data/orders day numbers)
  igPost: string;
  /** The day picked on the Instagram calendar (data/orders day numbers); null = the last 7 days. */
  igDay: number | null;
  thread: string;
  inboxTab: InboxTab;
  inboxQuery: string;
  inboxHeight: number; // the conversation list's height under the chat, dragged (Customers)
  /** The customer's order list's height once dragged (Customers); null = whatever the details leave. */
  ordersHeight: number | null;
}

export interface HopState {
  page: Page;
  analytics: AnalyticsState;
  pages: PagesState;
  /** The frame picked first; it decides the jump chips and is scrolled to by a tag. */
  selection: HopFrameRef | null;
  /** Frames added to it with Shift+click (round 9), in the order they were added. */
  alsoSelected: HopFrameRef[];
  jumpOrigin: Page | null;
  history: HistoryState;
  /** The one orchestrated Analytics entrance plays the first time Analytics shows (B7.1). */
  analyticsIntroPending: boolean;
  inventoryIntroPending: boolean; // stock bars grow from 0 on the first visit only (B7.4)
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
  sidebarCollapsed: boolean; // Figma "example 1"
  panelCollapsed: boolean; // Figma "example 2": only the mascot shows
  /** Analytics only (user feedback 2026-10-02): the panel takes the whole workspace. */
  panelExpanded: boolean;
  /** True while the panel eases into or out of full screen: the page holds its layout till it lands. */
  panelMoving: boolean;
  /** The side panel's width, shared by every page (Hop chat, History chain). Dragged between
   *  PANEL_MIN and PANEL_MAX; kept when the panel is closed and reopened. */
  panelWidth: number;
  /** Highlight mode (the BoundingBox button in Hop's header): only then can frames be picked. */
  highlightMode: boolean;

  navigate: (page: Page, source: NavSource) => void;
  finishAnalyticsIntro: () => void;
  finishInventoryIntro: () => void;
  setHover: (id: string | null) => void;
  select: (ref: HopFrameRef) => void;
  /** Shift+click: add a frame to what's picked, or take it back out if it's already in. */
  toggleInSelection: (ref: HopFrameRef) => void;
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
  /** Select a day on the chart (0 = Mon). Either week: null or the shown day again = back to the
   *  whole week (so far, this week — user feedback 2026-10-04). */
  setDay: (day: number | null) => void;
  /** Sidebar "Recent with Hop": open History with that brief selected (or, for an item that
   *  isn't in the chain, filtered to the person who asked). */
  openBrief: (item: { briefId: string | null; who: PersonId }) => void;
  selectBrief: (id: string) => void;
  setExpanded: (expanded: boolean) => void;
  setHistoryFilter: (filter: Partial<Pick<HistoryState, 'person' | 'pageFilter' | 'query'>>) => void;
  toggleSidebar: () => void;
  togglePanel: () => void;
  setPanelWidth: (width: number) => void;
  setPanelExpanded: (on: boolean) => void;
  setPanelMoving: (on: boolean) => void;
  setHighlightMode: (on: boolean) => void;
  setPages: (pages: Partial<PagesState>) => void;
}

export { PAGE_IDS, isPage } from './pages';

export function createHopStore(initialPage: Page, init: Partial<HopState> = {}) {
  return createStore<HopState>()((set, get) => ({
    page: initialPage,
    analytics: { kpi: 'revenue', range: 'thisWeek', day: null },
    pages: { salesFilter: 'all', salesPeriod: 'week', salesWhich: 'this', salesDay: null, igPost: IG_DEFAULT_POST, igDay: null, thread: DEFAULT_THREAD, inboxTab: 'all', inboxQuery: '', inboxHeight: 280, ordersHeight: null },
    selection: null,
    alsoSelected: [],
    jumpOrigin: null,
    history: { selectedId: 'b-2-33', expanded: false, person: 'all', pageFilter: 'all', query: '' },
    analyticsIntroPending: true,
    inventoryIntroPending: true,
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
    sidebarCollapsed: false,
    panelCollapsed: false,
    panelExpanded: false,
    panelMoving: false,
    panelWidth: PANEL_MAX,
    highlightMode: false,

    navigate: (page, source) => {
      const s = get();
      if (page === s.page) return;
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
        alsoSelected: [],
        hoverId: null,
        activeTagId: null,
        // History has no Hop panel, so no highlight switch either; and it opens on the chain.
        ...(page === 'history' ? { highlightMode: false } : {}),
        // Full screen is an Analytics thing: any other page gets the panel's usual width back.
        ...(page !== 'analytics' ? { panelExpanded: false } : {}),
        ...(s.page === 'history' ? { history: { ...s.history, expanded: false } } : {}),
      });
    },

    ask: (raw) => {
      const s = get();
      if (s.hopStatus !== 'idle') return; // one question at a time
      const tag = s.selection ?? undefined;
      const moreTags = tag && s.alsoSelected.length ? s.alsoSelected : undefined;
      const text = raw.trim() || (tag ? DEFAULT_TAGGED_QUESTION : '');
      if (!text) return;
      // A "Moved to …" marker goes in only when she tags something on a page other than the one
      // the thread is on, right before that question (user feedback, 2026-09-28; replaces the
      // brief B7.2 marker on every page change). It takes a minute of the clock like a question.
      const moved = tag && s.messages.length > 0 && tag.page !== threadPage(s.messages) ? tag.page : null;
      const markerClock = s.clock + 1;
      const clock = moved ? s.clock + 2 : s.clock + 1;
      const time = clockLabel(clock);
      const answer = moreTags ? answerForFrames([tag!, ...moreTags], text) : answerFor(tag?.id, text);
      const answerId = nextId();
      set({
        clock,
        hopStatus: 'thinking',
        scanning: Boolean(tag),
        activeTagId: null,
        // Asking about a frame ends that pick: highlight mode switches off.
        ...(tag ? { highlightMode: false, hoverId: null } : {}),
        messages: [
          ...s.messages,
          ...(moved
            ? [{ id: nextId(), kind: 'marker' as const, text: `Moved to ${PAGE_TITLES[moved]}`, time: clockLabel(markerClock), page: moved }]
            : []),
          {
            id: nextId(),
            kind: 'user',
            author: 'amara',
            time,
            text,
            tag,
            moreTags,
            page: s.page,
            view: s.page === 'analytics' ? s.analytics : undefined,
            openItem:
              s.page === 'instagram' ? s.pages.igPost : s.page === 'customers' ? s.pages.thread : s.page === 'sales' ? `${salesRange(s.pages)}${s.pages.salesDay === null ? '' : `@${s.pages.salesDay}`}` : undefined,
          },
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
          alsoSelected: tag ? [] : now.alsoSelected,
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
        announce: msg.blocks.map((b) => (b.kind === 'text' ? b.text : b.kind === 'list' ? b.items.map((i) => `${i.title}. ${i.detail}`).join(' ') : '')).join(' ').trim(),
        messages: s.messages.map((m) => (m.id === id && m.kind === 'hop' ? { ...m, status: 'done' } : m)),
      });
    },

    setHover: (id) => {
      if (get().hoverId !== id) set({ hoverId: id });
    },

    select: (ref) => {
      const s = get();
      if (s.scanning) return; // the frame being read stays put until the answer lands
      // The tag lands in the composer, so a collapsed Hop panel opens for it.
      set({ selection: ref, alsoSelected: [], selectPulse: s.selectPulse + 1, activeTagId: null, panelCollapsed: false });
    },

    toggleInSelection: (ref) => {
      const s = get();
      if (s.scanning) return;
      if (!s.selection) return get().select(ref);
      const picked = [s.selection, ...s.alsoSelected];
      const rest = picked.filter((f) => f.id !== ref.id);
      // Already in: take it out (the next one along leads if it was the first). New: add it, no
      // pulse — the frames already picked keep their outlines still.
      if (rest.length === picked.length) set({ alsoSelected: [...s.alsoSelected, ref], activeTagId: null, panelCollapsed: false });
      else set({ selection: rest[0] ?? null, alsoSelected: rest.slice(1), activeTagId: null });
    },

    deselect: () => {
      const s = get();
      if (s.scanning || !s.selection) return;
      set({ selection: null, alsoSelected: [], activeTagId: null });
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
        panelExpanded: false, // the frame has to be on screen to be shown
        // A card row or a period's Urgent card only exists in the view it was asked in, so that
        // view comes back with it (otherwise the tag pointed at nothing).
        ...(msg.tag.page === 'analytics' && msg.view ? { analytics: msg.view } : {}),
        ...(msg.openItem && msg.tag.page === 'instagram' ? { pages: { ...now.pages, igPost: msg.openItem, igDay: igListDay(msg.openItem) } } : {}),
        ...(msg.openItem && msg.tag.page === 'sales' ? { pages: { ...now.pages, ...salesView(msg.openItem) } } : {}),
        ...(msg.openItem && msg.tag.page === 'customers' ? { pages: { ...now.pages, thread: msg.openItem, inboxTab: 'all' as const, inboxQuery: '' } } : {}),
        selection: msg.tag,
        alsoSelected: msg.moreTags ?? [],
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
        alsoSelected: [],
        activeTagId: null,
        threads: hasQuestion ? [{ id: nextId(), savedAt: s.clock, messages: s.messages }, ...s.threads] : s.threads,
      });
    },

    finishAnalyticsIntro: () => set({ analyticsIntroPending: false }),
    finishInventoryIntro: () => set({ inventoryIntroPending: false }),

    startSync: () => {
      if (get().sync === 'syncing') return;
      set({ sync: 'syncing' });
      setTimeout(() => set({ sync: 'synced' }), timing.syncSpin * 1000);
    },

    showToast: (text) => set({ toast: { id: Date.now(), text } }),
    hideToast: (id) => set((s) => (s.toast?.id === id ? { toast: null } : {})),

    setKpi: (kpi) => set((s) => ({ analytics: { ...s.analytics, kpi } })),
    setRange: (range) => set((s) => ({ analytics: { ...s.analytics, range, day: null } })),
    // Any day up to today (this week) or any of last week's seven; picking the shown day again
    // (or Esc → null) goes back to the whole week, as on Sales (user feedback 2026-10-01, -04).
    setDay: (day) =>
      set((s) =>
        s.analytics.range === 'lastWeek'
          ? { analytics: { ...s.analytics, day: day === null || day === s.analytics.day ? null : day } }
          : { analytics: { ...s.analytics, range: 'thisWeek', day: day === null || day === s.analytics.day ? null : day } },
      ),

    setPages: (pages) => set((s) => ({ pages: { ...s.pages, ...pages } })),

    openBrief: ({ briefId, who }) => {
      set((s) => ({
        history: briefId
          ? { ...s.history, selectedId: briefId, expanded: false, person: 'all', pageFilter: 'all', query: '' }
          : { ...s.history, expanded: false, person: who, pageFilter: 'all', query: '' },
      }));
      get().navigate('history', 'sidebar');
    },
    selectBrief: (id) => set((s) => ({ history: { ...s.history, selectedId: id } })),
    setExpanded: (expanded) => set((s) => ({ history: { ...s.history, expanded } })),
    setHistoryFilter: (filter) => set((s) => ({ history: { ...s.history, ...filter } })),

    toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
    // Hiding the panel also leaves highlight mode: its switch goes out of reach with it.
    togglePanel: () => {
      const s = get();
      if (s.panelCollapsed) return set({ panelCollapsed: false });
      set({ panelCollapsed: true, panelExpanded: false });
      s.setHighlightMode(false);
    },
    // Switching highlight off also puts away a frame it picked (unless Hop is reading it).
    setHighlightMode: (on) => {
      if (on) return set({ highlightMode: true });
      const s = get();
      set({ highlightMode: false, hoverId: null, ...(s.selection && !s.scanning ? { selection: null, alsoSelected: [], activeTagId: null } : {}) });
    },
    // Expanding hides the page, so highlight mode (which picks on the page) goes off with it.
    setPanelExpanded: (on) => {
      if (on) get().setHighlightMode(false);
      set({ panelExpanded: on && get().page === 'analytics' });
    },
    setPanelMoving: (on) => set({ panelMoving: on }),
    setPanelWidth: (width) => set({ panelWidth: Math.round(Math.min(PANEL_MAX, Math.max(PANEL_MIN, width))) }),
    ...init,
  }));
}

let idCounter = 0;
const nextId = () => `m${++idCounter}`;

/** The page a thread is "on": its last page marker, or where its first question was asked. */
function threadPage(messages: Message[]): Page | undefined {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (m.kind === 'marker') return m.page;
  }
  return messages.find((m) => m.kind === 'user')?.page;
}

const StoreContext = createContext<StoreApi<HopState> | null>(null);

/** `init` seeds a store — History uses a separate one per snapshot to redraw a page as it was. */
export function HopStoreProvider({ initialPage, init, children }: { initialPage: Page; init?: Partial<HopState>; children: ReactNode }) {
  const [store] = useState(() => createHopStore(initialPage, init));
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

function useStoreApi() {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useHop must be used inside <HopStoreProvider>');
  return store;
}

/** Whether a frame is among those picked (the first, or one added with Shift). */
export const isPicked = (s: Pick<HopState, 'selection' | 'alsoSelected'>, id: string) => s.selection?.id === id || s.alsoSelected.some((f) => f.id === id);

/** Subscribe to a slice of state. Return primitives or stable references (or wrap with useShallow). */
export function useHop<T>(selector: (s: HopState) => T): T {
  return useStore(useStoreApi(), selector);
}

/** For event handlers that need the latest state without subscribing. */
export function useHopApi() {
  return useStoreApi();
}

/** The Sales period on show, as one key ("thisWeek" …). */
export const salesRange = (p: Pick<PagesState, 'salesPeriod' | 'salesWhich'>): SalesRange => rangeOf(p.salesPeriod, p.salesWhich);

/** The page state that shows a Sales period, every order in it (a tag on a row brings it back). */
const salesView = (item: string): Pick<PagesState, 'salesPeriod' | 'salesWhich' | 'salesFilter' | 'salesDay'> => {
  const [range, day] = item.split('@') as [SalesRange, string | undefined];
  return {
    salesPeriod: range === 'all' ? 'all' : range.endsWith('Week') ? 'week' : 'month',
    salesWhich: range.startsWith('last') ? 'last' : 'this',
    salesFilter: 'all',
    salesDay: day === undefined ? null : Number(day),
  };
};
