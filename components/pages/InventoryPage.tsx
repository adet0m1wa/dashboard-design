'use client';

import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';
import { NEED_ATTENTION, STOCK, STOCK_BAR_MAX, STOCK_SUMMARY, type StockRow, type StockStatus } from '@/data/inventory';
import { duration, easeOut, timing } from '@/lib/motion';
import { useHop, useHopApi } from '@/lib/store';
import { HopFrame } from '@/components/select/HopFrame';
import { SmallButton } from '@/components/ui/SmallButton';
import { Tag } from '@/components/ui/Tag';

// Inventory (brief B7.4; Figma "Inventory — nothing selected, jump chips stay").
const TILE_TONE = { default: 'text-text-primary', warning: 'text-status-warning-text', danger: 'text-status-danger-text' } as const;
const STATUS: Record<StockStatus, { tag: 'warning' | 'success' | 'danger'; number: string; bar: string }> = {
  Low: { tag: 'warning', number: 'text-status-warning-text', bar: 'bg-palette-tone-23' },
  'In stock': { tag: 'success', number: 'text-text-primary', bar: 'bg-status-live' },
  'Sold out': { tag: 'danger', number: 'text-status-danger-text', bar: 'bg-palette-tone-24' },
};
const BAR = 70; // px, Figma "Stock bar"

export function InventoryPage() {
  const api = useHopApi();
  const reduce = useReducedMotion();
  const [intro] = useState(() => api.getState().inventoryIntroPending);
  useEffect(() => {
    if (intro) api.getState().finishInventoryIntro();
  }, [intro, api]);
  const grow = intro && !reduce;

  return (
    <div className="flex flex-col gap-16 px-24 py-20">
      <div className="flex gap-12">
        {STOCK_SUMMARY.map((t) => (
          <HopFrame
            key={t.id}
            id={`inventory.tile.${t.id}`}
            label={t.label}
            page="inventory"
            radius={10}
            className="flex min-w-0 flex-1 flex-col gap-2 rounded-10 border border-surface-border-tint px-14 py-10"
          >
            <span className="text-12 text-text-secondary">{t.label}</span>
            <span className={`text-20 font-600 tracking-px-0-2 tabular-nums ${TILE_TONE[t.tone]}`}>{t.value}</span>
          </HopFrame>
        ))}
      </div>

      <div className="flex">
        <Tag tone="danger">{NEED_ATTENTION}</Tag>
      </div>

      <div role="table" aria-label="Stock" className="rounded-12 border border-surface-border-tint">
        <div role="row" className="flex items-center rounded-t-12 border-b border-surface-divider-tint bg-surface-subtle px-16 py-9 text-11-5 font-500 text-text-secondary">
          <span role="columnheader" className="min-w-0 flex-1">
            Product
          </span>
          <span role="columnheader" className="w-[130px]">
            In stock
          </span>
          <span role="columnheader" className="w-[90px]">
            Sold (7 days)
          </span>
          <span role="columnheader" className="w-[86px]">
            Status
          </span>
          <span role="columnheader" className="w-[42px]">
            <span className="sr-only">Actions</span>
          </span>
        </div>
        {STOCK.map((row, i) => (
          <StockLine key={row.id} row={row} index={i} grow={grow} />
        ))}
      </div>
    </div>
  );
}

function StockLine({ row, index, grow }: { row: StockRow; index: number; grow: boolean }) {
  const showToast = useHop((s) => s.showToast);
  const st = STATUS[row.status];
  const width = (Math.min(row.inStock, STOCK_BAR_MAX) / STOCK_BAR_MAX) * BAR;

  return (
    <HopFrame
      id={`inventory.row.${row.id}`}
      label={row.tagLabel}
      page="inventory"
      jumpTarget="inventory"
      role="row"
      className="flex items-center border-b border-surface-divider-tint px-16 py-10 transition-colors duration-(--dur-fast) ease-hop-out last:rounded-b-12 last:border-b-0 hover:bg-surface-canvas"
    >
      <span role="cell" className="flex min-w-0 flex-1 items-center gap-10">
        <span className="size-[32px] shrink-0 rounded-6" style={{ background: `var(--gradient-${row.swatch})` }} />
        <span className="flex min-w-0 flex-col gap-1">
          <span className="truncate text-13 font-500 text-text-primary">{row.name}</span>
          <span className="truncate text-11-5 text-text-muted">{row.variant}</span>
        </span>
      </span>
      <span role="cell" className="flex w-[130px] items-center gap-10">
        <span className={`text-13 font-500 tabular-nums ${st.number}`}>{row.inStock}</span>
        <span className="relative h-[4px] w-[70px] overflow-hidden rounded-2 bg-palette-tone-16" aria-hidden="true">
          <motion.span
            className={`absolute inset-y-0 left-0 rounded-2 ${st.bar}`}
            initial={grow ? { width: 0 } : false}
            animate={{ width }}
            transition={{ duration: duration.data, ease: easeOut, delay: grow ? index * timing.stockBarStagger : 0 }}
          />
        </span>
      </span>
      <span role="cell" className="w-[90px] text-13 text-text-strong-secondary tabular-nums">
        {row.sold7d}
      </span>
      <span role="cell" className="w-[86px]">
        <Tag tone={st.tag}>{row.status}</Tag>
      </span>
      <span role="cell" className="flex w-[42px] justify-end">
        <SmallButton variant="primary" onClick={() => showToast('Product page coming soon')} aria-label={`Edit ${row.name}, ${row.variant}`}>
          Edit
        </SmallButton>
      </span>
    </HopFrame>
  );
}
