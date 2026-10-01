import type { Answer } from './conversation';
import { dateOf, ordersOf, type Fulfilment, type Order } from './orders';
import type { AvatarColor, Tone } from './types';

// The Customers page (user feedback 2026-10-01: design the remaining screens), laid out after the
// older Figma reference "04 · Customers — Hop collapsed" (1788:2584) in today's styling: the inbox,
// the open conversation, the customer beside it.
//
// It matches the rest of the prototype: 9 DMs unanswered and 3 waiting over 2 hours (the DMs KPI
// and Urgent card), with Chioma, Tolu and Grace's waits from the Analytics card, and Hop's drafts
// the same as its "Draft replies" answer. Now is 2:30 PM. Round 7: what each customer has spent,
// their order count and every order come from the orders themselves (data/orders.ts).

export interface Bubble {
  from: 'customer' | 'team';
  text: string;
  meta: string; // "Chioma · 3:02 PM · Instagram DM"
  day: 'Yesterday' | 'Today' | 'Earlier';
}

export interface Thread {
  id: string;
  name: string;
  initials: string;
  avatar: AvatarColor;
  handle: string; // "@chioma.styles"
  city: string;
  preview: string;
  time: string;
  waiting?: string; // "8h" — unanswered, with how long
  vip?: boolean;
  messages: Bubble[];
  draft?: { note: string; text: string };
  notes: string;
  notesBy: string;
  tags: string[];
}

export const STATUS_TONE: Record<Fulfilment, Tone> = { 'To pack': 'warning', Shipped: 'info', Delivered: 'success' };

