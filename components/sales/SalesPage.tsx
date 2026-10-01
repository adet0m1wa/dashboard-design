'use client';

import { FULFILMENT_TONE, SALES_DAYS, SALES_FILTERS, SALES_ORDERS, SALES_REVENUE, SALES_TILES, type SalesFilter } from '@/data/sales';
import { CHART, chartGeometry, yAt } from '@/lib/chart';
import { money } from '@/lib/format';
import { useHop } from '@/lib/store';
import { useElementWidth } from '@/lib/useElementWidth';
import { HopFrame } from '@/components/select/HopFrame';
import { InitialsAvatar } from '@/components/ui/PersonAvatar';
import { Segmented } from '@/components/ui/Segmented';
import { Tag } from '@/components/ui/Tag';
import { Thumb } from '@/components/ui/Thumb';
import { Truncate } from '@/components/ui/Truncate';

// Sales (designed 2026-10-01 after the older "07 · Sales" Figma reference, in today's styling):
// the last 7 days at a glance, revenue by day against the 7 before, and the orders — filterable,
// with what's still to pack up front. Nothing animates: it's a page for reading and checking.
export function SalesPage() {
  return (
    <div className="flex flex-col gap-16 px-24 py-20">
      <div className="flex gap-12">
        {SALES_TILES.map((t) => (
          <HopFrame
            key={t.id}
            id={`sales.tile.${t.id}`}
            label={t.label}
            page="sales"
            radius={10}
            className="flex min-w-0 flex-1 flex-col gap-2 rounded-10 border border-surface-border-tint px-14 py-10"
          >
            <span className="text-12 text-text-secondary">{t.label}</span>
            <span className="flex items-baseline gap-6 whitespace-nowrap">
              <span className="text-20 font-600 tracking-px-0-2 text-text-primary tabular-nums">{t.value}</span>
              <span className={`text-12 font-500 ${t.tone === 'success' ? 'text-status-success-text' : 'text-text-muted'}`}>{t.note}</span>
            </span>
          </HopFrame>
        ))}
      </div>
      <RevenueByDay />
      <Orders />
    </div>
  );
}

/** Revenue by day, this 7 days against the 7 before — the Analytics chart's drawing, read-only. */
function RevenueByDay() {
  const [box, width] = useElementWidth<HTMLDivElement>(CHART.width);
  const g = chartGeometry(width);
  const share = (v: number) => v / SALES_REVENUE.max;
  const now = SALES_REVENUE.current.map(share);
  const before = SALES_REVENUE.previous.map(share);
  const last = now.length - 1;

  return (
    <HopFrame id="sales.chart" label="Revenue by day" page="sales" jumpTarget="analytics" radius={14} className="flex flex-col gap-12 rounded-12 border border-surface-border-tint px-20 pb-10 pt-14">
      <div className="flex items-center justify-between">
        <h2 className="text-13 font-600 text-text-primary">Revenue by day</h2>
        <div className="flex items-center gap-12 text-12 text-text-secondary">
          <span className="flex items-center gap-6">
            <span aria-hidden="true" className="size-[8px] rounded-full bg-status-success" />
            Last 7 days
          </span>
          <span className="flex items-center gap-6">
            <span aria-hidden="true" className="size-[8px] rounded-full bg-legend-off" />
            The 7 before
          </span>
        </div>
      </div>
      <div ref={box} className="w-full" style={{ height: CHART.height }}>
        <svg
          width={width}
          height={CHART.height}
          viewBox={`0 0 ${width} ${CHART.height}`}
          className="overflow-visible"
          role="img"
          aria-label={`Revenue by day: ${SALES_DAYS.map((d, i) => `${d} ${money(SALES_REVENUE.current[i])}`).join(', ')}`}
        >
          <path d={`M0 ${CHART.baseline}H${g.width}`} className="stroke-surface-border-tint" strokeWidth={1} />
          <path d={g.areaPath(now)} className="fill-chart-fill" />
          <path d={g.linePath(before)} className="stroke-chart-compare" strokeWidth={1.5} fill="none" />
          <path d={g.linePath(now)} className="stroke-status-success" strokeWidth={2} fill="none" />
          <circle cx={g.xAt(last)} cy={yAt(now[last])} r={5} className="fill-status-success stroke-surface-default" strokeWidth={2} />
        </svg>
      </div>
      <div className="relative h-[15px] w-full" aria-hidden="true">
        {SALES_DAYS.map((d, i) => (
          <span key={d} className={`absolute top-0 -translate-x-1/2 text-11-5 ${i === last ? 'font-500 text-status-success-text' : 'text-chart-future'}`} style={{ left: g.xAt(i) }}>
            {d}
          </span>
        ))}
      </div>
    </HopFrame>
  );
}

const COLUMNS = 'grid grid-cols-[56px_minmax(120px,1fr)_minmax(150px,1.4fr)_56px_60px_80px_64px] items-center gap-12 px-16';

function Orders() {
  const filter = useHop((s) => s.pages.salesFilter);
  const setPages = useHop((s) => s.setPages);
  const rows = SALES_ORDERS.filter((o) => filter === 'all' || o.fulfilment === filter);
  const count = (f: SalesFilter) => (f === 'all' ? undefined : f === 'To pack' ? SALES_ORDERS.filter((o) => o.fulfilment === f).length : undefined);

  return (
    <HopFrame id="sales.orders" label="Recent orders" page="sales" jumpTarget="customers" radius={14} className="rounded-12 border border-surface-border-tint">
      <div className="flex items-center justify-between px-16 py-12">
        <h2 className="text-13 font-600 text-text-primary">Recent orders</h2>
        <Segmented
          label="Show orders"
          options={SALES_FILTERS.map((f) => ({ ...f, count: count(f.id) }))}
          value={filter}
          onChange={(salesFilter) => setPages({ salesFilter })}
        />
      </div>
      <div role="table" aria-label="Recent orders">
        <div role="row" className={`${COLUMNS} border-y border-surface-divider-tint bg-surface-subtle py-9 text-11-5 font-500 text-text-secondary`}>
          {['Order', 'Customer', 'Items', 'Total', 'Payment', 'Fulfilment', 'Placed'].map((h) => (
            <span key={h} role="columnheader" className={h === 'Placed' ? 'text-right' : ''}>
              {h}
            </span>
          ))}
        </div>
        {rows.map((o) => (
          <HopFrame
            key={o.number}
            id={`sales.order.${o.number}`}
            label={`Order #${o.number}`}
            page="sales"
            jumpTarget="customers"
            role="row"
            className={`${COLUMNS} border-b border-surface-divider-tint py-10 text-13 last:rounded-b-12 last:border-b-0`}
          >
            <span role="cell" className="font-500 text-text-primary tabular-nums">
              #{o.number}
            </span>
            <span role="cell" className="flex min-w-0 items-center gap-8">
              <InitialsAvatar initials={o.initials} color={o.avatar} size={24} />
              <Truncate className="text-text-primary">{o.customer}</Truncate>
            </span>
            <span role="cell" className="flex min-w-0 items-center gap-8">
              <Thumb id={o.productId} swatch="swatch-sand" className="size-[28px] rounded-5" />
              <Truncate className="text-12-5 text-text-strong-secondary">{o.item}</Truncate>
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
            <span role="cell" className="text-right text-12-5 text-text-secondary tabular-nums">
              {o.placed}
            </span>
          </HopFrame>
        ))}
      </div>
    </HopFrame>
  );
}
