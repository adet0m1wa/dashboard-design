'use client';

import { MotionConfig } from 'motion/react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Page } from '@/data/types';
import { PAGE_TITLES } from '@/data/nav';
import { NARROW_WINDOW } from '@/lib/layout';
import { HopStoreProvider, isPage, useHop, useHopApi } from '@/lib/store';
import { HopPanel } from '@/components/hop/HopPanel';
import { Toast } from '@/components/ui/Toast';
import { PageArea } from './PageArea';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

// The whole app: app background (8px padding) → sidebar + one white workspace
// (page area + Hop panel). Rendered once by app/[page]/layout.tsx and never remounted.
// Narrower than the layout needs (200% zoom, a small laptop), the page area keeps its minimum
// width and the whole app scrolls sideways rather than squashing content into itself.
export function AppShell({ initialPage }: { initialPage: Page }) {
  const [init] = useState(() => ({ sidebarCollapsed: window.matchMedia(NARROW_WINDOW).matches }));
  return (
    <HopStoreProvider initialPage={initialPage} init={init}>
      <MotionConfig reducedMotion="user">
        <UrlSync />
        <FitSidebar />
        <a
          href="#main"
          className="sr-only rounded-8 bg-action-primary px-12 py-8 text-12-5 font-500 text-text-on-dark focus:not-sr-only focus:fixed focus:left-16 focus:top-16 focus:z-50"
        >
          Skip to page
        </a>
        <div className="flex h-screen gap-8 overflow-x-auto overflow-y-hidden bg-background-app p-8">
          <Sidebar />
          <div className="flex min-w-min flex-1 overflow-hidden rounded-12 bg-surface-default">
            <main id="main" className="relative flex min-w-main-min flex-1 flex-col">
              <TopBar />
              <PageArea />
              <Toast />
            </main>
            <HopPanel />
          </div>
        </div>
      </MotionConfig>
    </HopStoreProvider>
  );
}

/**
 * Keeps the URL and the store's page in step. Moving between pages is store state plus
 * history.pushState (which Next's router picks up), so nothing remounts; the browser's
 * back/forward buttons come back through usePathname.
 */
function UrlSync() {
  const page = useHop((s) => s.page);
  const api = useHopApi();
  const pathname = usePathname();

  useEffect(() => {
    if (window.location.pathname !== `/${page}`) window.history.pushState(null, '', `/${page}`);
    document.title = `${PAGE_TITLES[page]} · Hop · Amara Atelier`;
  }, [page]);

  useEffect(() => {
    const fromUrl = pathname.slice(1);
    if (isPage(fromUrl) && fromUrl !== api.getState().page) api.getState().navigate(fromUrl, 'history');
  }, [pathname, api]);

  return null;
}

/** Folds the sidebar away (or back) when the window crosses NARROW_WINDOW. */
function FitSidebar() {
  const api = useHopApi();
  useEffect(() => {
    const mq = window.matchMedia(NARROW_WINDOW);
    const onChange = () => {
      if (api.getState().sidebarCollapsed !== mq.matches) api.getState().toggleSidebar();
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [api]);
  return null;
}
