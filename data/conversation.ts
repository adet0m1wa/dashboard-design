import { CUSTOMERS_ANSWERS } from './customers';
import { INSTAGRAM_ANSWERS } from './instagram';
import { LAST_WEEK_URGENT_ANSWERS } from './lastWeekDays';
import { orderAnswer, SALES_ANSWERS } from './sales';
import type { Page } from './types';

// Scripted Hop answers (brief B9). Keyed by the tagged frame's id, or by the prompt-cue text.
// Anything else gets FALLBACK. It's a prototype: nothing here calls a model.

export type Block =
  | { kind: 'text'; text: string }
  | { kind: 'sizes'; title: string; sizes: { size: string; left: number }[] }
  | { kind: 'actions'; buttons: { label: string; toast: string; style: 'primary' | 'secondary' }[] };

export interface Answer {
  reads: Page[]; // "read Inventory, Sales"
  blocks: Block[];
}

export const PROMPT_CUES = [
  'How are we doing today?',
  'Any flags?',
  'What’s trending on Instagram?',
  'Who’s still waiting on a reply?',
  'What’s running low?',
] as const;

/** What the Urgent buttons ask, tagged with their row (brief B7.1). */
export const URGENT_QUESTIONS = {
  draft: 'Draft replies for the 3 customers',
  reorder: 'Reorder the Sand linen set',
} as const;

/** When a tag is sent with no typed text, this is what gets asked (matches the frames). */
export const DEFAULT_TAGGED_QUESTION = 'Tell me more about this';

export const FALLBACK: Answer = {
  reads: [],
  blocks: [{ kind: 'text', text: 'I can answer that once this page is connected.' }],
};

// ---- Answers from the brief (A7) -------------------------------------------------------

const SAND: Answer = {
  reads: ['inventory', 'sales'],
  blocks: [
    {
      kind: 'text',
      text: 'The Sand two-piece is your best seller this week: 31 sold in 7 days, about 4 a day. Only 4 are left, so it sells out by Saturday.',
    },
    {
      kind: 'sizes',
      title: 'Sizes left',
      sizes: [
        { size: '8', left: 0 },
        { size: '10', left: 1 },
        { size: '12', left: 2 },
        { size: '14', left: 1 },
        { size: '16', left: 0 },
      ],
    },
    { kind: 'text', text: '25 more are on the restock order you approved at 2:20 PM, arriving next Wednesday.' },
  ],
};

const ADIRE: Answer = {
  reads: ['inventory', 'customers'],
  blocks: [
    {
      kind: 'text',
      text: 'This is the Adire shirt dress in Blue. It sold out on Monday after 9 sales in 7 days, and it isn’t on the restock order you approved.',
    },
    { kind: 'text', text: '14 people have asked about it in DMs since it sold out.' },
    {
      kind: 'actions',
      buttons: [
        { label: 'Add to restock', toast: 'Added to the restock order', style: 'primary' },
        { label: 'Notify me when back', toast: 'Hop will tell you when it’s back', style: 'secondary' },
      ],
    },
  ],
};

// ---- Answers written for the prototype (not in the brief) -------------------------------
// Short, and every number comes from data/today.ts so the story stays consistent.

const text = (t: string): Block => ({ kind: 'text', text: t });

export const ANSWERS_BY_CUE: Record<string, Answer> = {
  'How are we doing today?': {
    reads: ['sales', 'instagram', 'customers'],
    blocks: [
      text('A good day so far. $2,480 from 34 orders, up 12% on last Thursday. The Sand linen set is doing most of the work: 9 sold, a third of today’s revenue.'),
      text('Two things need you: 3 customers have waited over 2 hours, and the Sand set sells out by Saturday.'),
    ],
  },
  'Any flags?': {
    reads: ['customers', 'inventory', 'sales'],
    blocks: [
      text('Three. Chioma has waited 8 hours for a delivery update. The Sand linen set has 4 left and sells out by Saturday. And 6 orders are still to pack; Ife is on packing today.'),
    ],
  },
  'What’s trending on Instagram?': {
    reads: ['instagram'],
    blocks: [
      text('The Sand reel. “Styling the Sand set 3 ways” has 9.4k likes and brought in 132 of today’s 214 new followers. Likes are up 31% on last Thursday.'),
    ],
  },
  'Who’s still waiting on a reply?': {
    reads: ['customers'],
    blocks: [
      text('9 DMs are unanswered. The longest waits: Chioma Eze (8h, delivery update), Tolu Bakare (3h 34m, slip dress in a size 12) and Grace Mensah (2h 19m, change of address). 6 more have waited under 2 hours.'),
    ],
  },
  'What’s running low?': {
    reads: ['inventory'],
    blocks: [
      text('The Sand linen two-piece: 4 left, selling about 4 a day, so it runs out by Saturday. 25 more are on the restock order arriving next Wednesday.'),
    ],
  },
};

