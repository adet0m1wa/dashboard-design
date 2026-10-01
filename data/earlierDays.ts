import type { Snapshot } from './types';

// Monday 21 and Tuesday 22 September.
//
// NOT FROM THE BRIEF. The brief only designs Wednesday, but any past day on the chart can be
// selected. KPI values here come straight from the chart series (A7), and the % changes are
// against the same day last week, the same rule that produces Wednesday's numbers. The product
// breakdowns, the other KPI cards and done items were written for the prototype so Mon/Tue don't
// look broken; each breakdown adds up to that day's revenue, and each card's footer to its KPI.
// Replace freely.
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
      link: { label: 'Open Sales', page: 'sales' },
      rows: [
        { id: 'linen-sand', name: 'Linen two-piece (Sand)', swatch: 'swatch-sand', sold: 6, share: 28, amount: 540 },
        { id: 'kimono-indigo', name: 'Wrap kimono (Indigo)', swatch: 'swatch-indigo', sold: 5, share: 23, amount: 450 },
        { id: 'slip-emerald', name: 'Satin slip dress (Emerald)', swatch: 'swatch-emerald', sold: 3, share: 14, amount: 270 },
      ],
      footer: ['Everything else', '$660'],
    },
    orders: {
      kind: 'orders',
      link: { label: 'Open Sales', page: 'sales' },
      rows: [
        { id: 'order-mon-grace', customer: 'Grace Mensah', initials: 'GM', avatar: 'avatar-dayo', item: 'Linen two-piece (Sand)', qty: 1, time: '5:40 PM', amount: 90, status: 'Delivered', tone: 'success' },
        { id: 'order-mon-ada', customer: 'Ada Williams', initials: 'AW', avatar: 'palette-tone-15', item: 'Wrap kimono', qty: 2, time: '3:12 PM', amount: 180, status: 'Delivered', tone: 'success' },
        { id: 'order-mon-tolu', customer: 'Tolu Bakare', initials: 'TB', avatar: 'avatar-ife', item: 'Satin slip dress', qty: 1, time: '11:05 AM', amount: 90, status: 'Delivered', tone: 'success' },
      ],
      footer: ['26 orders', 'all delivered'],
    },
    likes: {
      kind: 'posts',
      link: { label: 'Open Instagram', page: 'instagram' },
      rows: [
        { id: 'post-emerald', title: 'New in: the Emerald slip dress', meta: 'Post · Mon · by Zee', swatch: 'swatch-emerald', likes: 3900 },
        { id: 'post-fit-check', title: 'Fit check: Tolu in Sand', meta: 'Reel · Fri · by Zee', swatch: 'post-fit-check', likes: 2600 },
        { id: 'post-kimono', title: 'The kimono restock is live', meta: 'Post · Sat · by Zee', swatch: 'swatch-indigo', likes: 1400 },
      ],
      footer: ['Across 4 posts', '9.8k likes'],
    },
    followers: {
      kind: 'sources',
      link: { label: 'Open Instagram', page: 'instagram' },
      rows: [
        { id: 'source-profile', label: 'Profile visits', count: 44, share: 46 },
        { id: 'source-emerald', label: 'The Emerald post', count: 30, share: 31 },
        { id: 'source-shares', label: 'Shares and tags', count: 22, share: 23 },
      ],
      footer: ['96 new followers', '+9%'],
    },
    dms: {
      kind: 'dms',
      link: { label: 'Open Customers', page: 'customers' },
      rows: [
        { id: 'dm-mon-grace', customer: 'Grace Mensah', initials: 'GM', avatar: 'avatar-dayo', quote: 'Is the kimono true to size?', waiting: 'Replied in 1h 10m', tone: 'success' },
        { id: 'dm-mon-ada', customer: 'Ada Williams', initials: 'AW', avatar: 'palette-tone-15', quote: 'Do you ship to Abuja?', waiting: 'Replied in 45m', tone: 'success' },
        { id: 'dm-mon-chioma', customer: 'Chioma Eze', initials: 'CE', avatar: 'palette-tone-17', quote: 'When will my order arrive?', waiting: 'Replied in 30m', tone: 'success' },
      ],
      footer: ['4 DMs, all answered', 'slowest 1h 10m'],
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
      link: { label: 'Open Sales', page: 'sales' },
      rows: [
        { id: 'slip-emerald', name: 'Satin slip dress (Emerald)', swatch: 'swatch-emerald', sold: 8, share: 30, amount: 720 },
        { id: 'linen-sand', name: 'Linen two-piece (Sand)', swatch: 'swatch-sand', sold: 6, share: 23, amount: 540 },
        { id: 'poplin-white', name: 'Cotton poplin shirt (White)', swatch: 'swatch-indigo', sold: 4, share: 16, amount: 380 },
      ],
      footer: ['Everything else', '$740'],
    },
    orders: {
      kind: 'orders',
      link: { label: 'Open Sales', page: 'sales' },
      rows: [
        { id: 'order-tue-chioma', customer: 'Chioma Eze', initials: 'CE', avatar: 'palette-tone-17', item: 'Satin slip dress', qty: 2, time: '6:20 PM', amount: 180, status: 'Delivered', tone: 'success' },
        { id: 'order-tue-tolu', customer: 'Tolu Bakare', initials: 'TB', avatar: 'avatar-ife', item: 'Cotton poplin shirt', qty: 1, time: '2:45 PM', amount: 95, status: 'Delivered', tone: 'success' },
        { id: 'order-tue-grace', customer: 'Grace Mensah', initials: 'GM', avatar: 'avatar-dayo', item: 'Linen two-piece (Sand)', qty: 1, time: '10:30 AM', amount: 90, status: 'Delivered', tone: 'success' },
      ],
      footer: ['30 orders', 'all delivered'],
    },
    likes: {
      kind: 'posts',
      link: { label: 'Open Instagram', page: 'instagram' },
      rows: [
        { id: 'post-sand-reel', title: 'Styling the Sand set 3 ways', meta: 'Reel · Tue · by Zee', swatch: 'post-sand-reel', likes: 5200 },
        { id: 'post-emerald', title: 'New in: the Emerald slip dress', meta: 'Post · Mon · by Zee', swatch: 'swatch-emerald', likes: 3100 },
        { id: 'post-fit-check', title: 'Fit check: Tolu in Sand', meta: 'Reel · Fri · by Zee', swatch: 'post-fit-check', likes: 1500 },
      ],
      footer: ['Across 5 posts', '11.4k likes'],
    },
    followers: {
      kind: 'sources',
      link: { label: 'Open Instagram', page: 'instagram' },
      rows: [
        { id: 'source-sand-reel', label: 'The Sand reel', count: 58, share: 48 },
        { id: 'source-profile', label: 'Profile visits', count: 38, share: 32 },
        { id: 'source-shares', label: 'Shares and tags', count: 24, share: 20 },
      ],
      footer: ['120 new followers', '+30%'],
    },
    dms: {
      kind: 'dms',
      link: { label: 'Open Customers', page: 'customers' },
      rows: [
        { id: 'dm-tue-tolu', customer: 'Tolu Bakare', initials: 'TB', avatar: 'avatar-ife', quote: 'Will the Sand set restock?', waiting: 'Replied in 2h 5m', tone: 'success' },
        { id: 'dm-tue-grace', customer: 'Grace Mensah', initials: 'GM', avatar: 'avatar-dayo', quote: 'Can I swap for a size 14?', waiting: 'Replied in 1h 20m', tone: 'success' },
        { id: 'dm-tue-chioma', customer: 'Chioma Eze', initials: 'CE', avatar: 'palette-tone-17', quote: 'Do you do gift wrapping?', waiting: 'Replied in 50m', tone: 'success' },
      ],
      footer: ['6 DMs, all answered', 'slowest 2h 5m'],
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
