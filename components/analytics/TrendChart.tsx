'use client';

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { chartTitle } from '@/data/analytics';
import { DAY_LABELS, KPIS, SERIES, TODAY_INDEX } from '@/data/kpis';
import type { KpiDef } from '@/data/types';
import { areaPath, CHART, linePath, xAt, yAt } from '@/lib/chart';
import { changeLabel, formatNumber } from '@/lib/format';
import { duration, easeIn, easeOut, enter, leave, timing } from '@/lib/motion';
import { useTweenedArray } from '@/lib/useTween';
import { useHop } from '@/lib/store';
import { HopFrame } from '@/components/select/HopFrame';
import { INTRO, useIntro } from './intro';
import { WeekToggle } from './WeekToggle';

// The chart section of the Quick stats box (Figma "Revenue chart"; brief B7.1).
// Custom SVG + d3-shape — no chart library, so every motion is ours:
//   • KPI change: y-values and y-max tween together (data) and the path is rebuilt each frame
//   • DMs: line/area/dots tint green → red (base, CSS colour transition)
//   • week toggle: the partial line fades out (fast), the full week draws in (450ms)
//   • hover: snaps to the nearest past day; guide, grown dot, dark tooltip (80ms follow)
//   • day select: dot fills, dashed guide draws down (160ms)
const TONE = {
  success: { line: 'stroke-status-success', area: 'fill-chart-fill', dotFill: 'fill-status-success', text: 'text-status-success-text' },
  danger: { line: 'stroke-status-danger-text', area: 'fill-status-danger-soft', dotFill: 'fill-status-danger-text', text: 'text-status-danger-text' },
} as const;
const COLOR_TWEEN = 'transition-colors duration-(--dur-base) ease-hop-out';

type Draw = { duration: number; delay: number } | null;