/** A customer's record, counted from their orders: newest first. */
export function profileOf(id: string) {
  const orders: Order[] = [...ordersOf(id)].reverse();
  const spent = orders.reduce((s, o) => s + o.total, 0);
  const first = orders[orders.length - 1];
  const money = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`;
  return {
    orders,
    spent: money(spent),
    count: `${orders.length}`,
    average: money(orders.length ? spent / orders.length : 0),
    since: first ? `${dateOf(first.day).d} ${dateOf(first.day).month} 2026` : '—',
  };
}

const c = (text: string, meta: string, day: Bubble['day'] = 'Today'): Bubble => ({ from: 'customer', text, meta, day });
const t = (text: string, meta: string, day: Bubble['day'] = 'Today'): Bubble => ({ from: 'team', text, meta, day });

export const THREADS: Thread[] = [
  {
    id: 'chioma',
    name: 'Chioma Eze',
    initials: 'CE',
    avatar: 'palette-tone-17',
    handle: '@chioma.styles',
    city: 'Lagos',
    preview: 'Hi, any update on my delivery? It said it’d ship yesterday.',
    time: '6:12 AM',
    waiting: '8h',
    vip: true,
    messages: [
      c('Hi! Is the Linen two-piece in Sand still available in size 10?', 'Chioma · 3:02 PM · Instagram DM', 'Yesterday'),
      t('Yes it is! I’ve reserved one for you. Here’s the link to check out.', 'Dayo · 3:20 PM', 'Yesterday'),
      c('Paid! When will it ship?', 'Chioma · 3:41 PM', 'Yesterday'),
      t('It ships tomorrow. You’ll get tracking once it’s on the way.', 'Dayo · 4:30 PM', 'Yesterday'),
      c('Hi, any update on my delivery? It said it’d ship yesterday.', 'Chioma · 6:12 AM'),
    ],
    draft: {
      note: 'Hop drafted a reply · order #1042 shipped this morning',
      text: 'Hi Chioma, so sorry for the wait! Your Sand set shipped this morning (tracking GIG-48213) and should reach you by Friday. Thank you for your patience.',
    },
    notes: 'Size 10. Prefers updates on WhatsApp. Has bought gifts for her sister twice.',
    notesBy: 'Added by Dayo',
    tags: ['VIP', 'Repeat buyer', 'Lagos'],
  },
  {
    id: 'tolu',
    name: 'Tolu Bakare',
    initials: 'TB',
    avatar: 'avatar-ife',
    handle: '@tolu.b',
    city: 'Abuja',
    preview: 'Slip dress in a size 12?',
    time: '10:56 AM',
    waiting: '3h 34m',
    messages: [
      c('Loved the Sand reel! I ordered the slip dress this morning.', 'Tolu · 10:52 AM · Instagram DM'),
      c('Slip dress in a size 12?', 'Tolu · 10:56 AM'),
    ],
    draft: { note: 'Hop drafted a reply · size 12 back in stock', text: 'Yes, the slip dress is back in a 12. Want me to hold one?' },
    notes: 'Modelled the Sand set for the fit-check reel. Size 12.',
    notesBy: 'Added by Zee',
    tags: ['Repeat buyer', 'Abuja'],
  },
  {
    id: 'grace',
    name: 'Grace Mensah',
    initials: 'GM',
    avatar: 'avatar-dayo',
    handle: '@grace.mensah',
    city: 'Accra',
    preview: 'Can I change my delivery address?',
    time: '12:11 PM',
    waiting: '2h 19m',
    messages: [c('Can I change my delivery address? I’ve just moved.', 'Grace · 12:11 PM · Instagram DM')],
    draft: { note: `Hop drafted a reply · order #${ordersOf('grace').at(-1)?.number} not packed yet`, text: 'Of course. Send the new address and we’ll update it.' },
    notes: 'Ships to Accra. Asked about returns once.',
    notesBy: 'Added by Ife',
    tags: ['Repeat buyer', 'Accra'],
  },
  {
    id: 'nneka',
    name: 'Nneka Uche',
    initials: 'NU',
    avatar: 'status-info',
    handle: '@nneka.u',
    city: 'Lagos',
    preview: 'Is the Sand set coming back?',
    time: '1:05 PM',
    waiting: '1h 25m',
    messages: [c('Is the Sand set coming back? I missed it.', 'Nneka · 1:05 PM · Instagram DM')],
    notes: 'Commented on the Sand reel too.',
    notesBy: 'Added by Zee',
    tags: ['Lagos'],
  },
  {
    id: 'bisi',
    name: 'Bisi Adeyemi',
    initials: 'BA',
    avatar: 'avatar-zee',
    handle: '@bisi.a',
    city: 'Ibadan',
    preview: 'Do you ship to Ibadan?',
    time: '1:22 PM',
    waiting: '1h 8m',
    messages: [c('Do you ship to Ibadan? And how long does it take?', 'Bisi · 1:22 PM · Instagram DM')],
    notes: 'First order today.',
    notesBy: 'Added by Hop',
    tags: ['New'],
  },
  {
    id: 'funke',
    name: 'Funke Ola',
    initials: 'FO',
    avatar: 'avatar-ife',
    handle: '@funke.o',
    city: 'Lagos',
    preview: 'What’s your return policy?',
    time: '1:40 PM',
    waiting: '50m',
    messages: [c('What’s your return policy? The skirt is a little long.', 'Funke · 1:40 PM · Instagram DM')],
    notes: '',
    notesBy: '',
    tags: ['Lagos'],
  },
  {
    id: 'zainab',
    name: 'Zainab Bello',
    initials: 'ZB',
    avatar: 'palette-tone-17',
    handle: '@zainab.b',
    city: 'Kano',
    preview: 'Is the clutch real beads?',
    time: '2:05 PM',
    waiting: '25m',
    vip: true,
    messages: [c('Is the clutch real beads? Thinking of a second one for my sister.', 'Zainab · 2:05 PM · Instagram DM')],
    notes: 'Buys for weddings. Likes early access.',
    notesBy: 'Added by Amara',
    tags: ['VIP', 'Kano'],
  },
  {
    id: 'ngozi',
    name: 'Ngozi Okafor',
    initials: 'NO',
    avatar: 'avatar-amara',
    handle: '@ngozi.o',
    city: 'Enugu',
    preview: 'Can I pay on delivery?',
    time: '2:12 PM',
    waiting: '18m',
    messages: [c('Can I pay on delivery next time?', 'Ngozi · 2:12 PM · Instagram DM')],
    notes: '',
    notesBy: '',
    tags: ['Enugu'],
  },
  {
    id: 'ada',
    name: 'Ada Williams',
    initials: 'AW',
    avatar: 'palette-tone-15',
    handle: '@stylebyada',
    city: 'Lagos',
    preview: 'Can I get it by Saturday?',
    time: '2:21 PM',
    waiting: '9m',
    messages: [c('Just ordered the kimono. Can I get it by Saturday?', 'Ada · 2:21 PM · Instagram DM')],
    notes: 'Runs @stylebyada, shares our posts.',
    notesBy: 'Added by Zee',
    tags: ['Repeat buyer', 'Lagos'],
  },
  {
    id: 'kemi',
    name: 'Kemi Lawal',
    initials: 'KL',
    avatar: 'palette-tone-15',
    handle: '@kemi.l',
    city: 'Lagos',
    preview: 'Thank you, got it today!',
    time: 'Yesterday',
    messages: [c('Thank you, got it today!', 'Kemi · 5:40 PM', 'Yesterday'), t('So glad you love it 💛', 'Dayo · 5:52 PM', 'Yesterday')],
    notes: '',
    notesBy: '',
    tags: ['Lagos'],
  },
  {
    id: 'sarah',
    name: 'Sarah Kim',
    initials: 'SK',
    avatar: 'status-info',
    handle: '@sarah.k',
    city: 'London',
    preview: 'Love the kimono, ordering another',
    time: 'Tue',
    vip: true,
    messages: [c('Love the kimono, ordering another', 'Sarah · Tue 11:02 AM', 'Earlier'), t('Thank you Sarah! It’s on its way.', 'Ife · Tue 11:30 AM', 'Earlier')],
    notes: 'Ships to London. Pays for express.',
    notesBy: 'Added by Ife',
    tags: ['VIP', 'International'],
  },
];

