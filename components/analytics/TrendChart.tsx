'use client';

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { chartTitle } from '@/data/analytics';
import { DAY_LABELS, KPIS, SERIES, TODAY_INDEX } from '@/data/kpis';
import type { KpiDef } from '@/data/types';
import { CHART, chartGeometry, yAt, type ChartGeometry } from '@/lib/chart';
import { changeLabel, formatNumber } from '@/lib/format';
import { viaKeyboard } from '@/lib/input';
import { duration, easeExit, easeOut, timing } from '@/lib/motion';
import { useElementWidth } from '@/lib/useElementWidth';
import { useTweenedArray } from '@/lib/useTween';
import { useHop } from '@/lib/store';
import { HopFrame } from '@/components/select/HopFrame';
import { INTRO, useIntro } from './intro';
import { WeekToggle } from './WeekToggle';

// The chart section of the Quick stats box (Figma "Revenue chart"; brief B7.1).
// Custom SVG + d3-shape — no chart library, so every motion is ours:
//   • KPI change: each day's height (value ÷ chart max) tweens (data, ease-in-out) and the path
//     is rebuilt each frame. Tweening the raw values and the max separately made the line sit
//     still and then snap at the end when the scales were far apart (revenue → orders).
//   • the plot fills its box and re-lays itself out while the box resizes (sidebars collapsing)
//   • DMs: line/area/dots tint green → red (base, CSS colour transition)
//   • week toggle: the partial line fades out (fast), the full week draws in (280ms)
//   • hover: snaps to the nearest past day; guide, grown dot, dark tooltip (80ms follow)
//   • day select: dot fills, dashed guide fades in (160ms)
//   • the title changes at once; anything a key changed lands at once (Emil Kowalski)
const TONE = {
  success: { line: 'stroke-status-success', area: 'fill-chart-fill', dotFill: 'fill-status-success', text: 'text-status-success-text' },
  danger: { line: 'stroke-status-danger-text', area: 'fill-status-danger-soft', dotFill: 'fill-status-danger-text', text: 'text-status-danger-text' },
} as const;
const COLOR_TWEEN = 'transition-colors duration-(--dur-base) ease-hop-color';

type Draw = { duration: number; delay: number } | null;

