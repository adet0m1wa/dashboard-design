'use client';

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { CUSTOMERS, itemLabel, type Order } from '@/data/orders';
import { dayOrders, dayTiles, dayTitle, FULFILMENT_TONE, placedLabel, RANGES, SALES_CHART, SALES_FILTERS, SALES_ORDERS, SALES_TILES, type SalesChart, type SalesFilter, type SalesRange } from '@/data/sales';
import { CHART, chartGeometry, yAt, type ChartGeometry } from '@/lib/chart';
import { viaKeyboard } from '@/lib/input';
import { duration, easeExit, easeOut, timing } from '@/lib/motion';
import { money } from '@/lib/format';
import { salesRange, useHop, useHopApi } from '@/lib/store';
import { useElementWidth } from '@/lib/useElementWidth';
import { HopFrame } from '@/components/select/HopFrame';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { ModeToggle } from '@/components/ui/ModeToggle';
import { InitialsAvatar } from '@/components/ui/PersonAvatar';
import { Segmented } from '@/components/ui/Segmented';
import { Tag } from '@/components/ui/Tag';
import { Thumb } from '@/components/ui/Thumb';
import { Truncate } from '@/components/ui/Truncate';

// Sales (designed 2026-10-01 after the older "07 · Sales" Figma reference, in today's styling):
// the period at a glance, revenue by day, and its orders — filterable, with what's still to pack
// up front. Round 7 (user feedback 2026-10-01): any period — this or last week (the chart's
// toggle, as on Analytics), this or last month, all time (the top bar's menu); the page fills the
// window and the orders card keeps one size whatever the period or filter, scrolling inside.
// Nothing animates but the toggle's thumb: it's a page for reading and checking. Round 8 (user
// feedback 2026-10-02): a day can be picked on the chart, as on Analytics.
export function SalesPage() {
  const range = useHop((s) => salesRange(s.pages));
  const day = useHop((s) => s.pages.salesDay);
  const setPages = useHop((s) => s.setPages);
  const api = useHopApi();
  const scope = day === null ? range : `day${day}`;
  const scopeLabel = day === null ? RANGES[range].label : dayTitle(day);

  // Esc goes back from a picked day to the whole period, as on Analytics.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !e.defaultPrevented && api.getState().pages.salesDay !== null) setPages({ salesDay: null });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [api, setPages]);

  return (
    <div className="flex h-full min-h-[680px] flex-col gap-16 px-24 py-20">
      <div className="flex gap-12">
        {(day === null ? SALES_TILES[range] : dayTiles(day)).map((t) => (
          <HopFrame
            key={t.id}
            id={`sales.tile.${t.id}.${scope}`}
            label={`${t.label} · ${scopeLabel}`}
            page="sales"
            radius={10}
            className="flex min-w-0 flex-1 flex-col gap-2 rounded-10 border border-surface-border-tint px-14 py-10"
          >
            <span className="text-12 text-text-secondary">{t.label}</span>
            <span className="flex items-baseline gap-6 whitespace-nowrap">
              {/* Counts to its new value when the period or day changes, like Analytics' KPIs. */}
              <span className="text-20 font-600 tracking-px-0-2 text-text-primary tabular-nums">
                <AnimatedNumber value={t.raw} format={t.unit === 'currency' ? 'currency' : 'int'} />
                {t.unit === 'percent' && '%'}
              </span>
              <span className={`text-12 font-500 ${t.tone === 'success' ? 'text-status-success-text' : t.tone === 'danger' ? 'text-status-danger-text' : 'text-text-muted'}`}>{t.note}</span>
            </span>
          </HopFrame>
        ))}
      </div>
      <RevenueByDay range={range} day={day} />
      <Orders range={range} day={day} />
    </div>
  );
}

const WEEKS = [
  { id: 'this', label: 'This week' },
  { id: 'last', label: 'Last week' },
] as const;
const MONTHS = [
  { id: 'this', label: 'This month' },
  { id: 'last', label: 'Last month' },
] as const;

type Draw = { duration: number } | null;
let drawnOnce = false; // the line draws in on the first visit, not on every revisit (as Analytics)

/** Revenue by day — the Analytics chart's drawing and motion (user feedback 2026-10-02): a dot on
 *  every day, the active one filled; a new period draws its line in (and fades the old one out);
 *  hover shows a guide and the day's takings; a picked day gets the dashed guide. A day not
 *  reached yet has nothing drawn: the line stops at today over a dashed baseline. A click (or a
 *  day's label, or ← → once the plot has focus) picks a day; the same day again or Esc lets go.
 *  Anything a key changed lands at once. */
