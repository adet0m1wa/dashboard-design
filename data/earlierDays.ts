import type { Snapshot } from './types';

// Monday 21 and Tuesday 22 September.
//
// NOT FROM THE BRIEF. The brief only designs Wednesday, but any past day on the chart can be
// selected. KPI values here come straight from the chart series (A7), and the % changes are
// against the same day last week, the same rule that produces Wednesday's numbers. The product
// breakdowns and done items were written for the prototype so Mon/Tue don't look broken; each
// breakdown adds up to that day's revenue. Replace freely.
export const monday: Snapshot = {
  key: 'mon',
  kpis: {
    revenue: { value: 1920, note: '−6%', noteTone: 'danger' },
    orders: { value: 26, note: '−4%', noteTone: 'danger' },
    likes: { value: 9800, note: '−3%', noteTone: 'danger' },
    followers: { value: 96, note: '+9%', noteTone: 'success' },
    dms: { value: 0, note: 'all answered', noteTone: 'success' },
  },
  cards: {
    revenue: {
      kind: 'products',
      title: 'Top revenue generators · Mon',
      link: { label: 'Open Sales', page: 'sales' },
      rows: [
        { id: 'linen-sand', name: 'Linen two-piece (Sand)', swatch: 'swatch-sand', sold: 6, share: 28, amount: 540 },
        { id: 'kimono-indigo', name: 'Wrap kimono (Indigo)', swatch: 'swatch-indigo', sold: 5, share: 23, amount: 450 },
        { id: 'slip-emerald', name: 'Satin slip dress (Emerald)', swatch: 'swatch-emerald', sold: 3, share: 14, amount: 270 },
      ],
      footer: ['Everything else', '$660'],
    },
  },
  urgent: [
    {
      id: 'mon-weekend',
      icon: 'msg',
      title: 'Delivery questions from the weekend',
      sub: 'All 5 answered by 11:00 AM',
      jumpTarget: 'customers',
      done: 'Resolved',
    },
    {
      id: 'mon-kimono',
      icon: 'box',
      title: 'Wrap kimono size 10 low',
      sub: 'Restock ordered at 9:40 AM',
      jumpTarget: 'inventory',
      done: 'Completed',
    },
    {
      id: 'mon-backlog',
      icon: 'users',
      title: 'Monday DM backlog',
      sub: 'Dayo cleared it by noon',
      jumpTarget: 'customers',
      done: 'Attended',
    },
  ],
};

export const tuesday: Snapshot = {
  key: 'tue',
  kpis: {
    revenue: { value: 2380, note: '+13%', noteTone: 'success' },
    orders: { value: 30, note: '+15%', noteTone: 'success' },
    likes: { value: 11400, note: '+20%', noteTone: 'success' },
    followers: { value: 120, note: '+30%', noteTone: 'success' },
    dms: { value: 0, note: 'all answered', noteTone: 'success' },
  },
  cards: {
    revenue: {
      kind: 'products',
      title: 'Top revenue generators · Tue',
      link: { label: 'Open Sales', page: 'sales' },
      rows: [
        { id: 'slip-emerald', name: 'Satin slip dress (Emerald)', swatch: 'swatch-emerald', sold: 8, share: 30, amount: 720 },
        { id: 'linen-sand', name: 'Linen two-piece (Sand)', swatch: 'swatch-sand', sold: 6, share: 23, amount: 540 },
        { id: 'poplin-white', name: 'Cotton poplin shirt (White)', swatch: 'swatch-indigo', sold: 4, share: 16, amount: 380 },
      ],
      footer: ['Everything else', '$740'],
    },
  },
  urgent: [
    {
      id: 'tue-sizing',
      icon: 'msg',
      title: 'Sizing questions on the Sand set',
      sub: 'Answered by 9:20 AM',
      jumpTarget: 'customers',
      done: 'Resolved',
    },
    {
      id: 'tue-emerald',
      icon: 'box',
      title: 'Emerald slip dress stock check',
      sub: '12 units counted',
      jumpTarget: 'inventory',
      done: 'Completed',
    },
    {
      id: 'tue-comments',
      icon: 'users',
      title: 'Reel comments to reply to',
      sub: 'Zee replied to 40 by 4:00 PM',
      jumpTarget: 'instagram',
      done: 'Attended',
    },
  ],
};