export function TrendChart() {
  const view = useHop((s) => s.analytics);
  const setDay = useHop((s) => s.setDay);
  const intro = useIntro();
  const reduce = useReducedMotion();
  const [hover, setHover] = useState<number | null>(null);
  const dayButtons = useRef<(HTMLButtonElement | null)[]>([]);
  const [box, width] = useElementWidth<HTMLDivElement>(CHART.width);
  const g = useMemo(() => chartGeometry(width), [width]);

  const def = KPIS[view.kpi];
  const lastWeek = view.range === 'lastWeek';
  const active = view.day ?? (lastWeek ? 6 : TODAY_INDEX);
  const hoverable = lastWeek ? 7 : TODAY_INDEX + 1; // future days aren't hoverable
  const title = chartTitle(view);
  const tone = TONE[def.tone];

  // A series layer draws in when it first appears: 600ms on the first-load entrance,
  // 450ms when the week toggle swaps it, never on an ordinary revisit.
  const mounted = useRef(false);
  const prevRange = useRef(view.range);
  let draw: Draw = null;
  if (!reduce) {
    if (!mounted.current && intro) draw = { duration: timing.lineDraw, delay: INTRO.line };
    else if (prevRange.current !== view.range && !viaKeyboard()) draw = { duration: timing.weekLineDraw, delay: 0 };
  }
  useEffect(() => {
    mounted.current = true;
    prevRange.current = view.range;
  }, [view.range]);

  // Leave the hover state behind when the view changes under the cursor.
  useEffect(() => setHover((h) => (h !== null && h >= hoverable ? null : h)), [hoverable]);

  const onPointer = (e: React.PointerEvent<SVGRectElement>) => {
    const i = g.dayAt(e.clientX - e.currentTarget.getBoundingClientRect().left);
    setHover(Math.max(0, Math.min(hoverable - 1, i)));
  };

  const values = lastWeek ? SERIES[view.kpi].lastWeek : SERIES[view.kpi].thisWeek;
  // Last week, every day can be picked (user feedback 2026-10-01); this week, today and before.
  const selectable = Array.from({ length: hoverable }, (_, i) => i);

  const onDayKey = (e: React.KeyboardEvent, i: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const next = Math.max(0, Math.min(hoverable - 1, i + (e.key === 'ArrowRight' ? 1 : -1)));
    dayButtons.current[next]?.focus();
  };

  return (
    <HopFrame id="analytics.chart" label={title} page="analytics" jumpTarget="sales" radius={10} className="flex flex-col gap-12 pb-10 pl-14 pr-20 pt-14">
      <div className="flex items-center justify-between">
        {/* Changes at once: it follows every KPI, day and week switch (Emil Kowalski: frequent
            changes don't animate), like the card title below. */}
        <h3 className="whitespace-nowrap text-13 font-500 text-text-primary">{title}</h3>
        <WeekToggle tone={def.tone} />
      </div>

      <div ref={box} className="relative w-full" style={{ height: CHART.height }}>
        <svg
          id="kpi-chart"
          width={width}
          height={CHART.height}
          viewBox={`0 0 ${width} ${CHART.height}`}
          className="overflow-visible"
          role="img"
          aria-label={`${title}: ${values.map((v, i) => `${DAY_LABELS[i]} ${formatNumber(v, def.format)}`).join(', ')}`}
        >
          {/* No initial={false} here: it would also stop the layer's own draw-in. */}
          <AnimatePresence>
            <SeriesLayer
              key={view.range}
              g={g}
              def={def}
              lastWeek={lastWeek}
              active={active}
              selectedDay={view.day}
              hover={hover}
              draw={draw}
              intro={intro && !reduce}
            />
          </AnimatePresence>

          {/* Hover guide: thin vertical line at the snapped day; glides with the tooltip */}
          <AnimatePresence>
            {hover !== null && (
              <motion.line
                key="guide"
                y1={CHART.topY - 6}
                y2={CHART.baseline}
                className="stroke-chart-compare pointer-events-none"
                strokeWidth={1}
                initial={{ opacity: 0, x1: g.xAt(hover), x2: g.xAt(hover) }}
                animate={{ opacity: 1, x1: g.xAt(hover), x2: g.xAt(hover) }}
                exit={{ opacity: 0, transition: { duration: duration.fast, ease: easeExit } }}
                transition={{ opacity: { duration: duration.fast, ease: easeOut }, default: { duration: timing.tooltipFollow, ease: easeOut } }}
              />
            )}
          </AnimatePresence>

          {/* Pointer surface: snaps to the nearest past day; click selects it (this week) */}
          <rect
            x={0}
            y={0}
            width={width}
            height={CHART.height}
            fill="transparent"
            data-interactive
            onPointerMove={onPointer}
            onPointerLeave={() => setHover(null)}
            onClick={() => {
              if (hover !== null) setDay(hover);
            }}
          />
        </svg>

        <Tooltip g={g} def={def} lastWeek={lastWeek} hover={hover} kpi={view.kpi} />
      </div>

      <div className="relative h-[15px] w-full" role="group" aria-label="Days">
        {DAY_LABELS.map((d, i) => {
          const label = !lastWeek && i === TODAY_INDEX ? 'Today' : d;
          const isActive = i === active;
          const cls = `absolute top-0 -translate-x-1/2 whitespace-nowrap text-11-5 ${COLOR_TWEEN} ${
            isActive ? `${tone.text} ${lastWeek ? 'font-400' : 'font-500'}` : 'text-chart-future'
          } ${!lastWeek && i === TODAY_INDEX ? 'font-500' : ''}`;
          return selectable.includes(i) ? (
            <button
              key={d}
              ref={(el) => {
                dayButtons.current[i] = el;
              }}
              type="button"
              className={`${cls} rounded-4`}
              style={{ left: g.xAt(i) }}
              aria-pressed={isActive}
              aria-label={!lastWeek && i === TODAY_INDEX ? 'Today' : `${d}, show that day`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setDay(i)}
              onKeyDown={(e) => onDayKey(e, i)}
              // Keyboard focus previews the day like hover; a mouse click just selects it.
              onFocus={(e) => e.currentTarget.matches(':focus-visible') && setHover(i)}
              onBlur={() => setHover(null)}
            >
              {label}
            </button>
          ) : (
            <span key={d} className={cls} style={{ left: g.xAt(i) }}>
              {label}
            </span>
          );
        })}
      </div>
    </HopFrame>
  );
}

