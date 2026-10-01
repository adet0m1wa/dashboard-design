import type { Answer } from './conversation';
import type { AvatarColor, Swatch } from './types';

// The Instagram page (user feedback 2026-10-01: design the remaining screens). Layout and the Sand
// reel's numbers are the Figma Instagram card (History "asked on another page", 1839:3721); the
// other four posts are written for the prototype in the same shape. "Last 7 days" = Fri 18 –
// Thu 24 Sep, so the five posts are the ones the Analytics likes cards show.

export const IG_HANDLE = '@amara.atelier';

export const IG_ACCOUNT = [
  { id: 'followers', label: 'Followers', value: '12.4k' },
  { id: 'reach', label: 'Reach', value: '18.2k' },
  { id: 'posts', label: 'Posts', value: '5' },
] as const;

export interface IgStat {
  id: string;
  label: string;
  value: string;
  note: string;
  good: boolean; // the note in green (beats the usual) or muted
}

export interface IgComment {
  handle: string;
  initial: string;
  avatar: AvatarColor;
  text: string;
}

export interface IgPost {
  id: string; // shared with the Analytics rows and data/photos.ts
  title: string;
  kind: 'Reel' | 'Post' | 'Story';
  listMeta: string; // "Reel · Tue · 41.2k views"
  lift?: string; // "3.1×" — only when it's well above the usual
  posted: string; // "Reel · Tue 22 Sep, 7:30 PM · posted by Zee"
  caption: string;
  image: string; // portrait crop for the preview
  swatch: Swatch;
  stats: IgStat[];
  commentTotal: number;
  comments: IgComment[];
  /** What Hop says when this post (or one of its numbers) is asked about. */
  answer: string;
}

const T = (handle: string, avatar: AvatarColor, text: string): IgComment => ({ handle, initial: handle.charAt(1).toUpperCase(), avatar, text });

