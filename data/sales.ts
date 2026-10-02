import type { Answer } from './conversation';
import { CUSTOMERS, DAY_COUNT, DAY_REVENUE, LAST_WEEK, ORDERS, SEPTEMBER, THIS_WEEK, TODAY, clock, dateOf, itemLabel, numericDate, orderByNumber, shortDate, weekdayOf, type Fulfilment, type Order } from './orders';
import type { Tone } from './types';

// The Sales page (user feedback 2026-10-01), laid out after the older Figma reference "07 · Sales
// — Hop collapsed" (1791:2608) in today's styling. Round 7: it reads any period — this week or
// last (the toggle, as on Analytics), this month or last (the period menu's "Monthly"), or all
// time — from every order since the store opened (data/orders.ts). Days not reached yet show no
// data. Every number here is counted from those orders.

export type { Fulfilment } from './orders';
export const FULFILMENT_TONE: Record<Fulfilment, Tone> = { 'To pack': 'warning', Shipped: 'info', Delivered: 'success' };

export type SalesPeriod = 'week' | 'month' | 'all';
export type SalesWhich = 'this' | 'last';
export type SalesRange = 'thisWeek' | 'lastWeek' | 'thisMonth' | 'lastMonth' | 'all';
export const rangeOf = (period: SalesPeriod, which: SalesWhich): SalesRange => (period === 'all' ? 'all' : `${which}${period === 'week' ? 'Week' : 'Month'}`);

export const SALES_PERIODS: { id: SalesPeriod; label: string }[] = [
  { id: 'week', label: 'Weekly' },
  { id: 'month', label: 'Monthly' },
  { id: 'all', label: 'All time' },
];

interface RangeDef {
  label: string; // "This week"
  /** Days with data, inclusive (day 0 = Mon 3 Aug). */
  from: number;
  to: number;
  /** The chart's x axis: `points` days from `axisFrom` (can start before the store opened). */
  axisFrom: number;
  points: number;
  /** Drawn in grey behind it, aligned by position (last week's Monday under this Monday …). */
  compare?: { axisFrom: number; label: string };
  /** The same stretch one period earlier, for the tiles' notes. */
  before?: { from: number; to: number; label: string };
  ticks: number[]; // axis positions that get a label
}

const AUG_1 = -2; // Sat 1 Aug, before the store opened
export const RANGES: Record<SalesRange, RangeDef> = {
  thisWeek: {
    label: 'This week',
    from: THIS_WEEK,
    to: TODAY,
    axisFrom: THIS_WEEK,
    points: 7,
    compare: { axisFrom: LAST_WEEK, label: 'Last week' },
    before: { from: LAST_WEEK, to: LAST_WEEK + (TODAY - THIS_WEEK), label: 'the same days last week' },
    ticks: [0, 1, 2, 3, 4, 5, 6],
  },
  lastWeek: { label: 'Last week', from: LAST_WEEK, to: THIS_WEEK - 1, axisFrom: LAST_WEEK, points: 7, before: { from: LAST_WEEK - 7, to: LAST_WEEK - 1, label: 'the week before' }, ticks: [0, 1, 2, 3, 4, 5, 6] },
  thisMonth: {
    label: 'This month',
    from: SEPTEMBER,
    to: TODAY,
    axisFrom: SEPTEMBER,
    points: 30,
    compare: { axisFrom: AUG_1, label: 'August' },
    before: { from: 0, to: TODAY - SEPTEMBER + AUG_1, label: 'the same days in August' },
    ticks: [0, 7, 14, 21, 28],
  },
  lastMonth: { label: 'Last month', from: 0, to: SEPTEMBER - 1, axisFrom: AUG_1, points: 31, ticks: [0, 7, 14, 21, 28] },
  all: { label: 'All time', from: 0, to: TODAY, axisFrom: 0, points: DAY_COUNT, ticks: [0, 14, 28, 42] },
};