/** One week's drawing. Keyed by range, so the week toggle swaps whole layers. */
function SeriesLayer({
  g,
  def,
  lastWeek,
  active,
  selectedDay,
  hover,
  draw: drawProp,
  intro,
}: {
  g: ChartGeometry;
  def: KpiDef;
  lastWeek: boolean;
  active: number;
  selectedDay: number | null;
  hover: number | null;
  draw: Draw;
  intro: boolean;
}) {
  const reduce = useReducedMotion();
  const [draw] = useState(drawProp); // only the value it was created with matters
  const tone = TONE[def.tone];
  const series = SERIES[def.id];
  const raw = lastWeek ? series.lastWeek : series.thisWeek;

  // Heights (value ÷ chart max) tween together, the comparison line with them. The layer is
  // keyed by week, so the array's length never changes under a running tween.
  const share = (v: number) => v / def.chartMax;
  const tw = useTweenedArray([...raw.map(share), ...(lastWeek ? [] : series.lastWeek.map(share))]);
  const values = tw.slice(0, raw.length);
  const cmp = tw.slice(raw.length);
  const split = g.xAt(TODAY_INDEX);

  const drawIn = draw ? { pathLength: 0 } : false;
  const fadeIn = draw ? { opacity: 0 } : false;
  const drawT = draw ? { duration: draw.duration, delay: draw.delay, ease: easeOut } : undefined;
  const dotsStart = intro && draw ? INTRO.dots : draw ? draw.duration * 0.5 : 0;

  return (
    <motion.g exit={{ opacity: 0, transition: { duration: duration.fast, ease: easeExit } }}>
      {lastWeek ? (
        <path d={`M0 ${CHART.baseline}H${g.xAt(6)}`} className="stroke-surface-border-tint" strokeWidth={1} />
      ) : (
        <>
          <path d={`M0 ${CHART.baseline}H${split}`} className="stroke-surface-border-tint" strokeWidth={1} />
          <path d={`M${split} ${CHART.baseline}H${g.width}`} className="stroke-surface-border-tint" strokeWidth={1} strokeDasharray="3 4" />
        </>
      )}

      <motion.path d={g.areaPath(values)} className={`${tone.area} ${COLOR_TWEEN}`} initial={fadeIn} animate={{ opacity: 1 }} transition={drawT} />
      {!lastWeek && (
        <motion.path
          d={g.linePath(cmp)}
          className="stroke-chart-compare"
          strokeWidth={1.5}
          fill="none"
          initial={fadeIn}
          animate={{ opacity: 1 }}
          transition={drawT}
        />
      )}
      <motion.path
        d={g.linePath(values)}
        className={`${tone.line} ${COLOR_TWEEN}`}
        strokeWidth={2}
        fill="none"
        initial={drawIn}
        animate={{ pathLength: 1 }}
        transition={drawT}
      />

      {selectedDay !== null && (
        <motion.path
          key={`day-${selectedDay}`}
          d={`M${g.xAt(selectedDay)} ${yAt(values[selectedDay]) + 8}V${CHART.baseline}`}
          className={`${tone.line} ${COLOR_TWEEN}`}
          strokeWidth={1}
          strokeDasharray="2 3"
          initial={reduce || viaKeyboard() ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: timing.guideDraw, ease: easeOut }}
        />
      )}

      {values.map((v, i) => {
        const isActive = i === active;
        const r = hover === i ? 5.5 : isActive ? 5 : 4;
        return (
          <motion.circle
            key={i}
            cx={g.xAt(i)}
            cy={yAt(v)}
            className={`${isActive ? `${tone.dotFill} stroke-surface-default` : `fill-surface-default ${tone.line}`} ${COLOR_TWEEN}`}
            strokeWidth={isActive ? 2 : 1.5}
            style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
            // First load: each dot fades in growing 0.9 → 1 as the line reaches it (never from 0).
            // SVG: Motion's scale prop (a transform string becomes a broken SVG attribute).
            initial={draw ? { scale: 0.9, opacity: 0, r } : false}
            animate={{ scale: 1, opacity: 1, r }}
            transition={{
              scale: { duration: duration.fast, ease: easeOut, delay: dotsStart + i * timing.dotStagger },
              opacity: { duration: duration.fast, ease: easeOut, delay: dotsStart + i * timing.dotStagger },
              r: { duration: duration.fast, ease: easeOut },
            }}
          />
        );
      })}
    </motion.g>
  );
}

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** Dark tooltip: value + change vs the same day last week. Follows the snapped day over 80ms. */
function Tooltip({ g, def, lastWeek, hover, kpi }: { g: ChartGeometry; def: KpiDef; lastWeek: boolean; hover: number | null; kpi: KpiDef['id'] }) {
  const series = SERIES[kpi];
  const values = lastWeek ? series.lastWeek : series.thisWeek;
  const v = hover !== null ? values[hover] : null;
  const x = hover !== null ? g.xAt(hover) : 0;
  const y = v !== null ? yAt(v / def.chartMax) : 0;

  return (
    <AnimatePresence>
      {hover !== null && v !== null && (
        <motion.div
          key="tooltip"
          role="status"
          className="pointer-events-none absolute left-0 top-0 flex -translate-x-1/2 -translate-y-full flex-col gap-2 whitespace-nowrap rounded-8 bg-action-primary px-8 py-6"
          // Positioned by transform, not left/top, so following the pointer never lays out.
          initial={{ opacity: 0, transform: `translate(${x}px, ${y - 12}px)` }}
          animate={{ opacity: 1, transform: `translate(${x}px, ${y - 12}px)` }}
          exit={{ opacity: 0, transition: { duration: duration.fast, ease: easeExit } }}
          transition={{ opacity: { duration: duration.fast, ease: easeOut }, transform: { duration: timing.tooltipFollow, ease: easeOut } }}
        >
          <span className="text-12 font-600 text-text-on-dark tabular-nums">{formatNumber(v, def.format)}</span>
          <span className="text-11 text-chip-off-text tabular-nums">
            {lastWeek
              ? `Last week · ${DAY_NAMES[hover]}`
              : `${changeLabel(v, series.lastWeek[hover])} vs last ${DAY_NAMES[hover]}`}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
