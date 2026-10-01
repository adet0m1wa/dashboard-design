import type { Snapshot } from './types';

// Last week, Mon 14 – Sun 20 September (brief A7, frame "Analytics - Last week selected").
export const lastWeek: Snapshot = {
  key: 'lastWeek',
  kpis: {
    revenue: { value: 15810, note: '+7%', noteTone: 'success' },
    orders: { value: 209, note: '+5%', noteTone: 'success' },
    likes: { value: 79700, note: '+12%', noteTone: 'success' },
    // Brief and Figma both show 981; the daily series sums to 881. Shown as designed — flagged in the report.
    followers: { value: 981, note: '+14%', noteTone: 'success' },
    dms: { value: 0, note: 'all answered', noteTone: 'success' },
  },
  cards: {
    revenue: {
      kind: 'products',
      link: { label: 'Open Sales', page: 'sales' },
      rows: [
        { id: 'robe-mocha', name: 'Cotton robe (Mocha)', swatch: 'swatch-sand', sold: 31, share: 18, amount: 2860 },
        { id: 'scarf-terracotta', name: 'Silk scarf (Terracotta)', swatch: 'swatch-terracotta', sold: 24, share: 14, amount: 2040 },
        { id: 'tote-natural', name: 'Canvas tote (Natural)', swatch: 'swatch-indigo', sold: 19, share: 11, amount: 1710 },
      ],
      // Figma says $8,800, which doesn't add up: $15,810 − $6,610 = $9,200 (brief B11 #1).
      footer: ['Everything else', '$9,200'],
    },
    // The Orders, Likes, Followers and DMs cards aren't designed for past periods: written for the
    // prototype (user feedback 2026-09-30) from this period's KPIs. Replace freely.
    orders: {
      kind: 'orders',
      link: { label: 'Open Sales', page: 'sales' },
      rows: [
        { id: 'order-lw-ada', customer: 'Ada Williams', initials: 'AW', avatar: 'palette-tone-15', item: 'Silk scarf (Terracotta)', qty: 3, time: 'Sat 2:15 PM', amount: 255, status: 'Delivered', tone: 'success' },
        { id: 'order-lw-grace', customer: 'Grace Mensah', initials: 'GM', avatar: 'avatar-dayo', item: 'Cotton robe (Mocha)', qty: 2, time: 'Sun 5:30 PM', amount: 184, status: 'Delivered', tone: 'success' },
        { id: 'order-lw-chioma', customer: 'Chioma Eze', initials: 'CE', avatar: 'palette-tone-17', item: 'Canvas tote (Natural)', qty: 2, time: 'Fri 11:40 AM', amount: 180, status: 'Delivered', tone: 'success' },
      ],
      footer: ['209 orders', 'all delivered'],
    },
    likes: {
      kind: 'posts',
      link: { label: 'Open Instagram', page: 'instagram' },
      rows: [
        { id: 'post-fit-check', title: 'Fit check: Tolu in Sand', meta: 'Reel · Fri · by Zee', swatch: 'post-fit-check', likes: 24300 },
        { id: 'post-kimono', title: 'The kimono restock is live', meta: 'Post · Sat · by Zee', swatch: 'swatch-indigo', likes: 11800 },
        { id: 'post-packing', title: 'Packing day, behind the scenes', meta: 'Story · Sun · by Zee', swatch: 'swatch-ecru', likes: 8900 },
      ],
      footer: ['Across 21 posts', '79.7k likes'],
    },
    followers: {
      kind: 'sources',
      link: { label: 'Open Instagram', page: 'instagram' },
      rows: [
        { id: 'source-fit-check', label: 'The fit-check reel', count: 520, share: 53 },
        { id: 'source-profile', label: 'Profile visits', count: 280, share: 29 },
        { id: 'source-shares', label: 'Shares and tags', count: 181, share: 18 },
      ],
      footer: ['981 new followers', '+14%'],
    },
    dms: {
      kind: 'dms',
      link: { label: 'Open Customers', page: 'customers' },
      rows: [
        { id: 'dm-lw-grace', customer: 'Grace Mensah', initials: 'GM', avatar: 'avatar-dayo', quote: 'I’d like to return the robe', waiting: 'Replied in 3h', tone: 'success' },
        { id: 'dm-lw-ada', customer: 'Ada Williams', initials: 'AW', avatar: 'palette-tone-15', quote: 'Wrong size in my parcel', waiting: 'Replied in 2h 10m', tone: 'success' },
        { id: 'dm-lw-chioma', customer: 'Chioma Eze', initials: 'CE', avatar: 'palette-tone-17', quote: 'Is the Mocha robe back?', waiting: 'Replied in 1h 25m', tone: 'success' },
      ],
      footer: ['38 DMs, all answered', 'slowest 3h'],
    },
  },
  urgent: [
    {
      id: 'lw-returns',
      icon: 'msg',
      title: 'Weekend return requests',
      sub: 'All 7 requests closed',
      jumpTarget: 'customers',
      done: 'Resolved',
    },
    {
      id: 'lw-mocha',
      icon: 'box',
      title: 'Mocha robe stock check',
      sub: 'Supplier confirmed 60 units',
      jumpTarget: 'inventory',
      done: 'Completed',
    },
    {
      id: 'lw-followup',
      icon: 'users',
      title: 'Post-sale customer follow-up',
      sub: '18 customers contacted',
      jumpTarget: 'customers',
      done: 'Attended',
    },
  ],
};
