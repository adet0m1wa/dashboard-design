'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import { createStore, useStore, type StoreApi } from 'zustand';
import type { Kpi, Page } from '@/data/types';

// App state, shaped like brief B3. One store per AppShell (created in a provider so SSR
// requests never share state).

export interface HopFrameRef {
  id: string;
  label: string;
  page: Page;
  jumpTarget?: Page;
}

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

  navigate: (page: Page, source: NavSource) => void;
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

    navigate: (page, source) => {
      if (page === get().page) return;
      set({
        page,
        // Brief B3: sidebar navigation and card links clear jumpOrigin.
        jumpOrigin: source === 'sidebar' || source === 'link' ? null : get().jumpOrigin,
      });
    },

    openBrief: (briefId) => {
      if (briefId) set((s) => ({ history: { ...s.history, selectedId: briefId, expanded: false } }));
      get().navigate('history', 'sidebar');
    },
  }));
}

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
