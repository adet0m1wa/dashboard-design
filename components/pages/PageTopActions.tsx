'use client';

import { IG_HANDLE } from '@/data/instagram';
import { THREADS } from '@/data/customers';
import { SALES_PERIODS } from '@/data/sales';
import { useHop } from '@/lib/store';
import { Chev13Icon, DownloadIcon, FunnelIcon, SearchIcon } from '@/components/icons/figma';
import { MenuButton } from '@/components/ui/MenuButton';
import { OutlineButton } from '@/components/ui/OutlineButton';

// Top-bar pieces for Sales, Instagram and Customers (designed 2026-10-01). Sales's period menu
// works (round 7); Instagram's period, export and filter are stubs, like Inventory's (brief B7.4);
// the customer search filters the inbox.

function Period() {
  const showToast = useHop((s) => s.showToast);
  return (
    <OutlineButton onClick={() => showToast('Other periods are coming soon')}>
      Last 7 days
      <Chev13Icon className="text-text-secondary" />
    </OutlineButton>
  );
}

/** Sales: Weekly / Monthly / All time (user feedback 2026-10-01: "where they go to see more"). */
export function SalesTopActions() {
  const showToast = useHop((s) => s.showToast);
  const period = useHop((s) => s.pages.salesPeriod);
  const setPages = useHop((s) => s.setPages);
  return (
    <div className="flex items-center gap-8">
      <MenuButton label="Period" options={SALES_PERIODS} value={period} onChange={(salesPeriod) => setPages({ salesPeriod, salesDay: null })} />
      <OutlineButton onClick={() => showToast('Export is coming soon')}>
        <DownloadIcon className="text-text-secondary" />
        Export
      </OutlineButton>
    </div>
  );
}

export const InstagramTopActions = Period;

/** Beside the title: the account handle (Instagram) or how many customers there are. */
export function TitleNote({ text }: { text: string }) {
  return <span className="rounded-10 bg-surface-subtle px-8 py-1 text-11-5 font-500 text-text-secondary">{text}</span>;
}
export const INSTAGRAM_TITLE_NOTE = IG_HANDLE;
export const CUSTOMERS_TITLE_NOTE = '248';

export function CustomersTopActions() {
  const query = useHop((s) => s.pages.inboxQuery);
  const setPages = useHop((s) => s.setPages);
  const showToast = useHop((s) => s.showToast);
  return (
    <div className="flex items-center gap-8">
      <label className="flex w-[200px] items-center gap-8 rounded-8 border border-surface-border-tint bg-surface-default px-10 py-6 transition-colors duration-(--dur-fast) ease-hop-color has-[input:focus]:border-selection">
        <SearchIcon className="shrink-0 text-text-muted" />
        <input
          type="search"
          value={query}
          onChange={(e) => setPages({ inboxQuery: e.target.value })}
          placeholder="Search customers"
          aria-label={`Search ${THREADS.length} conversations`}
          className="min-w-0 flex-1 bg-transparent text-12-5 text-text-primary outline-none placeholder:text-text-muted"
        />
      </label>
      <OutlineButton onClick={() => showToast('Filters are coming soon')}>
        <FunnelIcon className="text-text-secondary" />
        Filter
      </OutlineButton>
    </div>
  );
}