export function TrendChart() {
  const view = useHop((s) => s.analytics);
  const setDay = useHop((s) => s.setDay);
  const intro = useIntro();
  const reduce = useReducedMotion();
  const [hover, setHover] = useState<number | null>(null);
  const dayButtons = useRef<(HTMLButtonElement | null)[]>([]);

  const def = KPIS[view.kpi];
  const lastWeek = view.range === 'lastWeek';
  const active = lastWeek ? 6 : (view.day ?? TODAY_INDEX);
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
    else if (prevRange.current !== view.range) draw = { duration: timing.weekLineDraw, delay: 0 };
  }
  useEffect(() => {
    mounted.current = true;
    prevRange.current = view.range;
  }, [view.range]);

  // Leave the hover state behind when the view changes under the cursor.
  useEffect(() => setHover((h) => (h !== null && h >= hoverable ? null : h)), [hoverable]);

  const onPointer = (e: React.PointerEvent<SVGRectElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    const i = Math.round((e.clientX - box.left - CHART.x0) / CHART.step);
    setHover(Math.max(0, Math.min(hoverable - 1, i)));
  };

  const values = lastWeek ? SERIES[view.kpi].lastWeek : SERIES[view.kpi].thisWeek;
  const selectable = lastWeek ? [] : Array.from({ length: TODAY_INDEX + 1 }, (_, i) => i);

  const onDayKey = (e: React.KeyboardEvent, i: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const next = Math.max(0, Math.min(TODAY_INDEX, i + (e.key === 'ArrowRight' ? 1 : -1)));
    dayButtons.current[next]?.focus();
  };

  return (
    <HopFrame id="analytics.chart" label={title} page="analytics" jumpTarget="sales" className="flex flex-col gap-12 pb-10 pl-14 pr-18 pt-14">
      <div className="flex items-center justify-between">
        <div className="grid">
          <AnimatePresence initial={false}>
            <motion.h3
              key={title}
              className="col-start-1 row-start-1 whitespace-nowrap text-13 font-500 text-text-primary"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0, transition: enter() }}
              exit={{ opacity: 0, transition: leave() }}
            >
              {title}
            </motion.h3>
          </AnimatePresence>
        </div>
        <WeekToggle tone={def.tone} />
      </div>

      <div className="relative" style={{ width: CHART.width, height: CHART.height }}>
        <svg
          id="kpi-chart"
          width={CHART.width}
          height={CHART.height}
          viewBox={`0 0 ${CHART.width} ${CHART.height}`}
          className="overflow-visible"
          role="img"
          aria-label={`${title}: ${values.map((v, i) => `${DAY_LABELS[i]} ${formatNumber(v, def.format)}`).join(', ')}`}
        >
          {/* No initial={false} here: it would also stop the layer's own draw-in. */}
          <AnimatePresence>
            <SeriesLayer
              key={view.range}
              def={def}
              lastWeek={lastWeek}
              active={active}
              selectedDay={lastWeek ? null : view.day}
              hover={hover}
              draw={draw}
              intro={intro && !reduce}
            />
          </AnimatePresence>

          {/* Hover guide: thin vertical line at the snapped day */}
          <AnimatePresence>
            {hover !== null && (
              <motion.path
                key="guide"
                d={`M${xAt(hover)} ${CHART.topY - 6}V${CHART.baseline}`}
                className="stroke-chart-compare pointer-events-none"
                strokeWidth={1}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: duration.fast, ease: easeOut } }}
                exit={{ opacity: 0, transition: { duration: duration.fast, ease: easeIn } }}
              />
            )}
          </AnimatePresence>

          {/* Pointer surface: snaps to the nearest past day; click selects it (this week) */}
          <rect
            x={0}
            y={0}
            width={CHART.width}
            height={CHART.height}
            fill="transparent"
            data-interactive
            onPointerMove={onPointer}
            onPointerLeave={() => setHover(null)}
            onClick={() => {
              if (!lastWeek && hover !== null) setDay(hover);
            }}
          />
        </svg>

        <Tooltip def={def} lastWeek={lastWeek} hover={hover} kpi={view.kpi} />
      </div>

      <div className="relative h-[15px]" style={{ width: CHART.width }} role="group" aria-label="Days">
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
              style={{ left: xAt(i) }}
              aria-pressed={isActive}
              aria-label={i === TODAY_INDEX ? 'Today' : `${d}, show that day`}
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
            <span key={d} className={cls} style={{ left: xAt(i) }}>
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
  def,
  lastWeek,
  active,
  selectedDay,
  hover,
  draw: drawProp,
  intro,
}: {
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

  // Values and max tween together; the comparison line follows the same max.
  const tw = useTweenedArray([...raw, def.chartMax]);
  const values = tw.slice(0, -1);
  const max = tw[tw.length - 1];
  const cmp = useTweenedArray(lastWeek ? [] : series.lastWeek);

  const drawIn = draw ? { pathLength: 0 } : false;
  const fadeIn = draw ? { opacity: 0 } : false;
  const drawT = draw ? { duration: draw.duration, delay: draw.delay, ease: easeOut } : undefined;
  const dotsStart = intro && draw ? INTRO.dots : draw ? draw.duration * 0.5 : 0;

  return (
    <motion.g exit={{ opacity: 0, transition: { duration: duration.fast, ease: easeIn } }}>
      {lastWeek ? (
        <path d={`M0 ${CHART.baseline}H${xAt(6)}`} className="stroke-surface-border-tint" strokeWidth={1} />
      ) : (
        <>
          <path d={`M0 ${CHART.baseline}H${CHART.split}`} className="stroke-surface-border-tint" strokeWidth={1} />
          <path d={`M${CHART.split} ${CHART.baseline}H${CHART.width}`} className="stroke-surface-border-tint" strokeWidth={1} strokeDasharray="3 4" />
        </>
      )}

      <motion.path d={areaPath(values, max)} className={`${tone.area} ${COLOR_TWEEN}`} initial={fadeIn} animate={{ opacity: 1 }} transition={drawT} />
      {!lastWeek && (
        <motion.path
          d={linePath(cmp, max)}
          className="stroke-chart-compare"
          strokeWidth={1.5}
          fill="none"
          initial={fadeIn}
          animate={{ opacity: 1 }}
          transition={drawT}
        />
      )}
      <motion.path
        d={linePath(values, max)}
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
          d={`M${xAt(selectedDay)} ${yAt(values[selectedDay], max) + 8}V${CHART.baseline}`}
          className={`${tone.line} ${COLOR_TWEEN}`}
          strokeWidth={1}
          strokeDasharray="2 3"
          style={{ transformBox: 'fill-box', transformOrigin: 'top' }}
          initial={reduce ? false : { scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: timing.guideDraw, ease: easeOut }}
        />
      )}

      {values.map((v, i) => {
        const isActive = i === active;
        const r = hover === i ? 5.5 : isActive ? 5 : 4;
        return (
          <motion.circle
            key={i}
            cx={xAt(i)}
            cy={yAt(v, max)}
            className={`${isActive ? `${tone.dotFill} stroke-surface-default` : `fill-surface-default ${tone.line}`} ${COLOR_TWEEN}`}
            strokeWidth={isActive ? 2 : 1.5}
            style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
            initial={draw ? { scale: 0, r } : false}
            animate={{ scale: 1, r }}
            transition={{
              scale: { duration: duration.fast, ease: easeOut, delay: dotsStart + i * timing.dotStagger },
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
function Tooltip({ def, lastWeek, hover, kpi }: { def: KpiDef; lastWeek: boolean; hover: number | null; kpi: KpiDef['id'] }) {
  const series = SERIES[kpi];
  const values = lastWeek ? series.lastWeek : series.thisWeek;
  const v = hover !== null ? values[hover] : null;
  const x = hover !== null ? xAt(hover) : 0;
  const y = v !== null ? yAt(v, def.chartMax) : 0;

  return (
    <AnimatePresence>
      {hover !== null && v !== null && (
        <motion.div
          key="tooltip"
          role="status"
          className="pointer-events-none absolute left-0 top-0 flex -translate-x-1/2 -translate-y-full flex-col gap-2 whitespace-nowrap rounded-8 bg-action-primary px-8 py-6"
          initial={{ opacity: 0, left: x, top: y - 12 }}
          animate={{ opacity: 1, left: x, top: y - 12 }}
          exit={{ opacity: 0, transition: { duration: duration.fast, ease: easeIn } }}
          transition={{ opacity: { duration: duration.fast, ease: easeOut }, left: { duration: timing.tooltipFollow }, top: { duration: timing.tooltipFollow } }}
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
