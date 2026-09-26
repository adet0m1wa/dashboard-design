'use client';

import { SYNC } from '@/data/team';

// Analytics page body. Phase 1: greeting only (shell check). KPI tabs, chart and cards: phase 2.
export function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-24 px-28 py-24">
      <div className="flex flex-col gap-4">
        <h2 className="text-26 font-600 tracking-px-0-52 text-text-primary">Good afternoon, Amara</h2>
        <p className="text-14 leading-20 text-text-secondary">
          Below is your analytics. Hop last checked everything at {SYNC.checkedBefore}.
        </p>
      </div>
    </div>
  );
}
