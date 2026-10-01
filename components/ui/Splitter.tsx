'use client';

import { useRef, useState } from 'react';

// A drag handle between two areas (user feedback 2026-10-01, Customers): the conversation list
// and the open chat, and the customer's details and their order list. It sits on the divider
// line already drawn there and looks like the side panel's resize handle: a 2px line on hover,
// blue while dragging or focused. Arrow keys move it 8px (Shift: 32), Home and End go to the ends.
// `value` is the size of the area it resizes: the one before it (a column's width) or, with
// `after`, the one after it (a list's height).
export function Splitter({
  label,
  orientation,
  value,
  min,
  max,
  onChange,
  after = false,
}: {
  label: string;
  orientation: 'vertical' | 'horizontal'; // vertical: a line between columns, dragged sideways
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  after?: boolean;
}) {
  const drag = useRef<{ at: number; from: number } | null>(null);
  const [active, setActive] = useState(false);
  const vertical = orientation === 'vertical';
  const sign = after ? -1 : 1;
  const clamp = (v: number) => Math.round(Math.min(max, Math.max(min, v)));
  const pos = (e: React.PointerEvent) => (vertical ? e.clientX : e.clientY);

  const end = (e: React.PointerEvent) => {
    if (!drag.current) return;
    drag.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
    document.documentElement.style.removeProperty('cursor');
    setActive(false);
  };

  return (
    <div className={`relative z-10 shrink-0 ${vertical ? 'w-0 self-stretch' : 'h-0'}`}>
      <div
        role="separator"
        aria-orientation={vertical ? 'vertical' : 'horizontal'}
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        tabIndex={0}
        onPointerDown={(e) => {
          e.preventDefault();
          e.currentTarget.setPointerCapture(e.pointerId);
          drag.current = { at: pos(e), from: value };
          document.documentElement.style.cursor = vertical ? 'col-resize' : 'row-resize';
          setActive(true);
        }}
        onPointerMove={(e) => drag.current && onChange(clamp(drag.current.from + sign * (pos(e) - drag.current.at)))}
        onPointerUp={end}
        onPointerCancel={end}
        onKeyDown={(e) => {
          const step = e.shiftKey ? 32 : 8;
          const keys: Record<string, number> = vertical
            ? { ArrowRight: value + sign * step, ArrowLeft: value - sign * step, Home: min, End: max }
            : { ArrowDown: value + sign * step, ArrowUp: value - sign * step, Home: min, End: max };
          const next = keys[e.key];
          if (next === undefined) return;
          e.preventDefault();
          onChange(clamp(next));
        }}
        className={`group absolute touch-none focus-visible:outline-none ${vertical ? 'inset-y-0 -left-3 w-6 cursor-col-resize' : 'inset-x-0 -top-3 h-6 cursor-row-resize'}`}
      >
        <span
          aria-hidden="true"
          className={`absolute group-focus-visible:bg-selection ${vertical ? 'inset-y-0 left-2 w-2' : 'inset-x-0 top-2 h-2'} ${active ? 'bg-selection' : 'group-hover:bg-palette-tone-27'}`}
        />
      </div>
    </div>
  );
}
