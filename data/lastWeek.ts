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
      title: 'Top revenue generators · last week',
      link: { label: 'Open Sales', page: 'sales' },
      rows: [
        { id: 'robe-mocha', name: 'Cotton robe (Mocha)', swatch: 'swatch-sand', sold: 31, share: 18, amount: 2860 },
        { id: 'scarf-terracotta', name: 'Silk scarf (Terracotta)', swatch: 'swatch-terracotta', sold: 24, share: 14, amount: 2040 },
        { id: 'tote-natural', name: 'Canvas tote (Natural)', swatch: 'swatch-indigo', sold: 19, share: 11, amount: 1710 },
      ],
      // Figma says $8,800, which doesn't add up: $15,810 − $6,610 = $9,200 (brief B11 #1).
      footer: ['Everything else', '$9,200'],
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
