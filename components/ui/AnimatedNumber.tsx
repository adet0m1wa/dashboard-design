'use client';

import { animate, useReducedMotion } from 'motion/react';
import { useEffect, useLayoutEffect, useRef } from 'react';
import type { NumberFormat } from '@/data/types';
import { formatNumber } from '@/lib/format';
import { duration, easeOut } from '@/lib/motion';

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/**
 * A number that counts to its new value (`data`, easeOut). Writes straight to the DOM so a
 * count-up never re-renders the tree. Tabular figures keep it from wobbling (brief B5).
 * `from` sets the starting value on mount (0 for the first-load entrance).
 * Reduced motion: no count-up, the new value appears at once.
 */
export function AnimatedNumber({
  value,
  format,
  from,
  delay = 0,
  className = '',
}: {
  value: number;
  format: NumberFormat;
  from?: number;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const shown = useRef(from ?? value);

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduce || shown.current === value) {
      shown.current = value;
      el.textContent = formatNumber(value, format);
      return;
    }
    const controls = animate(shown.current, value, {
      duration: duration.data,
      ease: easeOut,
      delay,
      onUpdate: (v) => {
        shown.current = v;
        el.textContent = formatNumber(v, format);
      },
    });
    return () => controls.stop();
  }, [value, format, reduce, delay]);

  return (
    <span ref={ref} className={`tabular-nums ${className}`} aria-label={formatNumber(value, format)}>
      {formatNumber(from ?? value, format)}
    </span>
  );
}
