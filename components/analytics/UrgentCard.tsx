'use client';

import type { UrgentIcon, UrgentItem } from '@/data/types';
import { BoxUrgentIcon, MsgIcon, UsersUrgentIcon } from '@/components/icons/figma';
import { HopFrame } from '@/components/select/HopFrame';
import { SmallButton } from '@/components/ui/SmallButton';
import { Truncate } from '@/components/ui/Truncate';

// Urgent (Figma "Card/Needs you"). Live rows have an action button; past periods show the
// items as done, with a quiet status pill instead (brief B7.1). Nothing here animates (user
// feedback 2026-09-29): the rows change at once with the period.
const ICON: Record<UrgentIcon, { tile: string; Icon: typeof MsgIcon }> = {
  // Icon colours are the Figma strokes: tone-07 #DC2626, tone-08 #D97706, tone-10 #5B5BD6.
  msg: { tile: 'bg-status-danger-soft text-palette-tone-07', Icon: MsgIcon },
  box: { tile: 'bg-status-warning-soft text-palette-tone-08', Icon: BoxUrgentIcon },
  users: { tile: 'bg-info-soft text-info-icon', Icon: UsersUrgentIcon },
};

export function UrgentCard({
  items,
  swapKey,
  onAction,
  className = '',
}: {
  items: UrgentItem[];
  swapKey: string;
  onAction?: (item: UrgentItem) => void;
  className?: string;
}) {
  return (
    <div className={`flex min-w-0 flex-col gap-12 rounded-12 border border-surface-border-tint bg-surface-default p-16 ${className}`}>
      <h3 className="text-13 font-600 text-text-primary">Urgent</h3>
      <div key={swapKey} className="flex flex-col gap-12">
        {items.map((item) => (
          <UrgentRow key={item.id} item={item} onAction={onAction} />
        ))}
      </div>
    </div>
  );
}

function UrgentRow({ item, onAction }: { item: UrgentItem; onAction?: (item: UrgentItem) => void }) {
  const { tile, Icon } = ICON[item.icon];
  return (
    <HopFrame id={`analytics.urgent.${item.id}`} label={item.title} page="analytics" jumpTarget={item.jumpTarget} className="rounded-6">
      <div className="flex items-center gap-10">
        <span className={`flex size-[30px] shrink-0 items-center justify-center rounded-8 ${tile}`}>
          <Icon />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <Truncate className="text-13 font-500 text-text-primary">{item.title}</Truncate>
          <Truncate className="text-12 text-text-secondary">{item.sub}</Truncate>
        </div>
        {item.action ? (
          <SmallButton variant={item.action.style} onClick={() => onAction?.(item)}>
            {item.action.label}
          </SmallButton>
        ) : (
          <span className="shrink-0 whitespace-nowrap rounded-8 border border-surface-border-tint bg-surface-default px-10 py-6 text-12 font-500 text-text-primary">
            {item.done}
          </span>
        )}
      </div>
    </HopFrame>
  );
}