function RevenueByDay({ range, day }: { range: SalesRange; day: number | null }) {
  const period = useHop((s) => s.pages.salesPeriod);
  const which = useHop((s) => s.pages.salesWhich);
  const setPages = useHop((s) => s.setPages);
  const reduce = useReducedMotion();
  const [box, width] = useElementWidth<HTMLDivElement>(CHART.width);
  const [hover, setHover] = useState<number | null>(null);
  const chart = SALES_CHART[range];
  const from = RANGES[range].axisFrom;
  const g = chartGeometry(width, chart.values.length);
  const share = (v: number | null) => (v === null ? null : v / chart.max);
  const has = (i: number) => chart.values[i] !== null && chart.values[i] !== undefined;
  const picked = day !== null ? day - from : null;
  const pick = (i: number) => has(i) && setPages({ salesDay: from + i === day ? null : from + i });

  // A period's line draws in when it first shows: on the first visit, and when the toggle or the
  // menu changes the period — not from the keyboard, not under reduced motion.
  const prevRange = useRef(range);
  let draw: Draw = null;
  if (!reduce && !viaKeyboard()) {
    if (!drawnOnce) draw = { duration: timing.lineDraw };
    else if (prevRange.current !== range) draw = { duration: timing.weekLineDraw };
  }
  useEffect(() => {
    drawnOnce = true;
    prevRange.current = range;
  }, [range]);

  // The nearest day with takings to a point on the plot.
  const nearest = (x: number) => {
    const i = Math.max(0, Math.min(chart.values.length - 1, g.dayAt(x)));
    for (let k = 0; k < chart.values.length; k++) for (const j of [i - k, i + k]) if (j >= 0 && j < chart.values.length && has(j)) return j;
    return null;
  };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    const step = e.key === 'ArrowRight' ? 1 : -1;
    let i = (picked ?? (step > 0 ? -1 : chart.values.length)) + step;
    while (i >= 0 && i < chart.values.length && !has(i)) i += step;
    if (i >= 0 && i < chart.values.length) setPages({ salesDay: from + i });
  };
  const hv = hover !== null ? chart.values[hover] : null;

  return (
    <HopFrame
      id={`sales.chart.${range}`}
      label={`Revenue by day · ${RANGES[range].label}`}
      page="sales"
      jumpTarget="analytics"
      radius={14}
      className="flex shrink-0 flex-col gap-12 rounded-12 border border-surface-border-tint px-20 pb-10 pt-14"
    >
      <div className="flex min-h-[44px] items-center justify-between gap-12">
        {/* Changes at once with the pick, like the Analytics chart title. */}
        <h2 className="text-13 font-600 text-text-primary">{day !== null ? dayTitle(day) : `Revenue by day${range === 'all' ? ' · since 3 Aug' : ''}`}</h2>
        {period !== 'all' && (
          <ModeToggle label="Compare" options={period === 'week' ? WEEKS : MONTHS} value={which} onChange={(salesWhich) => setPages({ salesWhich, salesDay: null })} thumbId="sales-thumb" />
        )}
      </div>
      <div
        ref={box}
        className="relative w-full rounded-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-selection"
        style={{ height: CHART.height }}
        tabIndex={0}
        role="group"
        aria-label={`Days: ← and → pick one${day !== null ? `, ${dayTitle(day)} picked` : ''}`}
        onKeyDown={onKey}
      >
        <svg
          width={width}
          height={CHART.height}
          viewBox={`0 0 ${width} ${CHART.height}`}
          className="overflow-visible"
          role="img"
          aria-label={`Revenue by day, ${RANGES[range].label.toLowerCase()}${chart.compareLabel ? `, ${chart.compareLabel.toLowerCase()} in grey` : ''}: ${chart.values
            .flatMap((v, i) => (v === null ? [] : [`${dayTitle(from + i)} ${money(v)}`]))
            .join(', ')}`}
        >
          {/* No initial={false}: it would also stop the layer's own draw-in. */}
          <AnimatePresence>
            <SalesLayer key={range} g={g} chart={chart} share={share} picked={picked} hover={hover} draw={draw} />
          </AnimatePresence>

          {/* Hover guide: glides to the day under the pointer, as on Analytics. */}
          <AnimatePresence>
            {hover !== null && (
              <motion.line
                key="guide"
                y1={CHART.topY - 6}
                y2={CHART.baseline}
                className="pointer-events-none stroke-chart-compare"
                strokeWidth={1}
                initial={{ opacity: 0, x1: g.xAt(hover), x2: g.xAt(hover) }}
                animate={{ opacity: 1, x1: g.xAt(hover), x2: g.xAt(hover) }}
                exit={{ opacity: 0, transition: { duration: duration.fast, ease: easeExit } }}
                transition={{ opacity: { duration: duration.fast, ease: easeOut }, default: { duration: timing.tooltipFollow, ease: easeOut } }}
              />
            )}
          </AnimatePresence>

          {/* Pointer surface: snaps to the nearest day with takings; a click picks it. */}
          <rect
            x={0}
            y={0}
            width={width}
            height={CHART.height}
            fill="transparent"
            className="cursor-pointer"
            data-interactive
            onPointerMove={(e) => setHover(nearest(e.clientX - e.currentTarget.getBoundingClientRect().left))}
            onPointerLeave={() => setHover(null)}
            onClick={() => hover !== null && pick(hover)}
          />
        </svg>

        <AnimatePresence>
          {hover !== null && hv !== null && hv !== undefined && (
            <motion.div
              key="tooltip"
              role="status"
              className="pointer-events-none absolute left-0 top-0 flex -translate-x-1/2 -translate-y-full flex-col gap-2 whitespace-nowrap rounded-8 bg-action-primary px-8 py-6"
              // Positioned by transform, not left/top, so following the pointer never lays out.
              initial={{ opacity: 0, transform: `translate(${g.xAt(hover)}px, ${yAt(share(hv) ?? 0) - 12}px)` }}
              animate={{ opacity: 1, transform: `translate(${g.xAt(hover)}px, ${yAt(share(hv) ?? 0) - 12}px)` }}
              exit={{ opacity: 0, transition: { duration: duration.fast, ease: easeExit } }}
              transition={{ opacity: { duration: duration.fast, ease: easeOut }, transform: { duration: timing.tooltipFollow, ease: easeOut } }}
            >
              <span className="text-12 font-600 text-text-on-dark tabular-nums">{money(hv)}</span>
              <span className="text-11 text-chip-off-text tabular-nums">{dayTitle(from + hover)}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="relative h-[15px] w-full" role="group" aria-label="Days">
        {chart.ticks.map((t) => {
          const cls = `absolute top-0 -translate-x-1/2 whitespace-nowrap text-11-5 transition-colors duration-(--dur-base) ease-hop-color ${
            t.at === picked || (picked === null && t.at === chart.today) ? 'font-500 text-status-success-text' : 'text-chart-future'
          }`;
          return has(t.at) ? (
            <button key={t.at} type="button" className={`${cls} rounded-4`} style={{ left: g.xAt(t.at) }} aria-pressed={t.at === picked} aria-label={`${dayTitle(from + t.at)}, show that day`} onClick={() => pick(t.at)}>
              {t.label}
            </button>
          ) : (
            <span key={t.at} className={cls} style={{ left: g.xAt(t.at) }} aria-hidden="true">
              {t.label}
            </span>
          );
        })}
      </div>
    </HopFrame>
  );
}

/** One period's drawing, keyed by period so a new one swaps whole layers (Analytics' SeriesLayer). */
function SalesLayer({
  g,
  chart,
  share,
  picked,
  hover,
  draw: drawProp,
}: {
  g: ChartGeometry;
  chart: SalesChart;
  share: (v: number | null) => number | null;
  picked: number | null;
  hover: number | null;
  draw: Draw;
}) {
  const reduce = useReducedMotion();
  const [draw] = useState(drawProp); // only the value it was created with matters
  const now = chart.values.map(share);
  const split = chart.today !== null ? g.xAt(chart.today) : g.width;
  const active = picked ?? chart.today ?? now.length - 1;
  const dense = g.step < 18; // all time: smaller dots so 53 of them stay dots
  const radius = (i: number) => (hover === i ? (dense ? 4.5 : 5.5) : i === active ? (dense ? 4 : 5) : dense ? 2.5 : 4);

  const drawIn = draw ? { pathLength: 0 } : false;
  const fadeIn = draw ? { opacity: 0 } : false;
  const drawT = draw ? { duration: draw.duration, ease: easeOut } : undefined;
  const dotsStart = draw ? draw.duration * 0.5 : 0;
  const stagger = Math.min(timing.dotStagger, 0.3 / now.length); // a month of dots still lands quickly

  return (
    <motion.g exit={{ opacity: 0, transition: { duration: duration.fast, ease: easeExit } }}>
      <path d={`M0 ${CHART.baseline}H${split}`} className="stroke-surface-border-tint" strokeWidth={1} />
      {split < g.width && <path d={`M${split} ${CHART.baseline}H${g.width}`} className="stroke-surface-border-tint" strokeWidth={1} strokeDasharray="3 4" />}
      <motion.path d={g.areaPath(now)} className="fill-chart-fill" initial={fadeIn} animate={{ opacity: 1 }} transition={drawT} />
      {chart.compare && (
        <motion.path d={g.linePath(chart.compare.map(share))} className="stroke-chart-compare" strokeWidth={1.5} fill="none" initial={fadeIn} animate={{ opacity: 1 }} transition={drawT} />
      )}
      <motion.path d={g.linePath(now)} className="stroke-status-success" strokeWidth={2} fill="none" initial={drawIn} animate={{ pathLength: 1 }} transition={drawT} />

      {picked !== null && (
        <motion.path
          key={`day-${picked}`}
          d={`M${g.xAt(picked)} ${yAt(now[picked] ?? 0) + 8}V${CHART.baseline}`}
          className="stroke-status-success"
          strokeWidth={1}
          strokeDasharray="2 3"
          initial={reduce || viaKeyboard() ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: timing.guideDraw, ease: easeOut }}
        />
      )}

      {now.map((v, i) => {
        if (v === null) return null;
        const on = i === active;
        return (
          <motion.circle
            key={i}
            cx={g.xAt(i)}
            cy={yAt(v)}
            className={on ? 'fill-status-success stroke-surface-default' : 'fill-surface-default stroke-status-success'}
            strokeWidth={on ? 2 : 1.5}
            style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
            // Each dot fades in growing 0.9 → 1 as the line reaches it (never from 0).
            // SVG: Motion's scale props (a transform string becomes a broken SVG attribute).
            initial={draw ? { scale: 0.9, opacity: 0, r: radius(i) } : false}
            animate={{ scale: 1, opacity: 1, r: radius(i) }}
            transition={{
              scale: { duration: duration.fast, ease: easeOut, delay: dotsStart + i * stagger },
              opacity: { duration: duration.fast, ease: easeOut, delay: dotsStart + i * stagger },
              r: { duration: viaKeyboard() ? 0 : duration.fast, ease: easeOut },
            }}
          />
        );
      })}
    </motion.g>
  );
}

