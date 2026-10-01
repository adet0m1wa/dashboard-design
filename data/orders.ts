import { SERIES } from './kpis';
import { between, rng, split, type Rand } from './random';
import type { AvatarColor } from './types';

// Every order since the online store opened (user feedback 2026-10-01: Sales by week, month and
// all time, "the serial will start from 1"). NOT FROM THE BRIEF.
//
// The store opened on Mon 3 Aug 2026 with order #1; today is Thu 24 Sep, 2:30 PM. The orders are
// generated with a seeded random generator (the same on every load) but pinned to what the rest
// of the prototype says:
//   • this week's and last week's orders and revenue per day are the Analytics series, exactly;
//   • Chioma's Linen two-piece, paid yesterday at 3:41 PM, is #1042 (History, Customers);
//   • today's 6 to pack are the six customers in the inbox who ordered today, at the times their
//     messages imply; every named customer's history is written out below;
//   • the Adire shirt dress sold out on Monday, so nobody orders it after that.
// Order numbers follow the time an order was placed. The six weeks before last week grow from a
// slow start; their size is whatever makes Chioma's order land on #1042.

export type Fulfilment = 'To pack' | 'Shipped' | 'Delivered';

export interface Product {
  id: string; // data/photos.ts
  name: string;
  price: number;
}

export interface Customer {
  id: string;
  name: string;
  initials: string;
  avatar: AvatarColor;
}

export interface Order {
  number: number;
  day: number; // 0 = Mon 3 Aug … TODAY = Thu 24 Sep
  minute: number; // since midnight
  customer: string; // Customer id
  productId: string;
  qty: number;
  total: number;
  fulfilment: Fulfilment;
}

export const DAY_COUNT = 53; // Mon 3 Aug … Thu 24 Sep
export const TODAY = DAY_COUNT - 1;
export const THIS_WEEK = 49; // Mon 21 Sep
export const LAST_WEEK = 42; // Mon 14 Sep
export const SEPTEMBER = 29; // Tue 1 Sep
const NOW = 14 * 60 + 30;

export const PRODUCTS: Product[] = [
  { id: 'linen-sand', name: 'Linen two-piece (Sand)', price: 90 },
  { id: 'linen-olive', name: 'Linen two-piece (Olive)', price: 90 },
  { id: 'slip-emerald', name: 'Satin slip dress (Emerald)', price: 90 },
  { id: 'kimono-indigo', name: 'Wrap kimono (Indigo)', price: 90 },
  { id: 'trousers-ecru', name: 'Wide-leg trousers (Ecru)', price: 70 },
  { id: 'adire-blue', name: 'Adire shirt dress', price: 110 },
  { id: 'shirt-white', name: 'Linen shirt (White)', price: 75 },
  { id: 'scarf-rust', name: 'Silk scarf (Rust)', price: 45 },
  { id: 'scarf-terracotta', name: 'Silk scarf (Terracotta)', price: 45 },
  { id: 'robe-mocha', name: 'Cotton robe (Mocha)', price: 85 },
  { id: 'tote-natural', name: 'Canvas tote (Natural)', price: 45 },
  { id: 'midi-navy', name: 'Pleated midi skirt (Navy)', price: 80 },
  { id: 'clutch-gold', name: 'Beaded clutch (Gold)', price: 115 },
  { id: 'poplin-white', name: 'Poplin shirt (White)', price: 65 },
];
const WEIGHT: Record<string, number> = {
  'linen-sand': 8, 'linen-olive': 4, 'slip-emerald': 5, 'kimono-indigo': 3, 'trousers-ecru': 4, 'adire-blue': 2, 'shirt-white': 3,
  'scarf-rust': 5, 'scarf-terracotta': 4, 'robe-mocha': 3, 'tote-natural': 4, 'midi-navy': 2, 'clutch-gold': 2, 'poplin-white': 3,
};
export const product = (id: string) => PRODUCTS.find((p) => p.id === id) ?? PRODUCTS[0];

