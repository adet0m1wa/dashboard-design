import type { Snapshot } from './types';

// Wednesday 23 September — the past day designed in "Analytics — Wednesday selected" (brief A7).
export const wednesday: Snapshot = {
  key: 'wed',
  kpis: {
    revenue: { value: 3120, note: '+30%', noteTone: 'success' },
    orders: { value: 41, note: '+32%', noteTone: 'success' },
    likes: { value: 21600, note: '+80%', noteTone: 'success' },
    followers: { value: 310, note: '+182%', noteTone: 'success' },
    dms: { value: 0, note: 'all answered', noteTone: 'success' },
  },
  cards: {
    revenue: {
      kind: 'products',
      title: 'Top revenue generators · Wed',
      link: { label: 'Open Sales', page: 'sales' },
      // Figma reuses the sand / emerald / indigo swatches for these rows.
      rows: [
        { id: 'midi-navy', name: 'Pleated midi skirt (Navy)', swatch: 'swatch-sand', sold: 10, share: 29, amount: 920 },
        { id: 'poplin-white', name: 'Cotton poplin shirt (White)', swatch: 'swatch-emerald', sold: 7, share: 21, amount: 665 },
        { id: 'clutch-gold', name: 'Beaded clutch (Gold)', swatch: 'swatch-indigo', sold: 5, share: 15, amount: 575 },
      ],
      footer: ['Everything else', '$960'],
    },
  },
  urgent: [
    {
      id: 'wed-addresses',
      icon: 'msg',
      title: '2 delivery addresses incomplete',
      sub: 'Both updated by 10:30 AM',
      jumpTarget: 'customers',
      done: 'Resolved',
    },
    {
      id: 'wed-emerald',
      icon: 'box',
      title: 'Emerald dress size 12 low',
      sub: 'Restocked before noon',
      jumpTarget: 'inventory',
      done: 'Completed',
    },
    {
      id: 'wed-dms',
      icon: 'users',
      title: '4 priority DMs',
      sub: 'Dayo replied by 1:15 PM',
      jumpTarget: 'customers',
      done: 'Attended',
    },
  ],
};