const COLUMNS = 'grid grid-cols-[52px_minmax(100px,1fr)_minmax(106px,1.4fr)_56px_52px_76px_124px] items-center gap-12 px-16';
const ROW = 49; // py 10 + the 28px thumbnail + the 1px divider
const OVERSCAN = 6;
let revealed = 0; // the last tag request (revealPulse) an order list has scrolled to

function Orders({ range, day }: { range: SalesRange; day: number | null }) {
  const filter = useHop((s) => s.pages.salesFilter);
  const setPages = useHop((s) => s.setPages);
  const all = day === null ? SALES_ORDERS[range] : dayOrders(day, range);
  const rows = filter === 'all' ? all : all.filter((o) => o.fulfilment === filter);
  const toPack = all.filter((o) => o.fulfilment === 'To pack').length;
  const label = day === null ? RANGES[range].label : dayTitle(day);
  const scope = day === null ? range : `day${day}`;

  return (
    <HopFrame
      id={`sales.orders.${scope}`}
      label={`Orders · ${label}`}
      page="sales"
      jumpTarget="customers"
      radius={14}
      className="flex min-h-[300px] flex-1 flex-col rounded-12 border border-surface-border-tint"
    >
      <div className="flex shrink-0 items-center justify-between gap-12 px-16 py-12">
        <h2 className="flex items-baseline gap-6 text-13 font-600 text-text-primary">
          Orders
          <span className="text-12 font-400 text-text-muted tabular-nums">{rows.length.toLocaleString('en-US')}</span>
        </h2>
        <Segmented
          label="Show orders"
          options={SALES_FILTERS.map((f) => ({ ...f, count: f.id === 'To pack' ? toPack : undefined }))}
          value={filter}
          onChange={(salesFilter: SalesFilter) => setPages({ salesFilter })}
        />
      </div>
      <div role="table" aria-label={`Orders, ${label.toLowerCase()}`} aria-rowcount={rows.length + 1} className="flex min-h-0 flex-1 flex-col">
        <div role="row" aria-rowindex={1} className={`${COLUMNS} shrink-0 border-y border-surface-divider-tint bg-surface-subtle py-9 text-11-5 font-500 text-text-secondary`}>
          {['Order', 'Customer', 'Items', 'Total', 'Payment', 'Fulfilment', 'Placed'].map((h) => (
            <span key={h} role="columnheader" className={h === 'Placed' ? 'text-right' : ''}>
              {h}
            </span>
          ))}
        </div>
        {/* Keyed by period and filter: a new list starts at its top. */}
        <OrderRows key={`${scope}-${filter}`} rows={rows} range={range} empty={`No orders ${filter === 'all' ? '' : `${filter.toLowerCase()} `}${label.toLowerCase()}.`} />
      </div>
    </HopFrame>
  );
}