// The customers in the inbox (data/customers.ts) and every order they've placed.
const NAMED: Customer[] = [
  { id: 'chioma', name: 'Chioma Eze', initials: 'CE', avatar: 'palette-tone-17' },
  { id: 'tolu', name: 'Tolu Bakare', initials: 'TB', avatar: 'avatar-ife' },
  { id: 'grace', name: 'Grace Mensah', initials: 'GM', avatar: 'avatar-dayo' },
  { id: 'nneka', name: 'Nneka Uche', initials: 'NU', avatar: 'status-info' },
  { id: 'bisi', name: 'Bisi Adeyemi', initials: 'BA', avatar: 'avatar-zee' },
  { id: 'funke', name: 'Funke Ola', initials: 'FO', avatar: 'avatar-ife' },
  { id: 'zainab', name: 'Zainab Bello', initials: 'ZB', avatar: 'palette-tone-17' },
  { id: 'ngozi', name: 'Ngozi Okafor', initials: 'NO', avatar: 'avatar-amara' },
  { id: 'ada', name: 'Ada Williams', initials: 'AW', avatar: 'palette-tone-15' },
  { id: 'kemi', name: 'Kemi Lawal', initials: 'KL', avatar: 'palette-tone-15' },
  { id: 'sarah', name: 'Sarah Kim', initials: 'SK', avatar: 'status-info' },
];

type Pin = { customer: string; day: number; at: string; productId: string; qty?: number; fulfilment?: Fulfilment };
const PINNED: Pin[] = [
  // Chioma (VIP): gifts for her sister, and the Sand set she's waiting on
  { customer: 'chioma', day: 3, at: '7:15 PM', productId: 'scarf-rust' },
  { customer: 'chioma', day: 11, at: '8:02 PM', productId: 'kimono-indigo' },
  { customer: 'chioma', day: 19, at: '1:40 PM', productId: 'linen-olive' },
  { customer: 'chioma', day: 27, at: '6:20 PM', productId: 'slip-emerald' },
  { customer: 'chioma', day: 34, at: '11:05 AM', productId: 'clutch-gold' },
  { customer: 'chioma', day: 42, at: '9:30 PM', productId: 'robe-mocha' },
  { customer: 'chioma', day: 51, at: '3:38 PM', productId: 'linen-sand', fulfilment: 'Shipped' }, // order 1042
  // Tolu: modelled the Sand set; ordered the slip dress this morning
  { customer: 'tolu', day: 17, at: '12:30 PM', productId: 'linen-sand' },
  { customer: 'tolu', day: 31, at: '8:45 PM', productId: 'trousers-ecru' },
  { customer: 'tolu', day: 45, at: '10:10 AM', productId: 'scarf-terracotta' },
  { customer: 'tolu', day: 52, at: '10:41 AM', productId: 'slip-emerald', fulfilment: 'To pack' },
  // Grace (Accra): wants to change the address on today's order
  { customer: 'grace', day: 8, at: '4:50 PM', productId: 'linen-olive' },
  { customer: 'grace', day: 16, at: '9:20 AM', productId: 'shirt-white' },
  { customer: 'grace', day: 24, at: '7:35 PM', productId: 'trousers-ecru' },
  { customer: 'grace', day: 33, at: '2:10 PM', productId: 'robe-mocha' },
  { customer: 'grace', day: 44, at: '6:05 PM', productId: 'scarf-rust' },
  { customer: 'grace', day: 52, at: '11:56 AM', productId: 'linen-sand', qty: 2, fulfilment: 'To pack' },
  // Nneka: one scarf so far
  { customer: 'nneka', day: 36, at: '8:15 PM', productId: 'scarf-rust' },
  // Bisi: first order today
  { customer: 'bisi', day: 52, at: '10:05 AM', productId: 'tote-natural', fulfilment: 'To pack' },
  // Funke: the skirt that's a little long
  { customer: 'funke', day: 30, at: '5:25 PM', productId: 'shirt-white' },
  { customer: 'funke', day: 50, at: '9:12 AM', productId: 'midi-navy', fulfilment: 'Delivered' },
  // Zainab (VIP): buys for weddings
  { customer: 'zainab', day: 13, at: '9:40 PM', productId: 'clutch-gold' },
  { customer: 'zainab', day: 22, at: '8:25 PM', productId: 'adire-blue' },
  { customer: 'zainab', day: 29, at: '10:50 AM', productId: 'clutch-gold', qty: 2 },
  { customer: 'zainab', day: 40, at: '7:05 PM', productId: 'slip-emerald' },
  { customer: 'zainab', day: 50, at: '4:45 PM', productId: 'clutch-gold', fulfilment: 'Delivered' },
  // Ngozi
  { customer: 'ngozi', day: 26, at: '1:15 PM', productId: 'linen-sand' },
  { customer: 'ngozi', day: 41, at: '9:05 PM', productId: 'poplin-white' },
  { customer: 'ngozi', day: 52, at: '9:40 AM', productId: 'linen-olive', fulfilment: 'To pack' },
  // Ada: runs @stylebyada; wants the kimono by Saturday
  { customer: 'ada', day: 10, at: '3:30 PM', productId: 'slip-emerald' },
  { customer: 'ada', day: 21, at: '11:45 AM', productId: 'trousers-ecru' },
  { customer: 'ada', day: 35, at: '6:40 PM', productId: 'adire-blue' },
  { customer: 'ada', day: 46, at: '12:20 PM', productId: 'scarf-terracotta' },
  { customer: 'ada', day: 52, at: '2:16 PM', productId: 'kimono-indigo', fulfilment: 'To pack' },
  // Kemi: got Monday's order yesterday, ordered two scarves today
  { customer: 'kemi', day: 38, at: '7:55 PM', productId: 'tote-natural' },
  { customer: 'kemi', day: 49, at: '1:05 PM', productId: 'linen-sand', fulfilment: 'Delivered' },
  { customer: 'kemi', day: 52, at: '11:20 AM', productId: 'scarf-rust', qty: 2, fulfilment: 'To pack' },
  // Sarah (VIP, London): a kimono a week, more or less
  { customer: 'sarah', day: 5, at: '10:30 AM', productId: 'kimono-indigo' },
  { customer: 'sarah', day: 12, at: '9:15 AM', productId: 'shirt-white' },
  { customer: 'sarah', day: 18, at: '8:40 PM', productId: 'linen-sand' },
  { customer: 'sarah', day: 25, at: '11:00 AM', productId: 'robe-mocha' },
  { customer: 'sarah', day: 32, at: '7:20 PM', productId: 'clutch-gold' },
  { customer: 'sarah', day: 39, at: '10:05 AM', productId: 'poplin-white' },
  { customer: 'sarah', day: 44, at: '9:50 AM', productId: 'slip-emerald' },
  { customer: 'sarah', day: 50, at: '11:10 AM', productId: 'kimono-indigo', fulfilment: 'Shipped' },
];

