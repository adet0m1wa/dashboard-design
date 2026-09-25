import { monday, tuesday } from './earlierDays';
import { KPIS, SERIES, TODAY_INDEX } from './kpis';
import { lastWeek } from './lastWeek';
import { today } from './today';
import type { Card, Kpi, PeriodKey, Snapshot } from './types';
import { wednesday } from './wednesday';

export const SNAPSHOTS: Record<PeriodKey, Snapshot> = { today, mon: monday, tue: tuesday, wed: wednesday, lastWeek };

export interface AnalyticsView {
  kpi: Kpi;
  range: 'thisWeek' | 'lastWeek';
  day: number | null; // null = today
}

export function periodOf(view: AnalyticsView): PeriodKey {
  if (view.range === 'lastWeek') return 'lastWeek';
  if (view.day === null || view.day === TODAY_INDEX) return 'today';
  return (['mon', 'tue', 'wed'] as const)[view.day];
}

/** The card beside Urgent. Past periods only have a revenue breakdown in the data. */
export function cardFor(view: AnalyticsView): Card {
  const snap = SNAPSHOTS[periodOf(view)];
  return snap.cards[view.kpi] ?? snap.cards.revenue;
}

const DAY_TITLES = ['Monday, 21 Sep', 'Tuesday, 22 Sep', 'Wednesday, 23 Sep'];

export function chartTitle(view: AnalyticsView): string {
  const period = periodOf(view);
  if (period === 'lastWeek') return 'Last week · 14–20 Sep';
  if (period === 'today') return `${KPIS[view.kpi].chartName} over the last 7 days`;
  return DAY_TITLES[view.day as number];
}

export function kpiLabel(kpi: Kpi, period: PeriodKey): string {
  return period === 'today' ? KPIS[kpi].todayLabel : KPIS[kpi].label;
}

/** Word used in product-row subtitles: "33% of today" / "29% of the day" / "18% of the week". */
export function shareWord(period: PeriodKey): string {
  if (period === 'today') return 'today';
  if (period === 'lastWeek') return 'the week';
  return 'the day';
}

export { SERIES };