const inDays = (from: number, to: number) => ORDERS.filter((o) => o.day >= from && o.day <= to);
const sum = (orders: Order[]) => orders.reduce((s, o) => s + o.total, 0);
const money = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`;
const pct = (now: number, then: number) => Math.round((now / then - 1) * 100);

/** Share of orders placed by someone who had ordered before. */
function returningShare(from: number, to: number) {
  const seen = new Set<string>();
  let back = 0;
  let n = 0;
  for (const o of ORDERS) {
    if (o.day > to) break;
    if (o.day >= from) {
      n++;
      if (seen.has(o.customer)) back++;
    }
    seen.add(o.customer);
  }
  return n ? Math.round((back / n) * 100) : 0;
}

export interface SalesTile {
  id: 'revenue' | 'orders' | 'average' | 'returning';
  label: string;
  value: string;
  /** The number itself, for the count-up (round 8: the tiles move like Analytics' KPIs). */
  raw: number;
  unit: 'currency' | 'int' | 'percent';
  note: string;
  tone: 'success' | 'danger' | 'muted';
}

type Before = { from: number; to: number; label: string } | null;

/** The four tiles for any stretch of days, against the stretch before it when there is one. */
function spanTiles(from: number, to: number, before: Before, since: string): SalesTile[] {
  const now = inDays(from, to);
  const then = before ? inDays(before.from, before.to) : null;
  const change = (a: number, b: number): Pick<SalesTile, 'note' | 'tone'> => {
    const p = pct(a, b);
    return p === 0 ? { note: 'same as before', tone: 'muted' } : { note: p > 0 ? `+${p}%` : `−${-p}%`, tone: p > 0 ? 'success' : 'danger' };
  };
  const avg = now.length ? sum(now) / now.length : 0;
  const back = returningShare(from, to);
  if (!then?.length) {
    return [
      { id: 'revenue', label: 'Revenue', value: money(sum(now)), raw: sum(now), unit: 'currency', note: since, tone: 'muted' },
      { id: 'orders', label: 'Orders', value: now.length.toLocaleString('en-US'), raw: now.length, unit: 'int', note: since, tone: 'muted' },
      { id: 'average', label: 'Average order', value: money(avg), raw: Math.round(avg), unit: 'currency', note: since, tone: 'muted' },
      { id: 'returning', label: 'Returning customers', value: `${back}%`, raw: back, unit: 'percent', note: since, tone: 'muted' },
    ];
  }
  const avgThen = sum(then) / then.length;
  const backThen = returningShare(before!.from, before!.to);
  const dAvg = Math.round(avg - avgThen);
  const dBack = back - backThen;
  return [
    { id: 'revenue', label: 'Revenue', value: money(sum(now)), raw: sum(now), unit: 'currency', ...change(sum(now), sum(then)) },
    { id: 'orders', label: 'Orders', value: now.length.toLocaleString('en-US'), raw: now.length, unit: 'int', ...change(now.length, then.length) },
    { id: 'average', label: 'Average order', value: money(avg), raw: Math.round(avg), unit: 'currency', note: dAvg === 0 ? 'same as before' : `${dAvg > 0 ? '+' : '−'}$${Math.abs(dAvg)}`, tone: dAvg > 0 ? 'success' : dAvg < 0 ? 'danger' : 'muted' },
    { id: 'returning', label: 'Returning customers', value: `${back}%`, raw: back, unit: 'percent', note: dBack === 0 ? 'same as before' : `${dBack > 0 ? '+' : '−'}${Math.abs(dBack)} pts`, tone: dBack > 0 ? 'success' : dBack < 0 ? 'danger' : 'muted' },
  ];
}

function tilesFor(range: SalesRange): SalesTile[] {
  const r = RANGES[range];
  return spanTiles(r.from, r.to, r.before ?? null, range === 'all' ? 'since 3 Aug' : 'first month');
}

// A single day picked on the chart (user feedback 2026-10-02: move between days, as on Analytics):
// its tiles against the same day a week before, its orders.
const DAY_NAMES = { Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday' } as const;
export const dayTitle = (day: number) => `${day === TODAY ? 'Today, ' : ''}${DAY_NAMES[weekdayOf(day)]}, ${shortDate(day)}`;
const dayBefore = (day: number): Before => (day >= 7 ? { from: day - 7, to: day - 7, label: `the ${DAY_NAMES[weekdayOf(day)]} before` } : null);
export const dayTiles = (day: number) => spanTiles(day, day, dayBefore(day), 'first week');
/** A day's orders, in the period's order (all time oldest first). */
export const dayOrders = (day: number, range: SalesRange) => {
  const list = inDays(day, day);
  return range === 'all' ? list : [...list].reverse();
};

export interface SalesChart {
  values: (number | null)[]; // null: before the store opened, or not reached yet
  compare: (number | null)[] | null;
  compareLabel: string | null;
  max: number;
  today: number | null; // axis position of today
  ticks: { at: number; label: string; future: boolean }[];
}

const revenueAt = (day: number) => (day >= 0 && day <= TODAY ? DAY_REVENUE[day] : null);

function chartFor(range: SalesRange): SalesChart {
  const r = RANGES[range];
  const axis = Array.from({ length: r.points }, (_, i) => r.axisFrom + i);
  const values = axis.map(revenueAt);
  const compare = r.compare ? axis.map((_, i) => revenueAt(r.compare!.axisFrom + i)) : null;
  const top = Math.max(...values.map((v) => v ?? 0), ...(compare ?? []).map((v) => v ?? 0));
  const today = axis.indexOf(TODAY);
  const tickLabel = (i: number) => {
    const day = axis[i];
    if (day === TODAY) return 'Today';
    if (r.points === 7) return weekdayOf(day < 0 ? day + 7 : day);
    if (day < 0) return `${day - AUG_1 + 1} Aug`;
    return shortDate(day);
  };
  const ticks = [...r.ticks, ...(today >= 0 && !r.ticks.includes(today) ? [today] : [])].map((at) => ({ at, label: tickLabel(at), future: axis[at] > TODAY }));
  return { values, compare, compareLabel: r.compare?.label ?? null, max: Math.ceil((top * 1.12) / 500) * 500, today: today >= 0 ? today : null, ticks };
}

export const SALES_TILES = Object.fromEntries((Object.keys(RANGES) as SalesRange[]).map((k) => [k, tilesFor(k)])) as Record<SalesRange, SalesTile[]>;
export const SALES_CHART = Object.fromEntries((Object.keys(RANGES) as SalesRange[]).map((k) => [k, chartFor(k)])) as Record<SalesRange, SalesChart>;

/** The orders a period lists: newest first; all time from #1 (user feedback 2026-10-01). */
export const SALES_ORDERS = Object.fromEntries(
  (Object.keys(RANGES) as SalesRange[]).map((k) => {
    const list = inDays(RANGES[k].from, RANGES[k].to);
    return [k, k === 'all' ? list : [...list].reverse()];
  }),
) as Record<SalesRange, Order[]>;

/** When an order was placed, as precise as the period needs: "2:02 PM", "Wed 4:10 PM",
 *  "12 Sep, 4:10 PM", and on all time "12/09/26, 4:10 PM". */
export function placedLabel(o: Order, range: SalesRange) {
  const time = clock(o.minute);
  if (range === 'all') return `${numericDate(o.day)}, ${time}`;
  if (range === 'thisMonth' || range === 'lastMonth') return `${shortDate(o.day)}, ${time}`;
  return o.day === TODAY ? time : `${weekdayOf(o.day)} ${time}`;
}

export type SalesFilter = 'all' | Fulfilment;
export const SALES_FILTERS: { id: SalesFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'To pack', label: 'To pack' },
  { id: 'Shipped', label: 'Shipped' },
  { id: 'Delivered', label: 'Delivered' },
];

// What Hop says. Every frame id carries its period (the tiles say different things each week).
const text = (t: string): Answer['blocks'][number] => ({ kind: 'text', text: t });
const toPack = () => ORDERS.filter((o) => o.fulfilment === 'To pack');

function bestDay(range: SalesRange) {
  const r = RANGES[range];
  let best = r.from;
  for (let d = r.from; d <= r.to; d++) if (DAY_REVENUE[d] > DAY_REVENUE[best]) best = d;
  const name = r.points === 7 ? ({ Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday' } as const)[weekdayOf(best)] : `${weekdayOf(best)} ${shortDate(best)}`;
  return `${name} (${money(DAY_REVENUE[best])})`;
}

function answersFor(range: SalesRange): [string, Answer][] {
  const r = RANGES[range];
  const tiles = SALES_TILES[range];
  const [revenue, orders, average, returning] = tiles;
  const period = range === 'all' ? 'since the store opened on 3 Aug' : r.label.toLowerCase();
  const vs = r.before ? `, ${revenue.note.startsWith('−') ? 'down' : 'up'} ${revenue.note.replace(/[+−]/, '')} on ${r.before.label} (${money(sum(inDays(r.before.from, r.before.to)))})` : '';
  const packing = toPack();
  const live = range === 'thisWeek' || range === 'thisMonth' || range === 'all';
  return [
    [`sales.tile.revenue.${range}`, { reads: ['sales'], blocks: [text(`${revenue.value} ${period}${vs}. The best day was ${bestDay(range)}.`)] }],
    [`sales.tile.orders.${range}`, { reads: ['sales'], blocks: [text(`${orders.value} orders ${period}${r.before ? ` (${orders.note} on ${r.before.label})` : ''}.${live ? ` ${packing.length} of today’s ${inDays(TODAY, TODAY).length} are still to pack.` : ''}`)] }],
    [`sales.tile.average.${range}`, { reads: ['sales'], blocks: [text(`The average order ${period} is ${average.value}${r.before ? ` (${average.note} on ${r.before.label})` : ''}. Two-piece sets and the clutch lift it; single scarves and totes pull it down.`)] }],
    [`sales.tile.returning.${range}`, { reads: ['sales', 'customers'], blocks: [text(`${returning.value} of orders ${period} came from customers who had ordered before${r.before ? ` (${returning.note})` : ''}. Chioma, Sarah and Zainab order most often.`)] }],
    [`sales.chart.${range}`, { reads: ['sales'], blocks: [text(`Revenue ${period}: ${revenue.value}, best on ${bestDay(range)}.${r.compare ? ` The grey line is ${r.compare.label.toLowerCase()}.` : ''}${range === 'thisWeek' || range === 'thisMonth' ? ' Days still to come are left empty.' : ''}`)] }],
    [
      `sales.orders.${range}`,
      {
        reads: ['sales'],
        blocks: [
          text(
            live
              ? `${orders.value} orders ${period}. ${packing.length} are to pack, all from today: ${packing.map((o) => CUSTOMERS[o.customer].name.split(' ')[0]).join(', ')}. Ife is on packing today.`
              : `${orders.value} orders ${period}, all shipped or delivered.`,
          ),
        ],
      },
    ],
  ];
}

export const SALES_ANSWERS: Record<string, Answer> = Object.fromEntries((Object.keys(RANGES) as SalesRange[]).flatMap(answersFor));

/** Frames while a day is picked: `sales.tile.revenue.day51`, `sales.orders.day51`. */
export function dayAnswer(frameId: string): Answer | undefined {
  const m = frameId.match(/^sales\.(?:tile\.(\w+)|orders)\.day(\d+)$/);
  if (!m) return undefined;
  const day = Number(m[2]);
  const [revenue, orders, average, returning] = dayTiles(day);
  const before = dayBefore(day);
  const vs = (t: SalesTile) => (before && t.tone !== 'muted' ? ` (${t.note} on ${before.label})` : '');
  const when = day === TODAY ? 'today so far' : `on ${dayTitle(day)}`;
  const packing = day === TODAY ? ` ${toPack().length} are still to pack.` : '';
  const say: Record<string, string> = {
    revenue: `${revenue.value} ${when}${vs(revenue)}.`,
    orders: `${orders.value} orders ${when}${vs(orders)}.${packing}`,
    average: `The average order ${when} was ${average.value}${vs(average)}.`,
    returning: `${returning.value} of the orders ${when} came from customers who had ordered before.`,
  };
  return { reads: ['sales'], blocks: [text(m[1] ? say[m[1]] : `${orders.value} orders ${when}, ${revenue.value} in all.${packing}`)] };
}

/** A single order row (`sales.order.1042`, or the same order in a customer's list). */
export function orderAnswer(n: number): Answer | undefined {
  const o = orderByNumber(n);
  if (!o) return undefined;
  const who = CUSTOMERS[o.customer].name;
  const what = `${itemLabel(o).replace(' × ', ', ')} for ${money(o.total)}`;
  const when = o.day === TODAY ? `today at ${clock(o.minute)}` : `${weekdayOf(o.day)} ${dateOf(o.day).d} ${dateOf(o.day).month} at ${clock(o.minute)}`;
  const status =
    o.fulfilment === 'To pack' ? 'It’s paid and waiting to be packed.' : o.fulfilment === 'Shipped' ? 'It’s on its way.' : 'It’s been delivered.';
  const extra = o.number === 1042 ? ' It left this morning, and Chioma has been asking about it since 6:12 AM.' : '';
  return { reads: ['sales'], blocks: [text(`Order #${o.number} from ${who}: ${what}, placed ${when}. ${status}${extra}`)] };
}