const FIRST = ['Adaeze', 'Amaka', 'Blessing', 'Bukola', 'Chiamaka', 'Damilola', 'Ebun', 'Efua', 'Esther', 'Fatima', 'Folake', 'Hauwa', 'Ifeoma', 'Jumoke', 'Kehinde', 'Kofi', 'Lara', 'Lola', 'Maryam', 'Mojisola', 'Nkechi', 'Obiageli', 'Ope', 'Precious', 'Rukayat', 'Sade', 'Simi', 'Temi', 'Titi', 'Uche', 'Wunmi', 'Yetunde', 'Zara', 'Akosua', 'Abena', 'Naomi', 'Hannah', 'Leah', 'Mariam', 'Tobi', 'Ola', 'Dara', 'Kiki', 'Nana', 'Ruth', 'Joy', 'Ife', 'Toke'];
const LAST = ['Adebayo', 'Okeke', 'Mensah', 'Okafor', 'Balogun', 'Nwosu', 'Abubakar', 'Asante', 'Oyelaran', 'Eze', 'Danjuma', 'Owusu', 'Adeleke', 'Ibekwe', 'Lawal', 'Ogunleye', 'Bello', 'Obi', 'Adeyemi', 'Agyeman', 'Okonkwo', 'Salami', 'Effiong', 'Ojo', 'Nnaji', 'Boateng', 'Akande', 'Usman', 'Ekwueme', 'Fashola', 'Amadi', 'Coker', 'Ibrahim', 'Oduya', 'Martins', 'Johnson', 'Daniels', 'Peters', 'Ansah', 'Kalu', 'Onyeka', 'Sowore', 'Etim', 'Ugwu', 'Alabi', 'Bassey', 'Quaye', 'Nkem'];
const AVATARS: AvatarColor[] = ['avatar-ife', 'avatar-dayo', 'avatar-zee', 'avatar-amara', 'palette-tone-15', 'palette-tone-17', 'status-info'];

