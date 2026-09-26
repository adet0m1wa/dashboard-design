'use client';

import { motion } from 'motion/react';
import { useRef } from 'react';
import { kpiLabel, periodOf, SNAPSHOTS } from '@/data/analytics';
import { KPI_ORDER, KPIS } from '@/data/kpis';
import type { Kpi } from '@/data/types';
import { formatNumber } from '@/lib/format';
import { layoutSpring } from '@/lib/motion';
import { useHop } from '@/lib/store';
import { HopFrame } from '@/components/select/HopFrame';

// The five KPI tabs (brief B7.1, B5): role="tablist", ←/→ move between tabs, the soft
// selected pill slides to the new tab (shared layoutId + layoutSpring).
export function KpiTabs() {
  const kpi = useHop((s) => s.analytics.kpi);
  const range = useHop((s) => s.analytics.range);
  const day = useHop((s) => s.analytics.day);
  const setKpi = useHop((s) => s.setKpi);
  const period = periodOf({ kpi, range, day });
  const snapshot = SNAPSHOTS[period];
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const next = (index + (e.key === 'ArrowRight' ? 1 : -1) + KPI_ORDER.length) % KPI_ORDER.length;
    setKpi(KPI_ORDER[next]);
    tabs.current[next]?.focus();
  };

  return (
    <div role="tablist" aria-label="Key numbers" className="flex items-start gap-4">
      {KPI_ORDER.map((id: Kpi, index) => {
        const selected = id === kpi;
        const reading = snapshot.kpis[id];
        const label = kpiLabel(id, period);
        return (
          <HopFrame key={id} id={`analytics.kpi.${id}`} label={KPIS[id].todayLabel} page="analytics" jumpTarget={KPIS[id].jumpTarget} className="min-w-0 flex-1">
            <button
              ref={(el) => {
                tabs.current[index] = el;
              }}
              type="button"
              role="tab"
              id={`kpi-tab-${id}`}
              aria-selected={selected}
              aria-controls="kpi-chart"
              tabIndex={selected ? 0 : -1}
              onClick={() => setKpi(id)}
              onKeyDown={(e) => onKeyDown(e, index)}
              className="relative flex w-full flex-col items-start gap-4 rounded-8 px-12 py-10 text-left"
            >
              {selected && (
                <motion.span layoutId="kpi-pill" transition={layoutSpring} className="absolute inset-0 rounded-8 bg-surface-subtle" />
              )}
              <span className="relative whitespace-nowrap text-12 text-text-secondary">{label}</span>
              <span className="relative flex items-baseline gap-6 whitespace-nowrap">
                <span className="text-20 font-600 tracking-px-0-2 text-text-primary tabular-nums">
                  {formatNumber(reading.value, KPIS[id].format)}
                </span>
                <span
                  className={`text-12 font-500 tabular-nums ${reading.noteTone === 'danger' ? 'text-status-danger-text' : 'text-status-success-text'}`}
                >
                  {reading.note}
                </span>
              </span>
            </button>
          </HopFrame>
        );
      })}
    </div>
  );
}
