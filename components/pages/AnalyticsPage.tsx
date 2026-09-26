'use client';

import { cardFor, periodOf, SNAPSHOTS } from '@/data/analytics';
import { SYNC } from '@/data/team';
import { useHop } from '@/lib/store';
import { KpiCard } from '@/components/analytics/KpiCard';
import { KpiTabs } from '@/components/analytics/KpiTabs';
import { TrendChart } from '@/components/analytics/TrendChart';
import { UrgentCard } from '@/components/analytics/UrgentCard';

// Analytics (brief B7.1, Figma "Analytics" + the KPI / Wednesday / Last week frames).
export function AnalyticsPage() {
  const view = useHop((s) => s.analytics);
  const period = periodOf(view);
  const card = cardFor(view);

  return (
    <div className="flex flex-col gap-24 px-28 py-24">
      <div className="flex flex-col gap-4">
        <h2 className="text-26 font-600 tracking-px-0-52 text-text-primary">Good afternoon, Amara</h2>
        <p className="text-14 leading-20 text-text-secondary">
          Below is your analytics. Hop last checked everything at {SYNC.checkedBefore}.
        </p>
      </div>

      <section aria-label="Key numbers" className="flex flex-col gap-4 rounded-12 border border-surface-border-tint p-6">
        <KpiTabs />
        <TrendChart />
      </section>

      {/* Equal heights: both cards sit in one grid row and stretch to the taller (brief B7.1). */}
      <div className="grid min-h-[246px] grid-cols-2 items-stretch gap-12">
        <KpiCard card={card} period={period} />
        <UrgentCard items={SNAPSHOTS[period].urgent} />
      </div>
    </div>
  );
}
