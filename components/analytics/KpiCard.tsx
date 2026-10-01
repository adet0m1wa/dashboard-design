'use client';

import { motion } from 'motion/react';
import { shareWord } from '@/data/analytics';
import { KPIS } from '@/data/kpis';
import type { Card, DmRow, Kpi, OrderRow, Page, PeriodKey, PostRow, ProductRow, SourceRow } from '@/data/types';
import { formatNumber, money } from '@/lib/format';
import { press } from '@/lib/motion';
import { useHop } from '@/lib/store';
import { ArrowIcon } from '@/components/icons/figma';
import { HopFrame } from '@/components/select/HopFrame';
import { InitialsAvatar } from '@/components/ui/PersonAvatar';
import { Tag } from '@/components/ui/Tag';
import { Thumb } from '@/components/ui/Thumb';
import { Truncate } from '@/components/ui/Truncate';

// The card beside Urgent, one variant per KPI (brief A7, B7.1). Card: p 16, gap 12, radius 12,
// 1px border; a spacer keeps the footer pinned to the bottom of the fixed-height row. Its title is
// the selected KPI's name, with no period in it — the chart's toggle already says which (user
// feedback 2026-09-30).
export function KpiCard({ kpi, card, period, className = '' }: { kpi: Kpi; card: Card; period: PeriodKey; className?: string }) {
  const navigate = useHop((s) => s.navigate);
  const title = KPIS[kpi].label;

  return (
    <HopFrame
      id="analytics.card"
      label={title}
      page="analytics"
      jumpTarget={card.link.page}
      radius={14}
      className={`flex min-w-0 flex-col gap-12 rounded-12 border border-surface-border-tint bg-surface-default p-16 ${className}`}
    >
      <div className="flex items-center justify-between gap-12">
        {/* Everything here changes at once with the data (user feedback 2026-09-29; the rows too
            since 2026-09-30 — Emil Kowalski: a KPI switch is too frequent to animate). The link
            never gives up its width to the title. */}
        <h3 className="flex min-w-0 text-13 font-600 text-text-primary">
          <Truncate>{title}</Truncate>
        </h3>
        <div className="grid shrink-0 justify-items-end">
          <motion.button
            type="button"
            whileTap={press}
            onClick={() => navigate(card.link.page, 'link')}
            className="flex items-center gap-4 rounded-4 text-12 font-500 text-text-secondary transition-colors duration-(--dur-fast) ease-hop-color hover:text-text-primary"
          >
            {card.link.label}
            <ArrowIcon />
          </motion.button>
        </div>
      </div>

      <div className={`flex flex-col ${ROW_GAP[card.kind]}`}>
        <CardRows card={card} period={period} />
      </div>

      <div className="min-h-0 flex-1" />
      <div className="border-t border-surface-faint pt-10 text-12 tabular-nums">
        <div className="flex justify-between">
          <span className="text-text-secondary">{card.footer[0]}</span>
          <span className="font-500 text-text-primary">{card.footer[1]}</span>
        </div>
      </div>
    </HopFrame>
  );
}

// Every variant has the Revenue card's rhythm and fills the same 246px row (user feedback
// 2026-09-30): three 36px rows, 12px apart. Post thumbnails are 29×36 (Figma's 30×38, same 4:5).
// A follower row is shorter (label, 8, 6px bar = 32), so the rows sit 18 apart: 3×32 + 2×18 = 132,
// the same block height.
const ROW_GAP: Record<Card['kind'], string> = { products: 'gap-12', orders: 'gap-12', dms: 'gap-12', posts: 'gap-12', sources: 'gap-18' };