export const IG_POSTS: IgPost[] = [
  {
    id: 'post-sand-reel',
    title: 'Styling the Sand set 3 ways',
    kind: 'Reel',
    listMeta: 'Reel · Tue · 41.2k views',
    lift: '3.1×',
    posted: 'Reel · Tue 22 Sep, 7:30 PM · posted by Zee',
    caption: '3 ways to wear the Sand set. Which one’s your fave?',
    image: '/products/large/sand-reel.webp',
    swatch: 'post-sand-reel',
    stats: [
      { id: 'views', label: 'Views', value: '41.2k', note: '3.1× your usual', good: true },
      { id: 'watched', label: 'Watched past 3s', value: '78%', note: 'You usually get 52%', good: true },
      { id: 'likes', label: 'Likes', value: '3,410', note: '2.4× your usual', good: false },
      { id: 'comments', label: 'Comments', value: '188', note: '62 asked the price', good: true },
      { id: 'saves', label: 'Saves', value: '902', note: 'People planning to buy', good: false },
      { id: 'followers', label: 'New followers', value: '+214', note: 'From this reel', good: false },
    ],
    commentTotal: 188,
    comments: [
      T('@tolu.b', 'avatar-ife', 'Price please!! Need this in olive too'),
      T('@stylebyada', 'palette-tone-15', 'The second look is everything. How much?'),
      T('@nneka.u', 'status-info', 'Is this back in stock?'),
      T('@brandon_x', 'avatar-ife', 'Love this style! What are the available sizes?'),
      T('@julia.k', 'palette-tone-15', 'Can I get this in black?'),
      T('@robert.m', 'status-info', 'Where can I find this item?'),
      T('@hayley.d', 'avatar-ife', 'Does this come in different colors?'),
      T('@chris.p', 'palette-tone-15', 'What is the fabric composition?'),
    ],
    answer: 'It’s reaching 3.1× your usual: a strong opening (78% watched past 3 seconds, against your usual 52%), the 7:30 PM slot, and 62 price questions in the comments. 902 saves say people are planning to buy, and the Sand set has 4 left.',
  },
  {
    id: 'post-emerald',
    title: 'New in: the Emerald slip dress',
    kind: 'Post',
    listMeta: 'Post · Mon · 9.8k reach',
    posted: 'Post · Mon 21 Sep, 12:15 PM · posted by Zee',
    caption: 'New in: the satin slip in Emerald. Sizes 8–16, link in bio.',
    image: '/products/large/emerald-post.webp',
    swatch: 'swatch-emerald',
    stats: [
      { id: 'reach', label: 'Reach', value: '9.8k', note: 'About your usual', good: false },
      { id: 'likes', label: 'Likes', value: '1,240', note: '1.2× your usual', good: true },
      { id: 'comments', label: 'Comments', value: '64', note: '21 asked about sizes', good: true },
      { id: 'saves', label: 'Saves', value: '318', note: 'People planning to buy', good: false },
      { id: 'clicks', label: 'Link clicks', value: '412', note: '6 sold from the post', good: true },
      { id: 'followers', label: 'New followers', value: '+38', note: 'From this post', good: false },
    ],
    commentTotal: 64,
    comments: [
      T('@funke.o', 'palette-tone-15', 'Is there a size 12?'),
      T('@zainab.b', 'status-info', 'This colour is stunning'),
      T('@kemi.l', 'avatar-ife', 'Does it come in black too?'),
      T('@sarah.k', 'palette-tone-15', 'How long is it on a 5’6”?'),
    ],
    answer: 'It reached 9.8k, about your usual, but it sells: 412 link clicks and 6 dresses sold from the post. 21 people asked about sizes, mostly a 12, which is running low.',
  },
  {
    id: 'post-packing',
    title: 'Packing day, behind the scenes',
    kind: 'Story',
    listMeta: 'Story · Sun · 6.1k views',
    posted: 'Story · Sun 20 Sep, 4:10 PM · posted by Zee',
    caption: 'Packing your orders with love. Tissue, ribbon, a note from Ife.',
    image: '/products/large/packing-day.webp',
    swatch: 'swatch-ecru',
    stats: [
      { id: 'views', label: 'Views', value: '6.1k', note: 'About your usual', good: false },
      { id: 'completion', label: 'Watched to the end', value: '64%', note: 'You usually get 58%', good: true },
      { id: 'replies', label: 'Replies', value: '27', note: '9 asked about delivery', good: false },
      { id: 'taps', label: 'Taps forward', value: '1.9k', note: 'Fewer than usual', good: true },
      { id: 'shares', label: 'Shares', value: '84', note: 'Shared to stories', good: false },
      { id: 'followers', label: 'New followers', value: '+19', note: 'From this story', good: false },
    ],
    commentTotal: 27,
    comments: [
      T('@ngozi.o', 'avatar-ife', 'The packaging is so cute'),
      T('@bisi.a', 'status-info', 'How long does delivery to Abuja take?'),
      T('@ada.w', 'palette-tone-15', 'Got mine yesterday, love it'),
    ],
    answer: 'A steady story: 6.1k views and 64% watched to the end, a bit above your usual. Its replies are mostly delivery questions (9), worth a pinned answer on the profile.',
  },
  {
    id: 'post-kimono',
    title: 'The kimono restock is live',
    kind: 'Post',
    listMeta: 'Post · Sat · 8.2k reach',
    posted: 'Post · Sat 19 Sep, 10:00 AM · posted by Zee',
    caption: 'The Indigo wrap kimono is back in every size. Restocked and ready.',
    image: '/products/large/kimono-restock.webp',
    swatch: 'swatch-indigo',
    stats: [
      { id: 'reach', label: 'Reach', value: '8.2k', note: 'About your usual', good: false },
      { id: 'likes', label: 'Likes', value: '980', note: 'About your usual', good: false },
      { id: 'comments', label: 'Comments', value: '41', note: '12 asked the price', good: true },
      { id: 'saves', label: 'Saves', value: '204', note: 'People planning to buy', good: false },
      { id: 'clicks', label: 'Link clicks', value: '286', note: '11 sold since Saturday', good: true },
      { id: 'followers', label: 'New followers', value: '+22', note: 'From this post', good: false },
    ],
    commentTotal: 41,
    comments: [
      T('@grace.m', 'palette-tone-15', 'Finally! Ordering now'),
      T('@chioma.styles', 'status-info', 'Is size 10 back too?'),
      T('@tolu.b', 'avatar-ife', 'How much is it?'),
    ],
    answer: 'An average reach (8.2k), but it did its job: 286 link clicks and 11 kimonos sold since Saturday. Size 10 is the most asked about.',
  },
  {
    id: 'post-fit-check',
    title: 'Fit check: Tolu in Sand',
    kind: 'Reel',
    listMeta: 'Reel · Fri · 12.4k views',
    posted: 'Reel · Fri 18 Sep, 6:45 PM · posted by Zee',
    caption: 'Fit check with Tolu in the Sand two-piece. Size 12, styled two ways.',
    image: '/products/large/fit-check.webp',
    swatch: 'post-fit-check',
    stats: [
      { id: 'views', label: 'Views', value: '12.4k', note: '0.9× your usual', good: false },
      { id: 'watched', label: 'Watched past 3s', value: '61%', note: 'You usually get 52%', good: true },
      { id: 'likes', label: 'Likes', value: '1,560', note: '1.1× your usual', good: false },
      { id: 'comments', label: 'Comments', value: '73', note: '18 asked the price', good: true },
      { id: 'saves', label: 'Saves', value: '341', note: 'People planning to buy', good: false },
      { id: 'followers', label: 'New followers', value: '+41', note: 'From this reel', good: false },
    ],
    commentTotal: 73,
    comments: [
      T('@stylebyada', 'palette-tone-15', 'Tolu looks amazing'),
      T('@julia.k', 'avatar-ife', 'Which size is she wearing?'),
      T('@nneka.u', 'status-info', 'Price please'),
    ],
    answer: 'A solid reel, if not the Sand one: 12.4k views and 61% watched past 3 seconds. It warmed people up for Tuesday’s Sand reel, which is the one that took off.',
  },
];

