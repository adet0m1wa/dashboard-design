import type { NumberFormat } from '@/data/types';

// All numbers go through Intl.NumberFormat (brief B9): $2,480 · 34 · 18.2k.
const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const integer = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });

export function formatNumber(value: number, format: NumberFormat): string {
  if (format === 'currency') return currency.format(value);
  if (format === 'compact') return compact.format(value).toLowerCase();
  return integer.format(value);
}

export const money = (n: number) => currency.format(n);

/** "+12%" / "−6%" — change of `now` against `before`, rounded to a whole percent. */
export function changeLabel(now: number, before: number): string {
  const pct = Math.round(((now - before) / before) * 100);
  return pct >= 0 ? `+${pct}%` : `−${Math.abs(pct)}%`;
}
