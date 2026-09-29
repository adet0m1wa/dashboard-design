'use client';

import { useRef } from 'react';
import type { Page } from '@/data/types';
import { useHop } from '@/lib/store';
import { AnalyticsPage } from '@/components/pages/AnalyticsPage';
import { InventoryPage } from '@/components/pages/InventoryPage';
import { HistoryPage } from '@/components/history/HistoryPage';
import { useSelection } from '@/components/select/useSelection';
import { PlaceholderPage } from '@/components/pages/PlaceholderPage';

// Only the page area's content changes between pages; the sidebar stays put. It shows
// `shownPage`, which PageStage switches in the middle of its wipe transition.
export function PageArea() {
  const page = useHop((s) => s.shownPage);
  const area = useRef<HTMLDivElement>(null);
  useSelection(area);

  return (
    <div ref={area} className="relative min-h-0 flex-1">
      <div key={page} className="absolute inset-0 overflow-y-auto" data-page={page}>
        <PageContent page={page} />
      </div>
    </div>
  );
}

export function PageContent({ page }: { page: Page }) {
  switch (page) {
    case 'analytics':
      return <AnalyticsPage />;
    case 'inventory':
      return <InventoryPage />;
    case 'history':
      return <HistoryPage />;
    default:
      return <PlaceholderPage page={page} />;
  }
}