export const IG_DEFAULT_POST = IG_POSTS[0].id;
export const igPost = (id: string) => IG_POSTS.find((p) => p.id === id) ?? IG_POSTS[0];

/** Scripted answers for every Instagram frame (data, not components). */
export const INSTAGRAM_ANSWERS: Record<string, Answer> = Object.fromEntries([
  ...IG_POSTS.flatMap((p) => [
    [`instagram.post.${p.id}`, { reads: ['instagram'], blocks: [{ kind: 'text', text: p.answer }] }],
    [`instagram.preview.${p.id}`, { reads: ['instagram'], blocks: [{ kind: 'text', text: p.answer }] }],
    [
      `instagram.comments.${p.id}`,
      {
        reads: ['instagram', 'customers'],
        blocks: [
          { kind: 'text', text: `${p.commentTotal} comments. The ones worth answering first: ${p.comments.slice(0, 3).map((c) => `${c.handle} (“${c.text}”)`).join(', ')}. I can draft replies.` },
        ],
      },
    ],
    ...p.stats.map((s) => [
      `instagram.stat.${p.id}.${s.id}`,
      { reads: ['instagram'], blocks: [{ kind: 'text', text: `${s.label}: ${s.value} on “${p.title}” — ${s.note.charAt(0).toLowerCase()}${s.note.slice(1)}.` }] },
    ]),
  ]),
  ['instagram.account.followers', { reads: ['instagram'], blocks: [{ kind: 'text', text: '12.4k followers, 214 of them new today. 62% of today’s came from the Sand reel.' }] }],
  ['instagram.account.reach', { reads: ['instagram'], blocks: [{ kind: 'text', text: '18.2k accounts reached in the last 7 days, most of it from Tuesday’s Sand reel.' }] }],
  ['instagram.account.posts', { reads: ['instagram'], blocks: [{ kind: 'text', text: '5 posts in the last 7 days: 2 reels, 2 posts and a story. The reels did best.' }] }],
]);