const minuteOf = (at: string) => {
  const [hm, ap] = at.split(' ');
  const [h, m] = hm.split(':').map(Number);
  return ((h % 12) + (ap === 'PM' ? 12 : 0)) * 60 + m;
};

/** A time of day orders come in at: mostly 7 AM – midnight, busiest in the evening. */
function orderMinute(r: Rand, latest = 24 * 60 - 5) {
  for (;;) {
    const m = r() < 0.08 ? between(r, 5, 7 * 60) : between(r, 7 * 60, 24 * 60 - 5);
    const evening = m >= 18 * 60 && m < 22 * 60;
    if (m <= latest && (evening || r() < 0.72)) return m;
  }
}

function weightedProduct(r: Rand, day: number) {
  const pool = PRODUCTS.filter((p) => !(p.id === 'adire-blue' && day >= THIS_WEEK + 1)); // sold out Monday
  const total = pool.reduce((s, p) => s + WEIGHT[p.id], 0);
  let x = r() * total;
  for (const p of pool) if ((x -= WEIGHT[p.id]) < 0) return p;
  return pool[pool.length - 1];
}

function build() {
  const r = rng(20260803);
  const pins = PINNED.map((p) => ({ ...p, minute: minuteOf(p.at) }));

  // Wednesday first: where Chioma's 3:38 PM order falls among the day's 41 sets how many orders
  // came before this week.
  const wedCount = SERIES.orders.thisWeek[2];
  const wedTimes = Array.from({ length: wedCount - 1 }, () => orderMinute(r));
  const chiomaAt = minuteOf('3:38 PM');
  const beforeChioma = wedTimes.filter((m) => m < chiomaAt).length;
  const thisWeekBefore = SERIES.orders.thisWeek[0] + SERIES.orders.thisWeek[1];
  const lastWeekTotal = SERIES.orders.lastWeek.reduce((a, b) => a + b, 0);
  const earlier = 1042 - 1 - beforeChioma - thisWeekBefore - lastWeekTotal; // the six weeks before last week

  const counts: number[] = [];
  const weeks = split(earlier, [7, 11, 14, 19, 23, 26]);
  weeks.forEach((w) => counts.push(...split(w, [13, 13, 14, 14, 15, 17, 14].map((x) => x + r() * 3))));
  counts.push(...SERIES.orders.lastWeek, ...SERIES.orders.thisWeek);

  const revenue: number[] = counts.map((n, d) => {
    if (d >= THIS_WEEK) return SERIES.revenue.thisWeek[d - THIS_WEEK];
    if (d >= LAST_WEEK) return SERIES.revenue.lastWeek[d - LAST_WEEK];
    return Math.round((n * between(r, 70, 79)) / 10) * 10;
  });

  type Draft = Omit<Order, 'number' | 'customer' | 'fulfilment'> & { customer?: string; fulfilment?: Fulfilment };
  const drafts: Draft[] = [];
  for (let d = 0; d < DAY_COUNT; d++) {
    const pinned: Draft[] = pins
      .filter((p) => p.day === d)
      .map((p) => ({ day: d, minute: p.minute, customer: p.customer, productId: p.productId, qty: p.qty ?? 1, total: product(p.productId).price * (p.qty ?? 1), fulfilment: p.fulfilment }));
    const times = d === 51 ? wedTimes : Array.from({ length: counts[d] - pinned.length }, () => orderMinute(r, d === TODAY ? NOW - 2 : undefined));
    const made: Draft[] = times.map((minute) => {
      const p = weightedProduct(r, d);
      const qty = r() < 0.07 ? 2 : 1;
      return { day: d, minute, productId: p.id, qty, total: p.price * qty };
    });

    // Make the day's takings exact: swap products until the gap is small, then spread what's
    // left as delivery fees and discounts (a few dollars an order).
    const target = revenue[d] - pinned.reduce((s, o) => s + o.total, 0);
    const gap = () => target - made.reduce((s, o) => s + o.total, 0);
    for (let guard = 0; guard < 400 && made.length; guard++) {
      const e = gap();
      if (e >= -3 * made.length && e <= 4 * made.length) break;
      const o = made[Math.floor(r() * made.length)];
      const p = product(o.productId);
      const options = PRODUCTS.filter((q) => (e < 0 ? q.price < p.price : q.price > p.price) && !(q.id === 'adire-blue' && d >= THIS_WEEK + 1));
      if (e < 0 && o.qty === 2) o.qty = 1;
      else if (options.length) o.productId = options[Math.floor(r() * options.length)].id;
      o.total = product(o.productId).price * o.qty;
    }
    const fees = split(Math.abs(gap()), made.map(() => 0.5 + r()));
    const sign = gap() < 0 ? -1 : 1;
    made.forEach((o, i) => (o.total += sign * fees[i]));

    drafts.push(...[...pinned, ...made].sort((a, b) => a.minute - b.minute));
  }

  // Customers: a new name for most orders; about a third come back.
  const customers: Record<string, Customer> = Object.fromEntries(NAMED.map((c) => [c.id, c]));
  const returning: string[] = [];
  const used = new Set(NAMED.map((c) => c.name));
  const orders: Order[] = drafts.map((o, i) => {
    let customer = o.customer;
    if (!customer) {
      if (returning.length > 20 && r() < 0.34) customer = returning[Math.floor(r() * returning.length)];
      else {
        let name = '';
        do name = `${FIRST[Math.floor(r() * FIRST.length)]} ${LAST[Math.floor(r() * LAST.length)]}`;
        while (used.has(name));
        used.add(name);
        customer = `c${i + 1}`;
        const [f, l] = name.split(' ');
        customers[customer] = { id: customer, name, initials: f[0] + l[0], avatar: AVATARS[Math.floor(r() * AVATARS.length)] };
        returning.push(customer);
      }
    }
    const age = TODAY - o.day;
    const fulfilment = o.fulfilment ?? (age <= 1 ? 'Shipped' : age === 2 ? (r() < 0.5 ? 'Shipped' : 'Delivered') : 'Delivered');
    return { number: i + 1, day: o.day, minute: o.minute, customer, productId: o.productId, qty: o.qty, total: o.total, fulfilment };
  });

  const chioma = orders.find((o) => o.customer === 'chioma' && o.day === 51);
  if (chioma?.number !== 1042) throw new Error(`data/orders: Chioma's order is number ${chioma?.number}, not 1042`);
  return { orders, customers };
}

