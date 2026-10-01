import type { Answer } from './conversation';
import { SERIES } from './kpis';
import type { AvatarColor, Card, Kpi, KpiReading, LastWeekDay, OrderRow, Snapshot, SourceRow, Swatch, UrgentItem } from './types';

// The seven days of last week, Mon 14 – Sun 20 September, each one selectable on the chart (user
// feedback 2026-10-01: "fix and randomize it").
//
// NOT FROM THE BRIEF. Each day is drawn from the pools below with a seeded random generator, so
// it's varied but the same on every visit. The numbers hold together: KPI values are the chart's
// last-week series, each revenue breakdown adds up to that day's revenue, follower sources to that
// day's followers, footers to the day's KPI. Every product and post has a photo (data/photos.ts).

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;
const SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
export const LAST_WEEK_DAY_TITLES = DAY_NAMES.map((d, i) => `${d}, ${14 + i} Sep`);

// mulberry32: tiny, seedable, good enough for picking rows.
function rng(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
type Rand = () => number;
const between = (r: Rand, lo: number, hi: number) => lo + Math.floor(r() * (hi - lo + 1));
function pick<T>(r: Rand, items: readonly T[], n: number): T[] {
  const pool = [...items];
  const out: T[] = [];
  while (out.length < n && pool.length) out.push(pool.splice(Math.floor(r() * pool.length), 1)[0]);
  return out;
}
const money = (n: number) => `$${n.toLocaleString('en-US')}`;
const compact = (n: number) => `${(n / 1000).toFixed(1)}k`;
const change = (pct: number) => (pct < 0 ? `−${-pct}%` : `+${pct}%`);
const duration = (min: number) => (min < 60 ? `${min}m` : min % 60 === 0 ? `${min / 60}h` : `${Math.floor(min / 60)}h ${min % 60}m`);

// ---- Pools ---------------------------------------------------------------------------------

const PRODUCTS: { id: string; name: string; item: string; swatch: Swatch; price: number; weight: number }[] = [
  { id: 'robe-mocha', name: 'Cotton robe (Mocha)', item: 'Cotton robe (Mocha)', swatch: 'swatch-sand', price: 92, weight: 3 },
  { id: 'scarf-terracotta', name: 'Silk scarf (Terracotta)', item: 'Silk scarf (Terracotta)', swatch: 'swatch-terracotta', price: 85, weight: 3 },
  { id: 'tote-natural', name: 'Canvas tote (Natural)', item: 'Canvas tote (Natural)', swatch: 'swatch-ecru', price: 90, weight: 3 },
  { id: 'linen-sand', name: 'Linen two-piece (Sand)', item: 'Linen two-piece (Sand)', swatch: 'swatch-sand', price: 90, weight: 2 },
  { id: 'linen-olive', name: 'Linen two-piece (Olive)', item: 'Linen two-piece (Olive)', swatch: 'swatch-olive', price: 90, weight: 1 },
  { id: 'kimono-indigo', name: 'Wrap kimono (Indigo)', item: 'Wrap kimono', swatch: 'swatch-indigo', price: 90, weight: 2 },
  { id: 'clutch-gold', name: 'Beaded clutch (Gold)', item: 'Beaded clutch', swatch: 'swatch-sand', price: 115, weight: 1 },
  { id: 'midi-navy', name: 'Pleated midi skirt (Navy)', item: 'Pleated midi skirt', swatch: 'swatch-indigo', price: 92, weight: 1 },
  { id: 'scarf-rust', name: 'Silk scarf (Rust)', item: 'Silk scarf (Rust)', swatch: 'swatch-rust', price: 85, weight: 1 },
  { id: 'adire-blue', name: 'Adire shirt dress (Blue)', item: 'Adire shirt dress', swatch: 'swatch-adire', price: 95, weight: 1 },
];

const CUSTOMERS: { name: string; initials: string; avatar: AvatarColor }[] = [
  { name: 'Ada Williams', initials: 'AW', avatar: 'palette-tone-15' },
  { name: 'Grace Mensah', initials: 'GM', avatar: 'avatar-dayo' },
  { name: 'Chioma Eze', initials: 'CE', avatar: 'palette-tone-17' },
  { name: 'Tolu Bakare', initials: 'TB', avatar: 'avatar-ife' },
  { name: 'Bisi Adeyemi', initials: 'BA', avatar: 'avatar-zee' },
  { name: 'Ngozi Okafor', initials: 'NO', avatar: 'avatar-amara' },
  { name: 'Kemi Lawal', initials: 'KL', avatar: 'palette-tone-15' },
  { name: 'Zainab Bello', initials: 'ZB', avatar: 'palette-tone-17' },
];

const DM_QUOTES = [
  'Is the robe true to size?',
  'Do you ship to Abuja?',
  'Can I swap for a size 14?',
  'When will my parcel arrive?',
  'Do you do gift wrapping?',
  'Is the terracotta scarf back?',
  'Can I collect in person?',
  'I’d like to return the robe',
  'Wrong size in my parcel',
  'Any discount for two totes?',
];

/** Posts live from the day they went up (0 = Mon 14; negative = the weekend before). Dates match
 *  the Instagram page (Figma 1839:3721): kimono restock Sat 19, packing-day story Sun 20. */
const POSTS: { id: string; title: string; meta: string; swatch: Swatch; day: number; reach: number; source: string }[] = [
  { id: 'post-rust', title: 'Three ways to tie the Rust scarf', meta: 'Reel · Sat · by Zee', swatch: 'swatch-rust', day: -2, reach: 0.8, source: 'The scarf reel' },
  { id: 'post-olive', title: 'Olive linen is back', meta: 'Post · Sun · by Zee', swatch: 'swatch-olive', day: -1, reach: 0.7, source: 'The Olive linen post' },
  { id: 'post-clutch', title: 'Wedding guest edit: the gold clutch', meta: 'Post · Mon · by Zee', swatch: 'swatch-sand', day: 0, reach: 0.9, source: 'The wedding-guest post' },
  { id: 'post-mocha', title: 'Slow mornings in the Mocha robe', meta: 'Reel · Wed · by Zee', swatch: 'swatch-sand', day: 2, reach: 1.3, source: 'The Mocha robe reel' },
  { id: 'post-fit-check', title: 'Fit check: Tolu in Sand', meta: 'Reel · Fri · by Zee', swatch: 'post-fit-check', day: 4, reach: 1.6, source: 'The fit-check reel' },
  { id: 'post-kimono', title: 'The kimono restock is live', meta: 'Post · Sat · by Zee', swatch: 'swatch-indigo', day: 5, reach: 1.2, source: 'The kimono post' },
  { id: 'post-packing', title: 'Packing day, behind the scenes', meta: 'Story · Sun · by Zee', swatch: 'swatch-ecru', day: 6, reach: 1, source: 'The packing-day story' },
];

const URGENT: Record<'msg' | 'box' | 'users', { title: string; sub: string; jump: 'customers' | 'inventory' | 'sales'; done: UrgentItem['done'] }[]> = {
  msg: [
    { title: 'Return requests', sub: 'All 3 requests closed', jump: 'customers', done: 'Resolved' },
    { title: 'Delivery questions', sub: 'All 4 answered by 11:30 AM', jump: 'customers', done: 'Resolved' },
    { title: 'Sizing questions on the robe', sub: 'Answered by 10:15 AM', jump: 'customers', done: 'Resolved' },
    { title: 'Late parcel complaint', sub: 'Courier refunded by 3:00 PM', jump: 'customers', done: 'Resolved' },
    { title: 'Exchange requests', sub: '3 exchanges booked', jump: 'customers', done: 'Resolved' },
  ],
  box: [
    { title: 'Mocha robe stock check', sub: 'Supplier confirmed 60 units', jump: 'inventory', done: 'Completed' },
    { title: 'Terracotta scarf reorder', sub: '30 units arriving Friday', jump: 'inventory', done: 'Completed' },
    { title: 'Canvas tote count', sub: '42 units on the shelf', jump: 'inventory', done: 'Completed' },
    { title: 'Linen two-piece size 10 low', sub: 'Restock ordered at 9:15 AM', jump: 'inventory', done: 'Completed' },
    { title: 'Gold clutch display stock', sub: 'Moved 8 to the front shelf', jump: 'inventory', done: 'Completed' },
  ],
  users: [
    { title: 'Post-sale follow-up', sub: '18 customers contacted', jump: 'customers', done: 'Attended' },
    { title: 'VIP early access', sub: '12 customers invited', jump: 'customers', done: 'Attended' },
    { title: 'Review requests', sub: '9 reviews collected', jump: 'customers', done: 'Attended' },
    { title: 'Courier pickup', sub: 'Ife handed over 31 parcels', jump: 'sales', done: 'Attended' },
    { title: 'Wholesale enquiry', sub: 'Dayo replied by 4:40 PM', jump: 'customers', done: 'Attended' },
  ],
};

// ---- One day ---------------------------------------------------------------------------------

function weightedPick(r: Rand, n: number) {
  const bag = PRODUCTS.flatMap((p) => Array(p.weight).fill(p) as (typeof PRODUCTS)[number][]);
  const out: (typeof PRODUCTS)[number][] = [];
  while (out.length < n) {
    const p = bag[Math.floor(r() * bag.length)];
    if (!out.includes(p)) out.push(p);
  }
  return out;
}

/** Splits `total` into whole parts by `weights`, largest remainder, so they add up exactly. */
function split(total: number, weights: number[]) {
  const sum = weights.reduce((a, b) => a + b, 0);
  const raw = weights.map((w) => (total * w) / sum);
  const parts = raw.map(Math.floor);
  const order = raw.map((v, i) => [v - Math.floor(v), i] as const).sort((a, b) => b[0] - a[0]);
  for (let k = 0; k < total - parts.reduce((a, b) => a + b, 0); k++) parts[order[k][1]]++;
  return parts;
}

function time(r: Rand) {
  const minutes = between(r, 9 * 60, 20 * 60);
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h > 12 ? h - 12 : h}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

function buildDay(d: number): { snapshot: Snapshot; answer: Answer } {
  const r = rng(1409 + d * 7919);
  const s = (k: Kpi) => SERIES[k].lastWeek[d];
  const reading = (k: Kpi): KpiReading => {
    const pct = between(r, -8, 18);
    return { value: s(k), note: change(pct), noteTone: pct < 0 ? 'danger' : 'success' };
  };

  // Revenue: three top sellers taking ~45–60% of the day; the rest is "Everything else".
  const revenue = s('revenue');
  const top = weightedPick(r, 3);
  const shares = [between(r, 20, 28), between(r, 13, 18), between(r, 8, 12)];
  const products = top.map((p, i) => {
    const sold = Math.max(1, Math.round((revenue * shares[i]) / 100 / p.price));
    const amount = sold * p.price;
    return { id: p.id, name: p.name, swatch: p.swatch, sold, share: Math.round((amount / revenue) * 100), amount };
  });
  const rest = revenue - products.reduce((a, p) => a + p.amount, 0);

  // Orders: three of the day's orders, all delivered by now.
  const orders: OrderRow[] = pick(r, CUSTOMERS, 3).map((c, i) => {
    const p = PRODUCTS[between(r, 0, PRODUCTS.length - 1)];
    const qty = between(r, 1, 3);
    return { id: `order-lw${d}-${i}`, customer: c.name, initials: c.initials, avatar: c.avatar, item: p.item, qty, time: time(r), amount: qty * p.price, status: 'Delivered', tone: 'success' };
  });

  // Likes: the three most-liked posts that were up that day (newer posts get more).
  const live = POSTS.filter((p) => p.day <= d);
  const scored = live
    .map((p) => ({ p, score: p.reach * (d - p.day <= 1 ? 1.6 : 1) * (0.7 + r() * 0.6) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
  const likes = s('likes');
  const postLikes = split(Math.round(likes * (0.62 + r() * 0.12)), scored.map((x) => x.score)).map((n) => Math.round(n / 100) * 100);
  const posts = scored.map(({ p }, i) => ({ id: p.id, title: p.title, meta: p.meta, swatch: p.swatch, likes: postLikes[i] }));

  // Followers: the day's best post, profile visits, shares — adding up to the day's count.
  const followers = s('followers');
  const sourceLabels = [scored[0].p.source, 'Profile visits', 'Shares and tags'];
  const counts = split(followers, [between(r, 40, 60), between(r, 20, 32), between(r, 12, 22)]);
  const percents = split(100, counts);
  const sources: SourceRow[] = sourceLabels.map((label, i) => ({ id: `source-lw${d}-${i}`, label, count: counts[i], share: percents[i] }));

  // DMs: all answered; the three slowest replies.
  const waits = [between(r, 60, 190), between(r, 35, 59), between(r, 15, 34)];
  const dms = pick(r, CUSTOMERS, 3).map((c, i) => ({
    id: `dm-lw${d}-${i}`,
    customer: c.name,
    initials: c.initials,
    avatar: c.avatar,
    quote: DM_QUOTES[between(r, 0, DM_QUOTES.length - 1)],
    waiting: `Replied in ${duration(waits[i])}`,
    tone: 'success' as const,
  }));

  const cards: Record<Kpi, Card> = {
    revenue: { kind: 'products', link: { label: 'Open Sales', page: 'sales' }, rows: products, footer: ['Everything else', money(rest)] },
    orders: { kind: 'orders', link: { label: 'Open Sales', page: 'sales' }, rows: orders, footer: [`${s('orders')} orders`, 'all delivered'] },
    likes: { kind: 'posts', link: { label: 'Open Instagram', page: 'instagram' }, rows: posts, footer: [`Across ${live.length} posts`, `${compact(likes)} likes`] },
    followers: { kind: 'sources', link: { label: 'Open Instagram', page: 'instagram' }, rows: sources, footer: [`${followers} new followers`, change(between(r, -6, 20))] },
    dms: { kind: 'dms', link: { label: 'Open Customers', page: 'customers' }, rows: dms, footer: [`${s('dms')} DMs, all answered`, `slowest ${duration(waits[0])}`] },
  };

  const urgentItems = (['msg', 'box', 'users'] as const).map((icon) => {
    const it = URGENT[icon][between(r, 0, URGENT[icon].length - 1)];
    return { id: `lw${d}-${icon}`, icon, title: it.title, sub: it.sub, jumpTarget: it.jump, done: it.done } satisfies UrgentItem;
  });

  const key = `lw${d}` as LastWeekDay;
  return {
    snapshot: {
      key,
      kpis: { revenue: reading('revenue'), orders: reading('orders'), likes: reading('likes'), followers: reading('followers'), dms: { value: 0, note: 'all answered', noteTone: 'success' } },
      cards,
      urgent: urgentItems,
    },
    answer: {
      reads: ['customers', 'inventory'],
      blocks: [
        {
          kind: 'text',
          text: `Nothing from ${DAY_NAMES[d]} is still open. ${urgentItems.map((u) => `${u.title}: ${u.sub.charAt(0).toLowerCase()}${u.sub.slice(1)}`).join('. ')}.`,
        },
      ],
    },
  };
}

const DAYS = SHORT.map((_, d) => buildDay(d));

export const LAST_WEEK_DAYS = Object.fromEntries(DAYS.map((x) => [x.snapshot.key, x.snapshot])) as Record<LastWeekDay, Snapshot>;

/** Hop's answer about each day's Urgent card (frame id `analytics.urgent-lw0` …). */
export const LAST_WEEK_URGENT_ANSWERS: Record<string, Answer> = Object.fromEntries(DAYS.map((x) => [`analytics.urgent-${x.snapshot.key}`, x.answer]));
