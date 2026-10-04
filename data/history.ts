import type { HopFrameRef, Message } from '@/lib/store';
import { answerFor, DEFAULT_TAGGED_QUESTION, type Block } from './conversation';
import type { Kpi, Page, PersonId } from './types';

// The History chain (brief A7, B7.5), newest first. Question, time, page and tag are from the
// brief's table; summaries are copied exactly from the Figma History frames.
//
// Each brief also carries the thread Expand opens. The 2:14 and 2:33 threads are the scripted
// conversation (B11 #4: the 2:33 brief opens the whole Sand → Adire thread). The others have no
// scripted conversation, so Hop's reply is the brief's summary in Hop's own voice, without the
// things that happened after the question (Amara's 2:20 PM change, Dayo sending the drafts).

export type BriefKind = 'analytics' | 'screenshot' | 'tagged';

/** What an Analytics snapshot shows: that moment's KPI, week and day. */
export interface SnapshotView {
  kpi: Kpi;
  range: 'thisWeek' | 'lastWeek';
  day: number | null;
}

export interface Brief {
  id: string;
  day: 'Today' | 'Yesterday';
  date: string; // for the snapshot note, "Thu 24 Sep"
  who: PersonId;
  time: string;
  page: Page; // where it was asked
  pageLabel: string; // the pill: "Chat" for questions asked on Analytics
  question: string;
  tag?: HopFrameRef;
  summary: string;
  kind: BriefKind;
  view?: SnapshotView; // Analytics briefs
  thread: Message[];
  anchor: string; // the message Expand scrolls to
}

const TODAY = { day: 'Today', date: 'Thu 24 Sep' } as const;
const YESTERDAY = { day: 'Yesterday', date: 'Wed 23 Sep' } as const;
// Today's questions were asked looking at today (day 3), not the week so far that Analytics now
// opens on (user feedback 2026-10-04).
const LIVE_VIEW: SnapshotView = { kpi: 'revenue', range: 'thisWeek', day: 3 };

const SAND_TAG: HopFrameRef = { id: 'analytics.card.linen-sand', label: 'Linen two-piece (Sand)', page: 'analytics', jumpTarget: 'inventory' };
const ADIRE_TAG: HopFrameRef = { id: 'inventory.row.adire-blue', label: 'Adire shirt dress', page: 'inventory', jumpTarget: 'inventory' };
// The Customers page isn't designed yet, so this frame only exists as a label.
const CHIOMA_TAG: HopFrameRef = { id: 'customers.chat.chioma', label: 'Chat thread · Chioma Eze', page: 'customers' };

const text = (t: string): Block => ({ kind: 'text', text: t });
const ask = (id: string, who: PersonId, time: string, page: Page, question: string, tag?: HopFrameRef): Message => ({
  id,
  kind: 'user',
  author: who,
  time,
  text: question,
  tag,
  page,
});
const reply = (id: string, time: string, reads: Page[], blocks: Block[]): Message => ({ id, kind: 'hop', time, reads, blocks, status: 'done' });

const sand = answerFor(SAND_TAG.id, DEFAULT_TAGGED_QUESTION);
const adire = answerFor(ADIRE_TAG.id, 'What am I seeing?');
const today = answerFor(undefined, 'How are we doing today?');

