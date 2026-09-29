'use client';

import { PAGE_TITLES } from '@/data/nav';
import type { Page } from '@/data/types';
import { useHop } from '@/lib/store';
import { PageIcon } from './PageIcon';
import { AnalyticsTopActions } from '@/components/analytics/AnalyticsTopActions';
import { InventoryTopActions } from '@/components/pages/InventoryTopActions';

// The page top bar: 56px, lines up with the Hop panel header. It shows the page on screen
// (`shownPage`), which PageStage swaps while the workspace is blank — so it changes at once,
// with no crossfade of its own.
export function TopBar() {
  const page = useHop((s) => s.shownPage);

  return (
    <header className="flex h-bar shrink-0 items-center justify-between border-b border-surface-faint px-20">
      <h1 className="flex items-center gap-8 text-13 font-600 text-text-primary">
        <PageIcon page={page} className="text-text-primary" />
        {PAGE_TITLES[page]}
      </h1>
      <TopActions page={page} />
    </header>
  );
}

function TopActions({ page }: { page: Page }) {
  if (page === 'analytics') return <AnalyticsTopActions />;
  if (page === 'inventory') return <InventoryTopActions />;
  return null;
}
