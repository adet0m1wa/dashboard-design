'use client';

import { motion } from 'motion/react';
import { layoutSpring } from '@/lib/motion';
import { useHop } from '@/lib/store';

// This week / Last week (Figma "Mode toggle"). The white thumb slides between options
// (layoutId + layoutSpring); the legend dots swap colour (brief B7.1).
const OPTIONS = [
  { id: 'thisWeek', label: 'This week' },
  { id: 'lastWeek', label: 'Last week' },
] as const;

export function WeekToggle({ tone }: { tone: 'success' | 'danger' }) {
  const range = useHop((s) => s.analytics.range);
  const setRange = useHop((s) => s.setRange);
  const onDot = tone === 'danger' ? 'bg-status-danger-text' : 'bg-status-success';

  return (
    <div role="radiogroup" aria-label="Compare" className="flex items-center gap-6 rounded-9 bg-surface-subtle p-6">
      {OPTIONS.map((o) => {
        const on = o.id === range;
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => setRange(o.id)}
            className={`relative flex items-center gap-6 rounded-6 p-8 text-12 text-text-secondary ${on ? 'font-500' : 'font-400'}`}
          >
            {on && (
              <motion.span layoutId="week-thumb" transition={layoutSpring} className="absolute inset-0 rounded-6 bg-surface-default shadow-toggle-thumb" />
            )}
            <span
              aria-hidden="true"
              className={`relative size-[8px] rounded-full transition-colors duration-(--dur-base) ease-hop-out ${on ? onDot : 'bg-legend-off'}`}
            />
            <span className="relative whitespace-nowrap">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}