const built = build();

/** Every order, #1 first. */
export const ORDERS: Order[] = built.orders;
export const CUSTOMERS: Record<string, Customer> = built.customers;
export const orderByNumber = (n: number) => ORDERS[n - 1];
export const ordersOf = (customer: string) => ORDERS.filter((o) => o.customer === customer);
export const DAY_REVENUE: number[] = Array.from({ length: DAY_COUNT }, (_, d) => ORDERS.filter((o) => o.day === d).reduce((s, o) => s + o.total, 0));

// Dates. Day 0 is Mon 3 Aug 2026; day 29 is Tue 1 Sep.
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
export const weekdayOf = (day: number) => WEEKDAYS[day % 7];
export const dateOf = (day: number) => (day < SEPTEMBER ? { d: day + 3, m: 8, month: 'Aug' } : { d: day - SEPTEMBER + 1, m: 9, month: 'Sep' });
export const shortDate = (day: number) => `${dateOf(day).d} ${dateOf(day).month}`; // "12 Sep"
export const numericDate = (day: number) => {
  const { d, m } = dateOf(day);
  return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/26`; // "12/09/26"
};
export const clock = (minute: number) => {
  const h = Math.floor(minute / 60);
  return `${h % 12 === 0 ? 12 : h % 12}:${String(minute % 60).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
};
export const itemLabel = (o: Order) => `${product(o.productId).name} × ${o.qty}`;
