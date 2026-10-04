import { monday, tuesday } from './earlierDays';
import { KPIS, SERIES, TODAY_INDEX } from './kpis';
import { lastWeek } from './lastWeek';
import { LAST_WEEK_DAY_TITLES, LAST_WEEK_DAYS } from './lastWeekDays';
import { thisWeek } from './thisWeek';
import { today } from './today';
import type { Card, Kpi, LastWeekDay, PeriodKey, Snapshot } from './types';
import { wednesday } from './wednesday';

export const SNAPSHOTS: Record<PeriodKey, Snapshot> = { thisWeek, today, mon: monday, tue: tuesday, wed: wednesday, lastWeek, ...LAST_WEEK_DAYS };

export interface AnalyticsView {
  kpi: Kpi;
  range: 'thisWeek' | 'lastWeek';
  day: number | null; // null = the whole week (so far, this week)
}

export function periodOf(view: AnalyticsView): PeriodKey {
  if (view.range === 'lastWeek') return view.day === null ? 'lastWeek' : (`lw${view.day}` as LastWeekDay);
  // This week with no day picked is the week so far (user feedback 2026-10-04, as Sales).
  if (view.day === null) return 'thisWeek';
  if (view.day === TODAY_INDEX) return 'today';
  return (['mon', 'tue', 'wed'] as const)[view.day];
}

/** The card beside Urgent: the selected KPI's breakdown for the period on show. */
export function cardFor(view: AnalyticsView): Card {
  return SNAPSHOTS[periodOf(view)].cards[view.kpi];
}

const DAY_TITLES = ['Monday, 21 Sep', 'Tuesday, 22 Sep', 'Wednesday, 23 Sep', 'Today, Thursday, 24 Sep'];

export function chartTitle(view: AnalyticsView): string {
  const period = periodOf(view);
  if (period === 'lastWeek') return 'Last week · 14–20 Sep';
  if (view.range === 'lastWeek') return LAST_WEEK_DAY_TITLES[view.day as number];
  if (period === 'thisWeek') return `${KPIS[view.kpi].chartName} so far for this week`;
  return DAY_TITLES[view.day as number];
}

export function kpiLabel(kpi: Kpi, period: PeriodKey): string {
  return period === 'today' ? KPIS[kpi].todayLabel : KPIS[kpi].label;
}

/** Word used in product-row subtitles: "33% of today" / "29% of the day" / "18% of the week". */
export function shareWord(period: PeriodKey): string {
  if (period === 'today') return 'today';
  if (period === 'lastWeek' || period === 'thisWeek') return 'the week';
  return 'the day';
}

export { SERIES };