export const ANSWERS_BY_FRAME: Record<string, Answer> = {
  // Product rows (the same product on Analytics and Inventory gets the same answer)
  'analytics.card.linen-sand': SAND,
  'inventory.row.linen-sand': SAND,
  'inventory.row.adire-blue': ADIRE,
  // Urgent actions send tagged messages (brief B7.1)
  'analytics.urgent.urgent-waiting': {
    reads: ['customers'],
    blocks: [
      text('Here are drafts for the 3 customers waiting longest. Check them, then send.'),
      text('Chioma: “Sorry for the wait. Your order left us this morning and should arrive tomorrow.” Tolu: “Yes, the slip dress is back in a 12. Want me to hold one?” Grace: “Of course. Send the new address and we’ll update it.”'),
      {
        kind: 'actions',
        buttons: [
          { label: 'Send all 3', toast: 'Replies sent to Chioma, Tolu and Grace', style: 'primary' },
          { label: 'Edit first', toast: 'Drafts opened in Customers', style: 'secondary' },
        ],
      },
    ],
  },
  'analytics.urgent.urgent-sand': {
    reads: ['inventory', 'sales'],
    blocks: [
      text('25 Sand sets are already on the order you approved at 2:20 PM, arriving next Wednesday. At 4 a day you’ll be out from Saturday to Wednesday. Adding 15 more on an express order would cover the gap.'),
      {
        kind: 'actions',
        buttons: [
          { label: 'Draft express order', toast: 'Express order drafted for 15 Sand sets', style: 'primary' },
          { label: 'Keep as is', toast: 'No change to the restock order', style: 'secondary' },
        ],
      },
    ],
  },
  // The whole Urgent card, one per period (written for the prototype from each period's items)
  'analytics.urgent': {
    reads: ['customers', 'inventory', 'sales'],
    blocks: [text('Three things need you today. 3 customers have waited over 2 hours for a reply, the oldest is Chioma’s from 6:12 AM. The Sand linen set sells out by Saturday. And 6 orders are still to pack, with Ife on packing. The replies are the most pressing, and I can draft them for you.')],
  },
  'analytics.urgent-mon': {
    reads: ['customers', 'inventory'],
    blocks: [text('Everything from Monday got done. The 5 weekend delivery questions were answered by 11:00 AM, a restock of the Wrap kimono in size 10 went in at 9:40 AM, and Dayo cleared the DM backlog by noon.')],
  },
  'analytics.urgent-tue': {
    reads: ['customers', 'inventory', 'instagram'],
    blocks: [text('All three from Tuesday were handled. The Sand set sizing questions were answered by 9:20 AM, the Emerald slip dress count came to 12 units, and Zee replied to 40 reel comments by 4:00 PM.')],
  },
  'analytics.urgent-wed': {
    reads: ['customers', 'inventory'],
    blocks: [text('All three from Wednesday were handled. Both incomplete delivery addresses were fixed by 10:30 AM, the Emerald dress in size 12 was restocked before noon, and Dayo answered the 4 priority DMs by 1:15 PM.')],
  },
  'analytics.urgent-lastWeek': {
    reads: ['customers', 'inventory'],
    blocks: [text('Nothing from last week is still open. All 7 weekend return requests were closed, the supplier confirmed 60 Mocha robes, and 18 customers got a post-sale follow-up.')],
  },
  ...LAST_WEEK_URGENT_ANSWERS,
  // Sales, Instagram and Customers (designed 2026-10-01): every frame on them has an answer
  ...SALES_ANSWERS,
  ...INSTAGRAM_ANSWERS,
  ...CUSTOMERS_ANSWERS,
  // KPI tabs
  'analytics.kpi.revenue': { reads: ['sales'], blocks: [text('Revenue today is $2,480, up 12% on last Thursday ($2,210). Wednesday was the peak of the week at $3,120.')] },
  'analytics.kpi.orders': { reads: ['sales'], blocks: [text('34 orders so far today, up 6% on last Thursday. 6 are still to pack.')] },
  'analytics.kpi.likes': { reads: ['instagram'], blocks: [text('18.2k likes today, up 31% on last Thursday. The Sand reel alone has 9.4k.')] },
  'analytics.kpi.followers': { reads: ['instagram'], blocks: [text('214 new followers today, up 9%. 62% of them came from the Sand reel.')] },
  'analytics.kpi.dms': { reads: ['customers'], blocks: [text('9 DMs are unanswered and 3 have waited over 2 hours. The oldest is Chioma’s, from 6:12 AM.')] },
  'analytics.chart': {
    reads: ['sales'],
    blocks: [text('This is the week so far against last week. Every day since Tuesday is ahead, and Wednesday was the best day at $3,120, 30% up on last Wednesday.')],
  },
};

/** A new scripted answer lookup: tagged frame first, then cue text, then the fallback. */
export function answerFor(frameId: string | undefined, question: string): Answer {
  if (frameId && ANSWERS_BY_FRAME[frameId]) return ANSWERS_BY_FRAME[frameId];
  // Order rows (Sales, and a customer's order list) are answered from the order itself: there
  // are over a thousand of them.
  const order = frameId?.match(/^(?:sales|customers)\.order\.(\d+)$/);
  if (order) return orderAnswer(Number(order[1])) ?? FALLBACK;
  if (ANSWERS_BY_CUE[question]) return ANSWERS_BY_CUE[question];
  return FALLBACK;
}
