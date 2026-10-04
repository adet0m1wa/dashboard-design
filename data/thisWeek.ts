import { ORDERS, THIS_WEEK, TODAY, product } from './orders';
import { SERIES } from './kpis';
import { today } from './today';
import type { ProductRow, Snapshot, Swatch } from './types';

// This week so far, Mon 21 – Thu 24 September (user feedback 2026-10-04): what Analytics shows
// with no day picked, as Sales does. Revenue and orders are counted from the same orders as Sales
// ($9,900 and 131); likes and followers sum the chart's days; each note compares with the same
// days last week. DMs and Urgent are live, so they read as today does.

const sum = (xs: number[]) => xs.reduce((s, x) => s + x, 0);
const soFar = (k: keyof typeof SERIES) => sum(SERIES[k].thisWeek);
const sameDaysLast = (k: keyof typeof SERIES) => sum(SERIES[k].lastWeek.slice(0, SERIES[k].thisWeek.length));
const change = (k: keyof typeof SERIES) => {
  const p = Math.round((soFar(k) / sameDaysLast(k) - 1) * 100);
  return { note: `${p >= 0 ? '+' : '−'}${Math.abs(p)}%`, noteTone: p >= 0 ? ('success' as const) : ('danger' as const) };
};

// The week's three best sellers by takings, from the orders.
const week = ORDERS.filter((o) => o.day >= THIS_WEEK && o.day <= TODAY);
const total = sum(week.map((o) => o.total));
const SWATCH: Record<string, Swatch> = { 'linen-sand': 'swatch-sand', 'slip-emerald': 'swatch-emerald', 'kimono-indigo': 'swatch-indigo' };
const byProduct = new Map<string, { sold: number; amount: number }>();
for (const o of week) {
  const p = byProduct.get(o.productId) ?? { sold: 0, amount: 0 };
  byProduct.set(o.productId, { sold: p.sold + o.qty, amount: p.amount + o.total });
}
const best: ProductRow[] = [...byProduct.entries()]
  .sort((a, b) => b[1].amount - a[1].amount)
  .slice(0, 3)
  .map(([id, p]) => ({
    id,
    name: product(id).name,
    swatch: SWATCH[id] ?? 'swatch-ecru',
    sold: p.sold,
    share: Math.round((p.amount / total) * 100),
    amount: p.amount,
    ...(id === 'linen-sand' ? { tag: { text: '4 left', tone: 'danger' as const } } : {}),
  }));
const rest = total - sum(best.map((r) => r.amount));

export const thisWeek: Snapshot = {
  key: 'thisWeek',
  kpis: {
    revenue: { value: total, ...change('revenue') },
    orders: { value: week.length, ...change('orders') },
    likes: { value: soFar('likes'), ...change('likes') },
    followers: { value: soFar('followers'), ...change('followers') },
    dms: today.kpis.dms,
  },
  cards: {
    revenue: { kind: 'products', link: { label: 'Open Sales', page: 'sales' }, rows: best, footer: ['Everything else', `$${rest.toLocaleString('en-US')}`] },
    orders: { ...today.cards.orders, footer: [`${week.length} orders this week`, '6 to pack'] } as Snapshot['cards']['orders'],
    // Written for the prototype from the week's likes and followers (as last week's were).
    likes: {
      kind: 'posts',
      link: { label: 'Open Instagram', page: 'instagram' },
      rows: [
        { id: 'post-sand-reel', title: 'Styling the Sand set 3 ways', meta: 'Reel · Tue · by Zee', swatch: 'post-sand-reel', likes: 34800 },
        { id: 'post-emerald', title: 'New in: the Emerald slip dress', meta: 'Post · Mon · by Zee', swatch: 'swatch-emerald', likes: 12600 },
        { id: 'post-fit-check', title: 'Fit check: Tolu in Sand', meta: 'Reel · Fri · by Zee', swatch: 'post-fit-check', likes: 6300 },
      ],
      footer: ['Across 14 posts this week', '61k likes'],
    },
    followers: {
      kind: 'sources',
      link: { label: 'Open Instagram', page: 'instagram' },
      rows: [
        { id: 'source-sand-reel', label: 'The Sand reel', count: 452, share: 61 },
        { id: 'source-profile', label: 'Profile visits', count: 170, share: 23 },
        { id: 'source-shares', label: 'Shares and tags', count: 118, share: 16 },
      ],
      footer: [`${soFar('followers')} new followers this week`, change('followers').note],
    },
    dms: today.cards.dms,
  },
  urgent: today.urgent,
};
