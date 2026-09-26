import type { Page } from '@/data/types';
import { PageIcon } from '@/components/shell/PageIcon';

// Sales, Instagram and Customers aren't designed yet (brief B7.7): a real top bar (from the
// shell), this empty state, and the Hop panel. Navigation, jump chips and History links still work.
export function PlaceholderPage({ page }: { page: Page }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-12 px-28 py-24">
      <span className="flex size-[36px] items-center justify-center rounded-8 bg-surface-subtle">
        <PageIcon page={page} className="text-text-secondary" />
      </span>
      <p className="text-14 text-text-secondary">This page is being designed</p>
    </div>
  );
}
