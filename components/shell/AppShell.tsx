'use client';

import { MotionConfig } from 'motion/react';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import type { Page } from '@/data/types';
import { HopStoreProvider, isPage, useHop, useHopApi } from '@/lib/store';
import { HopPanel } from '@/components/hop/HopPanel';
import { PageArea } from './PageArea';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

// The whole app: app background (8px padding) → sidebar + one white workspace
// (page area + Hop panel). Rendered once by app/[page]/layout.tsx and never remounted.
export function AppShell({ initialPage }: { initialPage: Page }) {
  return (
    <HopStoreProvider initialPage={initialPage}>
      <MotionConfig reducedMotion="user">
        <UrlSync />
        <div className="flex h-screen gap-8 overflow-hidden bg-background-app p-8">
          <Sidebar />
          <div className="flex min-w-0 flex-1 overflow-hidden rounded-12 bg-surface-default">
            <main className="flex min-w-0 flex-1 flex-col">
              <TopBar />
              <PageArea />
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
  }, [page]);

  useEffect(() => {
    const fromUrl = pathname.slice(1);
    if (isPage(fromUrl) && fromUrl !== api.getState().page) api.getState().navigate(fromUrl, 'history');
  }, [pathname, api]);

  return null;
}
