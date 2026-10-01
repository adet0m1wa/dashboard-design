'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import { CUSTOMERS, itemLabel, type Order } from '@/data/orders';
import { FULFILMENT_TONE, placedLabel, RANGES, SALES_CHART, SALES_FILTERS, SALES_ORDERS, SALES_TILES, type SalesFilter, type SalesRange } from '@/data/sales';
import { CHART, chartGeometry, yAt } from '@/lib/chart';
import { money } from '@/lib/format';
import { salesRange, useHop, useHopApi } from '@/lib/store';
import { useElementWidth } from '@/lib/useElementWidth';
import { HopFrame } from '@/components/select/HopFrame';
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
// Nothing animates but the toggle's thumb: it's a page for reading and checking.
export function SalesPage() {
  const range = useHop((s) => salesRange(s.pages));
  return (
    <div className="flex h-full min-h-[680px] flex-col gap-16 px-24 py-20">
      <div className="flex gap-12">
        {SALES_TILES[range].map((t) => (
          <HopFrame
            key={t.id}
            id={`sales.tile.${t.id}.${range}`}
            label={`${t.label} · ${RANGES[range].label}`}
            page="sales"
            radius={10}
            className="flex min-w-0 flex-1 flex-col gap-2 rounded-10 border border-surface-border-tint px-14 py-10"
          >
            <span className="text-12 text-text-secondary">{t.label}</span>
            <span className="flex items-baseline gap-6 whitespace-nowrap">
              <span className="text-20 font-600 tracking-px-0-2 text-text-primary tabular-nums">{t.value}</span>
              <span className={`text-12 font-500 ${t.tone === 'success' ? 'text-status-success-text' : t.tone === 'danger' ? 'text-status-danger-text' : 'text-text-muted'}`}>{t.note}</span>
            </span>
          </HopFrame>
        ))}
      </div>
      <RevenueByDay range={range} />
      <Orders range={range} />
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

/** Revenue by day — the Analytics chart's drawing, read-only. A day not reached yet has nothing
 *  drawn: the line stops at today and the baseline turns dashed, as on Analytics. */
function RevenueByDay({ range }: { range: SalesRange }) {
  const period = useHop((s) => s.pages.salesPeriod);
  const which = useHop((s) => s.pages.salesWhich);
  const setPages = useHop((s) => s.setPages);
  const [box, width] = useElementWidth<HTMLDivElement>(CHART.width);
  const chart = SALES_CHART[range];
  const g = chartGeometry(width, chart.values.length);
  const share = (v: number | null) => (v === null ? null : v / chart.max);
  const now = chart.values.map(share);
  const lastDrawn = chart.today ?? now.length - 1;
  const split = chart.today !== null ? g.xAt(chart.today) : g.width;

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
        <h2 className="text-13 font-600 text-text-primary">Revenue by day{range === 'all' ? ' · since 3 Aug' : ''}</h2>
        {period !== 'all' && (
          <ModeToggle label="Compare" options={period === 'week' ? WEEKS : MONTHS} value={which} onChange={(salesWhich) => setPages({ salesWhich })} thumbId="sales-thumb" />
        )}
      </div>
      <div ref={box} className="w-full" style={{ height: CHART.height }}>
        <svg
          width={width}
          height={CHART.height}
          viewBox={`0 0 ${width} ${CHART.height}`}
          className="overflow-visible"
          role="img"
          aria-label={`Revenue by day, ${RANGES[range].label.toLowerCase()}${chart.compareLabel ? `, ${chart.compareLabel.toLowerCase()} in grey` : ''}: ${chart.values
            .flatMap((v, i) => (v === null ? [] : [`${chart.ticks.find((t) => t.at === i)?.label ?? `day ${i + 1}`} ${money(v)}`]))
            .join(', ')}`}
        >
          <path d={`M0 ${CHART.baseline}H${split}`} className="stroke-surface-border-tint" strokeWidth={1} />
          {split < g.width && <path d={`M${split} ${CHART.baseline}H${g.width}`} className="stroke-surface-border-tint" strokeWidth={1} strokeDasharray="3 4" />}
          <path d={g.areaPath(now)} className="fill-chart-fill" />
          {chart.compare && <path d={g.linePath(chart.compare.map(share))} className="stroke-chart-compare" strokeWidth={1.5} fill="none" />}
          <path d={g.linePath(now)} className="stroke-status-success" strokeWidth={2} fill="none" />
          <circle cx={g.xAt(lastDrawn)} cy={yAt(now[lastDrawn] ?? 0)} r={5} className="fill-status-success stroke-surface-default" strokeWidth={2} />
        </svg>
      </div>
      <div className="relative h-[15px] w-full" aria-hidden="true">
        {chart.ticks.map((t) => (
          <span
            key={t.at}
            className={`absolute top-0 -translate-x-1/2 whitespace-nowrap text-11-5 ${t.at === chart.today ? 'font-500 text-status-success-text' : 'text-chart-future'}`}
            style={{ left: g.xAt(t.at) }}
          >
            {t.label}
          </span>
        ))}
      </div>
    </HopFrame>
  );
}

const COLUMNS = 'grid grid-cols-[52px_minmax(100px,1fr)_minmax(106px,1.4fr)_56px_52px_76px_124px] items-center gap-12 px-16';
const ROW = 49; // py 10 + the 28px thumbnail + the 1px divider
const OVERSCAN = 6;
let revealed = 0; // the last tag request (revealPulse) an order list has scrolled to

function Orders({ range }: { range: SalesRange }) {
  const filter = useHop((s) => s.pages.salesFilter);
  const setPages = useHop((s) => s.setPages);
  const all = SALES_ORDERS[range];
  const rows = filter === 'all' ? all : all.filter((o) => o.fulfilment === filter);
  const toPack = all.filter((o) => o.fulfilment === 'To pack').length;
  const label = RANGES[range].label;

  return (
    <HopFrame
      id={`sales.orders.${range}`}
      label={`Orders · ${label}`}
      page="sales"
      jumpTarget="customers"
      radius={14}
      className="flex min-h-[300px] flex-1 flex-col overflow-hidden rounded-12 border border-surface-border-tint"
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
        <OrderRows key={`${range}-${filter}`} rows={rows} range={range} empty={`No orders ${filter === 'all' ? '' : `${filter.toLowerCase()} `}${label.toLowerCase()}.`} />
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
