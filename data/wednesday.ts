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
      link: { label: 'Open Sales', page: 'sales' },
      // Figma reuses the sand / emerald / indigo swatches for these rows.
      rows: [
        { id: 'midi-navy', name: 'Pleated midi skirt (Navy)', swatch: 'swatch-sand', sold: 10, share: 29, amount: 920 },
        { id: 'poplin-white', name: 'Cotton poplin shirt (White)', swatch: 'swatch-emerald', sold: 7, share: 21, amount: 665 },
        { id: 'clutch-gold', name: 'Beaded clutch (Gold)', swatch: 'swatch-indigo', sold: 5, share: 15, amount: 575 },
      ],
      footer: ['Everything else', '$960'],
    },
    // The Orders, Likes, Followers and DMs cards aren't designed for past periods: written for the
    // prototype (user feedback 2026-09-30) from this period's KPIs. Replace freely.
    orders: {
      kind: 'orders',
      link: { label: 'Open Sales', page: 'sales' },
      rows: [
        { id: 'order-wed-ada', customer: 'Ada Williams', initials: 'AW', avatar: 'palette-tone-15', item: 'Pleated midi skirt', qty: 2, time: '7:10 PM', amount: 184, status: 'Shipped', tone: 'success' },
        { id: 'order-wed-chioma', customer: 'Chioma Eze', initials: 'CE', avatar: 'palette-tone-17', item: 'Beaded clutch', qty: 1, time: '4:25 PM', amount: 115, status: 'Shipped', tone: 'success' },
        { id: 'order-wed-tolu', customer: 'Tolu Bakare', initials: 'TB', avatar: 'avatar-ife', item: 'Cotton poplin shirt', qty: 2, time: '1:50 PM', amount: 190, status: 'Shipped', tone: 'success' },
      ],
      footer: ['41 orders', 'all shipped'],
    },
    likes: {
      kind: 'posts',
      link: { label: 'Open Instagram', page: 'instagram' },
      rows: [
        { id: 'post-sand-reel', title: 'Styling the Sand set 3 ways', meta: 'Reel · Tue · by Zee', swatch: 'post-sand-reel', likes: 13800 },
        { id: 'post-emerald', title: 'New in: the Emerald slip dress', meta: 'Post · Mon · by Zee', swatch: 'swatch-emerald', likes: 3900 },
        { id: 'post-packing', title: 'Packing day, behind the scenes', meta: 'Post · Wed · by Zee', swatch: 'swatch-ecru', likes: 2100 },
      ],
      footer: ['Across 6 posts', '21.6k likes'],
    },
    followers: {
      kind: 'sources',
      link: { label: 'Open Instagram', page: 'instagram' },
      rows: [
        { id: 'source-sand-reel', label: 'The Sand reel', count: 221, share: 71 },
        { id: 'source-profile', label: 'Profile visits', count: 54, share: 18 },
        { id: 'source-shares', label: 'Shares and tags', count: 35, share: 11 },
      ],
      footer: ['310 new followers', '+182%'],
    },
    dms: {
      kind: 'dms',
      link: { label: 'Open Customers', page: 'customers' },
      rows: [
        { id: 'dm-wed-chioma', customer: 'Chioma Eze', initials: 'CE', avatar: 'palette-tone-17', quote: 'My address is missing a street number', waiting: 'Replied in 1h 30m', tone: 'success' },
        { id: 'dm-wed-tolu', customer: 'Tolu Bakare', initials: 'TB', avatar: 'avatar-ife', quote: 'Is the Emerald dress back in a 12?', waiting: 'Replied in 1h 5m', tone: 'success' },
        { id: 'dm-wed-ada', customer: 'Ada Williams', initials: 'AW', avatar: 'palette-tone-15', quote: 'Can I collect in person?', waiting: 'Replied in 40m', tone: 'success' },
      ],
      footer: ['5 DMs, all answered', 'slowest 1h 30m'],
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