export const BRIEFS: Brief[] = [
  {
    id: 'b-2-40',
    ...TODAY,
    who: 'amara',
    time: '2:40 PM',
    page: 'customers',
    pageLabel: 'Customers',
    question: 'What’s going on here?',
    tag: CHIOMA_TAG,
    summary: 'Chioma is waiting on order #1042. It shipped this morning, and Hop drafted an apology with the tracking number.',
    kind: 'tagged',
    thread: [
      ask('h240-q', 'amara', '2:40 PM', 'customers', 'What’s going on here?', CHIOMA_TAG),
      reply('h240-a', '2:40 PM', ['customers', 'sales'], [text('Chioma is waiting on order #1042. It shipped this morning, and I drafted an apology with the tracking number.')]),
    ],
    anchor: 'h240-q',
  },
  {
    id: 'b-2-33',
    ...TODAY,
    who: 'amara',
    time: '2:33 PM',
    page: 'inventory',
    pageLabel: 'Inventory',
    question: 'What am I seeing?',
    tag: ADIRE_TAG,
    summary: 'The Adire shirt dress sold out on Monday and isn’t on the restock order. 14 people have asked about it.',
    kind: 'tagged',
    thread: [
      { ...ask('h231-q', 'amara', '2:31 PM', 'analytics', DEFAULT_TAGGED_QUESTION, SAND_TAG), view: LIVE_VIEW } as Message,
      reply('h231-a', '2:31 PM', sand.reads, sand.blocks),
      { id: 'h232-m', kind: 'marker', text: 'Moved to Inventory', time: '2:32 PM', page: 'inventory' },
      ask('h233-q', 'amara', '2:33 PM', 'inventory', 'What am I seeing?', ADIRE_TAG),
      reply('h233-a', '2:33 PM', adire.reads, adire.blocks),
    ],
    anchor: 'h233-q',
  },
  {
    id: 'b-2-14',
    ...TODAY,
    who: 'amara',
    time: '2:14 PM',
    page: 'analytics',
    pageLabel: 'Chat',
    question: 'How are we doing today?',
    summary: '$2,480 so far, 12% ahead of last Thursday. 3 late replies, and the Sand set is running low.',
    kind: 'analytics',
    view: LIVE_VIEW,
    thread: [ask('h214-q', 'amara', '2:14 PM', 'analytics', 'How are we doing today?'), reply('h214-a', '2:14 PM', today.reads, today.blocks)],
    anchor: 'h214-q',
  },
  {
    id: 'b-1-40',
    ...TODAY,
    who: 'zee',
    time: '1:40 PM',
    page: 'instagram',
    pageLabel: 'Instagram',
    question: 'Why is the Sand reel doing so well?',
    summary: '3.1× usual reach: a strong opening, the 7:30 PM slot and 62 price questions in the comments.',
    kind: 'screenshot',
    thread: [
      ask('h140-q', 'zee', '1:40 PM', 'instagram', 'Why is the Sand reel doing so well?'),
      reply('h140-a', '1:40 PM', ['instagram'], [text('It’s reaching 3.1× your usual: a strong opening, the 7:30 PM slot and 62 price questions in the comments.')]),
    ],
    anchor: 'h140-q',
  },
  {
    id: 'b-8-40',
    ...TODAY,
    who: 'ife',
    time: '8:40 AM',
    page: 'inventory',
    pageLabel: 'Inventory',
    question: 'Draft a restock plan for the linen sets',
    summary: '42 pieces for $1,470. Amara changed the Sand set to 25 at 2:20 PM.',
    kind: 'screenshot',
    thread: [
      ask('h840-q', 'ife', '8:40 AM', 'inventory', 'Draft a restock plan for the linen sets'),
      reply('h840-a', '8:40 AM', ['inventory', 'sales'], [text('Here’s a restock plan for the linen sets: 42 pieces for $1,470.')]),
    ],
    anchor: 'h840-q',
  },
  {
    id: 'b-8-00',
    ...TODAY,
    who: 'hop',
    time: '8:00 AM',
    page: 'analytics',
    pageLabel: 'Chat',
    question: 'Morning brief',
    summary: 'Yesterday closed at $3,120, your best Wednesday this month. 3 things need attention today.',
    kind: 'analytics',
    // The morning brief is about yesterday, so its Analytics shows Wednesday.
    view: { kpi: 'revenue', range: 'thisWeek', day: 2 },
    thread: [reply('h800-a', '8:00 AM', ['sales', 'customers', 'inventory'], [text('Yesterday closed at $3,120, your best Wednesday this month. 3 things need attention today.')])],
    anchor: 'h800-a',
  },
  {
    id: 'b-y-5-10',
    ...YESTERDAY,
    who: 'dayo',
    time: '5:10 PM',
    page: 'customers',
    pageLabel: 'Customers',
    question: 'Reply drafts for late DMs',
    summary: '4 drafts written. Dayo sent 3 and edited 1.',
    kind: 'screenshot',
    thread: [
      ask('hy510-q', 'dayo', '5:10 PM', 'customers', 'Reply drafts for late DMs'),
      reply('hy510-a', '5:10 PM', ['customers'], [text('I wrote 4 reply drafts for the late DMs.')]),
    ],
    anchor: 'hy510-q',
  },
];

/** Sidebar "Recent with Hop" (Figma frame "Analytics"). briefId links to History; "Weekend content
 *  ideas" isn't in the chain, so it opens History filtered to Zee's briefs. */
export const RECENT_WITH_HOP: { text: string; who: PersonId; briefId: string | null }[] = [
  { text: 'How are we doing today?', who: 'amara', briefId: 'b-2-14' },
  { text: 'Restock plan for linen sets', who: 'ife', briefId: 'b-8-40' },
  { text: 'Reply drafts for late DMs', who: 'dayo', briefId: 'b-y-5-10' },
  { text: 'Weekend content ideas', who: 'zee', briefId: null },
];

/** The person filter chips, in Figma order (Figma shows the first four; the brief adds Zee). */
export const HISTORY_PEOPLE: PersonId[] = ['amara', 'ife', 'dayo', 'zee'];

/** Pages in the "All pages" menu, in sidebar order. */
export const HISTORY_PAGES: { id: Page; label: string }[] = [
  { id: 'analytics', label: 'Chats' }, // Figma "All pages" menu says Chats (the brief pills say Chat)
  { id: 'sales', label: 'Sales' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'inventory', label: 'Inventory' },
  { id: 'customers', label: 'Customers' },
];

