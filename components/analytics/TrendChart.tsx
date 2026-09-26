'use client';

import { chartTitle } from '@/data/analytics';
import { DAY_LABELS, KPIS, SERIES, TODAY_INDEX } from '@/data/kpis';
import { areaPath, CHART, linePath, xAt, yAt } from '@/lib/chart';
import { useHop } from '@/lib/store';
import { HopFrame } from '@/components/select/HopFrame';
import { WeekToggle } from './WeekToggle';

// The chart section of the Quick stats box (Figma "Revenue chart"): title + toggle, a 720×150
// SVG (custom, d3-shape curveMonotoneX — no chart library), and the day axis.
const TONE = {
  success: { line: 'stroke-status-success', area: 'fill-chart-fill', dotFill: 'fill-status-success', text: 'text-status-success-text' },
  danger: { line: 'stroke-status-danger-text', area: 'fill-status-danger-soft', dotFill: 'fill-status-danger-text', text: 'text-status-danger-text' },
} as const;

export function TrendChart() {
  const view = useHop((s) => s.analytics);
  const setDay = useHop((s) => s.setDay);
  const def = KPIS[view.kpi];
  const series = SERIES[view.kpi];
  const lastWeek = view.range === 'lastWeek';
  const values = lastWeek ? series.lastWeek : series.thisWeek;
  const active = lastWeek ? 6 : (view.day ?? TODAY_INDEX);
  const tone = TONE[def.tone];
  const title = chartTitle(view);

  return (
    <HopFrame id="analytics.chart" label={title} page="analytics" jumpTarget="sales" className="flex flex-col gap-12 pb-10 pl-14 pr-18 pt-14">
      <div className="flex items-center justify-between">
        <h3 className="text-13 font-500 text-text-primary">{title}</h3>
        <WeekToggle tone={def.tone} />
      </div>

      <svg id="kpi-chart" width={CHART.width} height={CHART.height} viewBox={`0 0 ${CHART.width} ${CHART.height}`} className="overflow-visible" role="img" aria-label={`${title} chart`}>
        {/* Baseline: solid up to today, dashed over the days still to come */}
        {lastWeek ? (
          <path d={`M0 ${CHART.baseline}H${xAt(6)}`} className="stroke-surface-border-tint" strokeWidth={1} />
        ) : (
          <>
            <path d={`M0 ${CHART.baseline}H${CHART.split}`} className="stroke-surface-border-tint" strokeWidth={1} />
            <path d={`M${CHART.split} ${CHART.baseline}H${CHART.width}`} className="stroke-surface-border-tint" strokeWidth={1} strokeDasharray="3 4" />
          </>
        )}
        <path d={areaPath(values, def.chartMax)} className={tone.area} />
        {!lastWeek && <path d={linePath(series.lastWeek, def.chartMax)} className="stroke-chart-compare" strokeWidth={1.5} fill="none" />}
        <path d={linePath(values, def.chartMax)} className={tone.line} strokeWidth={2} fill="none" />
        {!lastWeek && view.day !== null && (
          <path
            d={`M${xAt(active)} ${yAt(values[active], def.chartMax) + 8}V${CHART.baseline}`}
            className={tone.line}
            strokeWidth={1}
            strokeDasharray="2 3"
          />
        )}
        {values.map((v, i) =>
          i === active ? (
            <circle key={i} cx={xAt(i)} cy={yAt(v, def.chartMax)} r={5} className={`${tone.dotFill} stroke-surface-default`} strokeWidth={2} />
          ) : (
            <circle key={i} cx={xAt(i)} cy={yAt(v, def.chartMax)} r={4} className={`fill-surface-default ${tone.line}`} strokeWidth={1.5} />
          ),
        )}
      </svg>

      <div className="relative h-[15px] w-[720px]" role="group" aria-label="Days">
        {DAY_LABELS.map((d, i) => {
          const label = !lastWeek && i === TODAY_INDEX ? 'Today' : d;
          const isActive = i === active;
          const selectable = !lastWeek && i <= TODAY_INDEX;
          const cls = `absolute top-0 -translate-x-1/2 whitespace-nowrap text-11-5 ${
            isActive ? `${tone.text} ${lastWeek ? 'font-400' : 'font-500'}` : 'text-chart-future'
          } ${!lastWeek && i === TODAY_INDEX ? 'font-500' : ''}`;
          return selectable ? (
            <button
              key={d}
              type="button"
              className={`${cls} rounded-4`}
              style={{ left: xAt(i) }}
              aria-pressed={isActive}
              onClick={() => setDay(i)}
            >
              {label}
            </button>
          ) : (
            <span key={d} className={cls} style={{ left: xAt(i) }}>
              {label}
            </span>
          );
        })}
      </div>
    </HopFrame>
  );
}