/** Red once a DM has waited 2 hours or more (the Urgent card's line), amber before that. */
export const waitTone = (wait: string): Tone => (parseInt(wait, 10) >= 2 && wait.includes('h') ? 'danger' : 'warning');

export type InboxTab = 'all' | 'waiting' | 'vip';
export const WAITING_COUNT = THREADS.filter((x) => x.waiting).length; // 9, as the DMs KPI says
export const DEFAULT_THREAD = 'chioma';
export const thread = (id: string) => THREADS.find((x) => x.id === id) ?? THREADS[0];

const text = (s: string): Answer['blocks'][number] => ({ kind: 'text', text: s });

export const CUSTOMERS_ANSWERS: Record<string, Answer> = {
  ...Object.fromEntries(
    THREADS.map((x) => [
      `customers.chat.${x.id}`,
      {
        reads: ['customers', 'sales'],
        blocks: [
          text(
            x.waiting
              ? `${x.name} has waited ${x.waiting} for a reply: “${x.messages[x.messages.length - 1].text}”${x.draft ? ' I’ve drafted one for you to check.' : ''}`
              : `${x.name}’s last message was ${x.time.toLowerCase() === 'yesterday' ? 'yesterday' : `on ${x.time}`}, and it’s been answered. ${profileOf(x.id).count} orders, ${profileOf(x.id).spent} spent.`,
          ),
        ],
      } satisfies Answer,
    ]),
  ),
  // The History brief's thread (Amara · 2:40 PM, "What's going on here?") keeps its own words.
  'customers.chat.chioma': { reads: ['customers', 'sales'], blocks: [text('Chioma is waiting on order #1042. It shipped this morning, and I drafted an apology with the tracking number.')] },
  'customers.thread': { reads: ['customers'], blocks: [text('9 DMs are unanswered and 3 have waited over 2 hours: Chioma (8h), Tolu (3h 34m) and Grace (2h 19m). I’ve drafted replies for all three.')] },
  ...Object.fromEntries(
    THREADS.map((x) => [
      `customers.profile.${x.id}`,
      {
        reads: ['customers', 'sales'],
        blocks: [text(`${x.name} (${x.handle}, ${x.city}), a customer since ${profileOf(x.id).since}: ${profileOf(x.id).count} orders, ${profileOf(x.id).spent} spent, ${profileOf(x.id).average} on average.${x.notes ? ` ${x.notes}` : ''}`)],
      } satisfies Answer,
    ]),
  ),
};
