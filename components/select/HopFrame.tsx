'use client';

import type { ElementType, ReactNode } from 'react';
import type { Page } from '@/data/types';

// Wraps every selectable part of a page (brief B6). Phase 2: marks the element with its frame
// id/label so the selection system (phase 5) can find it. Hover, select and scan come later.
export interface HopFrameProps {
  id: string;
  label: string;
  page: Page;
  jumpTarget?: Page;
  as?: ElementType;
  className?: string;
  children: ReactNode;
}

export function HopFrame({ id, label, page, jumpTarget, as: Tag = 'div', className, children }: HopFrameProps) {
  return (
    <Tag
      data-hop-frame={id}
      data-hop-label={label}
      data-hop-page={page}
      data-hop-jump={jumpTarget}
      className={`relative ${className ?? ''}`}
    >
      {children}
    </Tag>
  );
}
