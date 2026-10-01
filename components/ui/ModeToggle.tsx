'use client';

import { motion } from 'motion/react';
import { viaKeyboard } from '@/lib/input';
import { indicatorSlide } from '@/lib/motion';

// The "This week / Last week" toggle (Figma "Mode toggle"), shared by Analytics and Sales. The
// white thumb slides between options (layoutId, indicatorSlide; at once when a key chose); the
// chosen option's legend dot takes the series colour (brief B7.1).
export function ModeToggle<T extends string>({
  label,
  options,
  value,
  onChange,
  thumbId,
  tone = 'success',
}: {
  label: string;
  options: readonly { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
  /** layoutId of the thumb: one per toggle, so two never slide into each other. */
  thumbId: string;
  tone?: 'success' | 'danger';
}) {
  const onDot = tone === 'danger' ? 'bg-status-danger-text' : 'bg-status-success';

  return (
    <div role="radiogroup" aria-label={label} className="flex items-center gap-6 rounded-9 bg-surface-subtle p-6">
      {options.map((o) => {
        const on = o.id === value;
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.id)}
            className={`relative flex items-center gap-6 rounded-6 p-8 text-12 text-text-secondary ${on ? 'font-500' : 'font-400'}`}
          >
            {on && (
              <motion.span layoutId={thumbId} transition={viaKeyboard() ? { duration: 0 } : indicatorSlide} className="absolute inset-0 rounded-6 bg-surface-default shadow-toggle-thumb" />
            )}
            <span
              aria-hidden="true"
              className={`relative size-[8px] rounded-full transition-colors duration-(--dur-base) ease-hop-color ${on ? onDot : 'bg-legend-off'}`}
            />
            <span className="relative whitespace-nowrap">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}
