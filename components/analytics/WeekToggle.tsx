'use client';

import { useHop } from '@/lib/store';
import { ModeToggle } from '@/components/ui/ModeToggle';

// This week / Last week on the Analytics chart (Figma "Mode toggle").
const OPTIONS = [
  { id: 'thisWeek', label: 'This week' },
  { id: 'lastWeek', label: 'Last week' },
] as const;

export function WeekToggle({ tone }: { tone: 'success' | 'danger' }) {
  const range = useHop((s) => s.analytics.range);
  const setRange = useHop((s) => s.setRange);
  return <ModeToggle label="Compare" options={OPTIONS} value={range} onChange={setRange} thumbId="week-thumb" tone={tone} />;
}