function CardRows({ card, period }: { card: Card; period: PeriodKey }) {
  switch (card.kind) {
    case 'products':
      return card.rows.map((r) => (
        <RowFrame key={r.id} id={r.id} label={r.name} jump="inventory">
          <ProductLine row={r} period={period} />
        </RowFrame>
      ));
    case 'orders':
      return card.rows.map((r) => (
        <RowFrame key={r.id} id={r.id} label={r.customer} jump="sales">
          <OrderLine row={r} />
        </RowFrame>
      ));
    case 'posts':
      return card.rows.map((r) => (
        <RowFrame key={r.id} id={r.id} label={r.title} jump="instagram">
          <PostLine row={r} />
        </RowFrame>
      ));
    case 'sources':
      return card.rows.map((r) => (
        <RowFrame key={r.id} id={r.id} label={r.label} jump="instagram">
          <SourceLine row={r} />
        </RowFrame>
      ));
    case 'dms':
      return card.rows.map((r) => (
        <RowFrame key={r.id} id={r.id} label={r.customer} jump="customers">
          <DmLine row={r} />
        </RowFrame>
      ));
  }
}

function RowFrame({ id, label, jump, children }: { id: string; label: string; jump: Page; children: React.ReactNode }) {
  return (
    <HopFrame id={`analytics.card.${id}`} label={label} page="analytics" jumpTarget={jump} className="rounded-6">
      {children}
    </HopFrame>
  );
}

const Name = ({ children }: { children: React.ReactNode }) => (
  <Truncate className="text-13-5 font-500 text-text-primary">{children}</Truncate>
);
const Sub = ({ children }: { children: React.ReactNode }) => (
  <Truncate className="text-12 text-text-secondary">{children}</Truncate>
);
const Amount = ({ children }: { children: React.ReactNode }) => (
  <span className="shrink-0 whitespace-nowrap text-13-5 font-600 text-text-primary tabular-nums">{children}</span>
);

function ProductLine({ row, period }: { row: ProductRow; period: PeriodKey }) {
  return (
    <div className="flex items-center gap-10">
      <Thumb id={row.id} swatch={row.swatch} className="size-[36px] rounded-6" />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <Name>{row.name}</Name>
        <Sub>
          {row.sold} sold · {row.share}% of {shareWord(period)}
        </Sub>
      </div>
      {row.tag && <Tag tone={row.tag.tone}>{row.tag.text}</Tag>}
      <Amount>{money(row.amount)}</Amount>
    </div>
  );
}

function OrderLine({ row }: { row: OrderRow }) {
  return (
    <div className="flex items-center gap-10">
      <InitialsAvatar initials={row.initials} color={row.avatar} size={32} />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <Name>{row.customer}</Name>
        <Sub>
          {row.item} × {row.qty} · {row.time}
        </Sub>
      </div>
      <Tag tone={row.tone ?? 'warning'}>{row.status}</Tag>
      <Amount>{money(row.amount)}</Amount>
    </div>
  );
}

function PostLine({ row }: { row: PostRow }) {
  return (
    <div className="flex items-center gap-10">
      <Thumb id={row.id} swatch={row.swatch} className="h-[36px] w-[29px] rounded-5" />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <Name>{row.title}</Name>
        <Sub>{row.meta}</Sub>
      </div>
      <div className="flex shrink-0 flex-col items-end">
        <Amount>{formatNumber(row.likes, 'compact')}</Amount>
        <span className="text-11 text-text-muted">likes</span>
      </div>
    </div>
  );
}

function SourceLine({ row }: { row: SourceRow }) {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between whitespace-nowrap">
        <span className="text-13-5 font-500 text-text-primary">{row.label}</span>
        <span className="text-12-5 text-text-secondary tabular-nums">
          {row.count} · {row.share}%
        </span>
      </div>
      <div className="relative h-[6px] overflow-hidden rounded-3 bg-palette-tone-16">
        <span className="absolute inset-y-0 left-0 rounded-3 bg-status-success" style={{ width: `${row.share}%` }} />
      </div>
    </div>
  );
}

function DmLine({ row }: { row: DmRow }) {
  return (
    <div className="flex items-center gap-10">
      <InitialsAvatar initials={row.initials} color={row.avatar} size={32} />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <Name>{row.customer}</Name>
        <Sub>{row.quote}</Sub>
      </div>
      <Tag tone={row.tone ?? 'danger'}>{row.waiting}</Tag>
    </div>
  );
}