/** The rows, drawn only where they're in view (a period can hold over a thousand). */
function OrderRows({ rows, range, empty }: { rows: Order[]; range: SalesRange; empty: string }) {
  const api = useHopApi();
  const list = useRef<HTMLDivElement>(null);
  const [top, setTop] = useState(0);
  const [height, setHeight] = useState(400);

  useLayoutEffect(() => {
    const el = list.current;
    if (!el) return;
    setHeight(el.clientHeight);
    const ro = new ResizeObserver(([entry]) => setHeight(entry.contentRect.height));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // A chat tag on an order brings its row into the drawn window, so the selection can find it.
  // The tag can change the period in the same step, so a list that mounts with a request still
  // unanswered takes it too (the list it replaced didn't hold the row).
  useLayoutEffect(() => {
    const reveal = (s: ReturnType<typeof api.getState>) => {
      if (s.revealPulse === revealed) return;
      const n = s.selection?.id.match(/^sales\.order\.(\d+)$/)?.[1];
      const i = n ? rows.findIndex((o) => o.number === Number(n)) : -1;
      const el = list.current;
      if (i < 0 || !el) return;
      revealed = s.revealPulse;
      el.scrollTop = Math.max(0, i * ROW - el.clientHeight / 2);
      setTop(el.scrollTop);
    };
    reveal(api.getState());
    return api.subscribe(reveal);
  }, [api, rows]);

  if (rows.length === 0) return <p className="px-16 pt-24 text-center text-12-5 text-text-secondary">{empty}</p>;

  const first = Math.max(0, Math.floor(top / ROW) - OVERSCAN);
  const last = Math.min(rows.length, Math.ceil((top + height) / ROW) + OVERSCAN);
  return (
    <div ref={list} role="rowgroup" onScroll={(e) => setTop(e.currentTarget.scrollTop)} className="min-h-0 flex-1 overflow-y-auto">
      <div style={{ paddingTop: first * ROW, paddingBottom: (rows.length - last) * ROW }}>
        {rows.slice(first, last).map((o, k) => (
          <OrderRow key={o.number} o={o} range={range} index={first + k + 2} />
        ))}
      </div>
    </div>
  );
}

function OrderRow({ o, range, index }: { o: Order; range: SalesRange; index: number }) {
  const who = CUSTOMERS[o.customer];
  return (
    <HopFrame
      id={`sales.order.${o.number}`}
      label={`Order #${o.number}`}
      page="sales"
      jumpTarget="customers"
      role="row"
      rowIndex={index}
      className={`${COLUMNS} h-[49px] border-b border-surface-divider-tint text-13`}
    >
      <span role="cell" className="font-500 text-text-primary tabular-nums">
        #{o.number}
      </span>
      <span role="cell" className="flex min-w-0 items-center gap-8">
        <InitialsAvatar initials={who.initials} color={who.avatar} size={24} />
        <Truncate className="text-text-primary">{who.name}</Truncate>
      </span>
      <span role="cell" className="flex min-w-0 items-center gap-8">
        <Thumb id={o.productId} swatch="swatch-sand" className="size-[28px] rounded-5" />
        <Truncate className="text-12-5 text-text-strong-secondary">{itemLabel(o)}</Truncate>
      </span>
      <span role="cell" className="font-500 text-text-primary tabular-nums">
        {money(o.total)}
      </span>
      <span role="cell">
        <Tag tone="success">Paid</Tag>
      </span>
      <span role="cell">
        <Tag tone={FULFILMENT_TONE[o.fulfilment]}>{o.fulfilment}</Tag>
      </span>
      <span role="cell" className="whitespace-nowrap text-right text-12-5 text-text-secondary tabular-nums">
        {placedLabel(o, range)}
      </span>
    </HopFrame>
  );
}
