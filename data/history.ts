import type { Page, PersonId } from './types';

// The History chain (brief A7), newest first. Summaries are copied from the Figma History
// frames in phase 7; the brief says to copy them exactly.

export type BriefKind = 'analytics' | 'screenshot' | 'tagged';

export interface Brief {
  id: string;
  day: 'Today' | 'Yesterday';
  who: PersonId;
  time: string;
  page: Page; // where it was asked
  pageLabel: string; // "Chat / Analytics", "Inventory" …
  question: string;
  tag?: string;
  summary: string;
  kind: BriefKind;
}

export const BRIEFS: Brief[] = [
  {
    id: 'b-2-40',
    day: 'Today',
    who: 'amara',
    time: '2:40 PM',
    page: 'customers',
    pageLabel: 'Customers',
    question: 'What’s going on here?',
    tag: 'Chat thread · Chioma Eze',
    summary: '',
    kind: 'tagged',
  },
  {
    id: 'b-2-33',
    day: 'Today',
    who: 'amara',
    time: '2:33 PM',
    page: 'inventory',
    pageLabel: 'Inventory',
    question: 'What am I seeing?',
    tag: 'Adire shirt dress',
    summary: '',
    kind: 'tagged',
  },
  {
    id: 'b-2-14',
    day: 'Today',
    who: 'amara',
    time: '2:14 PM',
    page: 'analytics',
    pageLabel: 'Chat / Analytics',
    question: 'How are we doing today?',
    summary: '',
    kind: 'analytics',
  },
  {
    id: 'b-1-40',
    day: 'Today',
    who: 'zee',
    time: '1:40 PM',
    page: 'instagram',
    pageLabel: 'Instagram',
    question: 'Why is the Sand reel doing so well?',
    summary: '',
    kind: 'screenshot',
  },
  {
    id: 'b-8-40',
    day: 'Today',
    who: 'ife',
    time: '8:40 AM',
    page: 'inventory',
    pageLabel: 'Inventory',
    question: 'Draft a restock plan for the linen sets',
    summary: '',
    kind: 'screenshot',
  },
  {
    id: 'b-8-00',
    day: 'Today',
    who: 'hop',
    time: '8:00 AM',
    page: 'analytics',
    pageLabel: 'Chat / Analytics',
    question: 'Morning brief',
    summary: '',
    kind: 'analytics',
  },
  {
    id: 'b-y-5-10',
    day: 'Yesterday',
    who: 'dayo',
    time: '5:10 PM',
    page: 'customers',
    pageLabel: 'Customers',
    question: 'Reply drafts for late DMs',
    summary: '',
    kind: 'screenshot',
  },
];

/** Sidebar "Recent with Hop" (Figma frame "Analytics"). briefId links to History. */
export const RECENT_WITH_HOP: { text: string; who: PersonId; briefId: string | null }[] = [
  { text: 'How are we doing today?', who: 'amara', briefId: 'b-2-14' },
  { text: 'Restock plan for linen sets', who: 'ife', briefId: 'b-8-40' },
  { text: 'Reply drafts for late DMs', who: 'dayo', briefId: 'b-y-5-10' },
  { text: 'Weekend content ideas', who: 'zee', briefId: null }, // not in the History chain — resolved in phase 7
];
