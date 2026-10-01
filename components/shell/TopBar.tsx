'use client';

import { PAGE_TITLES } from '@/data/nav';
import type { Page } from '@/data/types';
import { useHop } from '@/lib/store';
import { PageIcon } from './PageIcon';
import { AnalyticsTopActions } from '@/components/analytics/AnalyticsTopActions';
import { InventoryTopActions } from '@/components/pages/InventoryTopActions';
import {
  CUSTOMERS_TITLE_NOTE,
  CustomersTopActions,
  INSTAGRAM_TITLE_NOTE,
  InstagramTopActions,
  SalesTopActions,
  TitleNote,
} from '@/components/pages/PageTopActions';

// The page top bar: 56px, lines up with the Hop panel header. Pages switch instantly (user
// feedback 2026-09-29), so it just shows the current page. Analytics has no icon beside its
// title (feedback: the Hop-head logo there is removed); the other pages keep theirs.
export function TopBar() {
  const page = useHop((s) => s.page);

  return (
    <header className="flex h-bar shrink-0 items-center justify-between border-b border-surface-faint px-20">
      <h1 className="flex items-center gap-8 text-13 font-600 text-text-primary">
        {page !== 'analytics' && <PageIcon page={page} className="text-text-primary" />}
        {PAGE_TITLES[page]}
        {page === 'instagram' && <TitleNote text={INSTAGRAM_TITLE_NOTE} />}
        {page === 'customers' && <TitleNote text={CUSTOMERS_TITLE_NOTE} />}
      </h1>
      <TopActions page={page} />
    </header>
  );
}

function TopActions({ page }: { page: Page }) {
  if (page === 'analytics') return <AnalyticsTopActions />;
  if (page === 'inventory') return <InventoryTopActions />;
  if (page === 'sales') return <SalesTopActions />;
  if (page === 'instagram') return <InstagramTopActions />;
  if (page === 'customers') return <CustomersTopActions />;
  return null;
}
