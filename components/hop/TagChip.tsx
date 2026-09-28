'use client';

import { motion } from 'motion/react';
import { press } from '@/lib/motion';
import { FrameIcon, XIcon } from '@/components/icons/figma';
import { Truncate } from '@/components/ui/Truncate';

// The blue chip that names a tagged frame (Figma "Selected frame chip"): bg tone-20, 1px tone-21,
// radius 6, px 8 py 3, frame icon + name 11.5/500 text-tone-04.
// `active` is the "tag clicked" style (brief B6): solid blue, white text, 3px blue glow ring.
export function TagChip({
  label,
  active = false,
  onClick,
  onRemove,
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
}) {
  const body = (
    <>
      <FrameIcon className={active ? 'text-text-on-dark' : 'text-selection'} />
      <Truncate>{label}</Truncate>
    </>
  );
  const look = `flex max-w-full items-center gap-6 rounded-6 border px-8 py-3 text-11-5 font-500 transition-[background-color,color,border-color,box-shadow] duration-(--dur-fast) ease-hop-out ${
    active ? 'border-selection bg-selection text-text-on-dark ring-3 ring-selection/25' : 'border-tag-border bg-tag-bg text-tag-text'
  }`;

  if (onClick) {
    return (
      <motion.button type="button" whileTap={press} onClick={onClick} className={look} aria-pressed={active} aria-label={`Show ${label} on the page`}>
        {body}
      </motion.button>
    );
  }
  return (
    <span className={look}>
      {body}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${label}`}
          className="-my-2 -mr-2 flex shrink-0 items-center rounded-4 text-selection transition-colors duration-(--dur-fast) ease-hop-out hover:bg-tag-border"
        >
          <XIcon />
        </button>
      )}
    </span>
  );
}
