'use client';

import dynamic from 'next/dynamic';
import type { Page } from '@/data/types';

// The app renders in the browser only. It's a prototype with no data to fetch, and the
// server can't know things the first frame depends on (prefers-reduced-motion, whether the
// first-load entrance should play), so server-rendering it only caused hydration mismatches.
const AppShell = dynamic(() => import('./AppShell').then((m) => m.AppShell), {
  ssr: false,
  loading: () => <div className="h-screen bg-background-app" />,
});

export function ClientShell({ initialPage }: { initialPage: Page }) {
  return <AppShell initialPage={initialPage} />;
}
