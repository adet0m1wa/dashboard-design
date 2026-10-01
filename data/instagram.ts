import type { Answer } from './conversation';
import { dateOf, weekdayOf } from './orders';
import { between, pick, rng } from './random';
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
  day: number; // data/orders day numbers: 0 = Mon 3 Aug, 50 = Tue 22 Sep
  time: string; // "7:30 PM"
  metric: string; // the headline number for the list: "41.2k views", "9.8k reach"
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

const WEEK: IgPost[] = [
  {
    id: 'post-sand-reel',
    title: 'Styling the Sand set 3 ways',
    kind: 'Reel',
    day: 50,
    time: '7:30 PM',
    metric: '41.2k views',
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
    day: 49,
    time: '12:15 PM',
    metric: '9.8k reach',
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
    day: 48,
    time: '4:10 PM',
    metric: '6.1k views',
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
    day: 47,
    time: '10:00 AM',
    metric: '8.2k reach',
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
    day: 46,
    time: '6:45 PM',
    metric: '12.4k views',
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

// Before this week (user feedback 2026-10-01: a calendar to see what was posted each day). The
// four from 12–16 Sep are the ones last week's Analytics cards show; the rest go back to the
// store's opening. Their numbers come from a seeded generator around the account's usual (reels
// ~13.3k views, posts ~8.5k reach, stories ~6k views), scaled by how well each one did.
type Earlier = { id: string; day: number; time: string; kind: IgPost['kind']; title: string; caption: string; photo: string; swatch: Swatch; did: number };
const EARLIER: Earlier[] = [
  { id: 'post-opening-teaser', day: -1, time: '6:00 PM', kind: 'Post', title: 'Opening tomorrow: the first drop', caption: 'The online store opens tomorrow at 9 AM. Linen sets, slips and adire, made in Lagos.', photo: 'sand-linen', swatch: 'swatch-sand', did: 1 },
  { id: 'post-opening', day: 0, time: '9:00 AM', kind: 'Reel', title: 'We’re open: the first drop', caption: 'We’re live! A walk through the first drop. Link in bio.', photo: 'olive-linen', swatch: 'swatch-olive', did: 1.6 },
  { id: 'post-adire', day: 4, time: '7:00 PM', kind: 'Post', title: 'Meet the Adire shirt dress', caption: 'Hand-dyed adire, cut into an easy shirt dress. Every piece is one of a kind.', photo: 'adire-dress', swatch: 'swatch-adire', did: 1.2 },
  { id: 'post-trousers', day: 8, time: '7:30 PM', kind: 'Reel', title: 'Wide-leg trousers, 3 ways', caption: 'One pair of Ecru wide-legs, three looks. Which would you wear?', photo: 'ecru-trousers', swatch: 'swatch-ecru', did: 1.1 },
  { id: 'post-tote', day: 12, time: '11:00 AM', kind: 'Post', title: 'The canvas tote, for everything', caption: 'Market runs, laptop days, beach weekends. The canvas tote does it all.', photo: 'canvas-tote', swatch: 'swatch-ecru', did: 0.8 },
  { id: 'post-terracotta', day: 16, time: '6:30 PM', kind: 'Reel', title: 'New colour: the Terracotta scarf', caption: 'Our silk scarf now comes in Terracotta. Tie it, wrap it, wear it in your hair.', photo: 'terracotta-scarf', swatch: 'swatch-terracotta', did: 0.9 },
  { id: 'post-poplin', day: 20, time: '12:00 PM', kind: 'Post', title: 'Crisp poplin shirts are in', caption: 'The poplin shirt in white: crisp, easy, made for hot days.', photo: 'poplin-shirt', swatch: 'swatch-white', did: 0.8 },
  { id: 'post-midi', day: 24, time: '7:15 PM', kind: 'Reel', title: 'The pleated midi, on the move', caption: 'Watch it swing. The Navy pleated midi in motion.', photo: 'navy-skirt', swatch: 'swatch-indigo', did: 1 },
  { id: 'post-white-shirt', day: 27, time: '10:30 AM', kind: 'Post', title: 'White linen for the last of August', caption: 'The linen shirt in white, for the last warm weekends of the month.', photo: 'white-shirt', swatch: 'swatch-white', did: 0.9 },
  { id: 'post-kimono-evening', day: 31, time: '8:00 PM', kind: 'Reel', title: 'The wrap kimono, styled for evening', caption: 'From day to dinner: the Indigo wrap kimono over a slip.', photo: 'indigo-kimono', swatch: 'swatch-indigo', did: 1.2 },
  { id: 'post-sand-photos', day: 34, time: '1:00 PM', kind: 'Post', title: 'You in Sand: your photos', caption: 'You sent us your Sand set photos and we love them. Keep tagging @amara.atelier.', photo: 'sand-linen', swatch: 'swatch-sand', did: 1 },
  { id: 'post-olive-teaser', day: 37, time: '5:00 PM', kind: 'Story', title: 'Olive linen is coming back', caption: 'Olive linen returns this Sunday. Turn on notifications.', photo: 'olive-linen', swatch: 'swatch-olive', did: 1.1 },
  { id: 'post-rust', day: 40, time: '6:00 PM', kind: 'Reel', title: 'Three ways to tie the Rust scarf', caption: 'Three ways to tie the Rust silk scarf. Which is yours?', photo: 'rust-scarf', swatch: 'swatch-rust', did: 0.8 },
  { id: 'post-olive', day: 41, time: '11:00 AM', kind: 'Post', title: 'Olive linen is back', caption: 'Olive linen is back in every size. Link in bio.', photo: 'olive-linen', swatch: 'swatch-olive', did: 0.7 },
  { id: 'post-clutch', day: 42, time: '7:00 PM', kind: 'Post', title: 'Wedding guest edit: the gold clutch', caption: 'Wedding season is here. The beaded clutch in gold, with everything.', photo: 'gold-clutch', swatch: 'swatch-sand', did: 0.9 },
  { id: 'post-mocha', day: 44, time: '8:30 AM', kind: 'Reel', title: 'Slow mornings in the Mocha robe', caption: 'Coffee, quiet, and the Mocha cotton robe.', photo: 'mocha-robe', swatch: 'swatch-sand', did: 1.3 },
];

const POOL: [string, AvatarColor, string][] = [
  ['@amaka.o', 'avatar-ife', 'Price please'],
  ['@lara.b', 'palette-tone-15', 'Do you ship to Accra?'],
  ['@titi.s', 'status-info', 'Is there a size 16?'],
  ['@efua.m', 'avatar-ife', 'Love this colour'],
  ['@hauwa.d', 'palette-tone-15', 'Restock when?'],
  ['@simi.a', 'status-info', 'Need this for a wedding'],
  ['@ope.k', 'avatar-ife', 'How long does delivery take?'],
  ['@zara.u', 'palette-tone-15', 'Styled so well'],
  ['@kofi.a', 'status-info', 'Ordering one for my wife'],
  ['@temi.f', 'avatar-ife', 'What size is she wearing?'],
  ['@chioma.styles', 'status-info', 'Adding to my wishlist'],
  ['@stylebyada', 'palette-tone-15', 'Obsessed with this'],
];

const USUAL = { Reel: 13300, Post: 8500, Story: 6000 } as const;
const compactK = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`);
const versus = (did: number) => (did >= 0.95 && did <= 1.05 ? 'About your usual' : `${did.toFixed(1)}× your usual`);

function earlier(e: Earlier, i: number): IgPost {
  const r = rng(7001 + i * 131);
  const reach = Math.round((USUAL[e.kind] * e.did * (0.92 + r() * 0.16)) / 100) * 100;
  const asked = between(r, 6, 22);
  const comments = Math.round(reach * (0.004 + r() * 0.003));
  const saves = Math.round(reach * (0.018 + r() * 0.012));
  const followers = Math.round(reach * (0.002 + r() * 0.002));
  const { d, month } = dateOf(e.day);
  const weekday = weekdayOf(((e.day % 7) + 7) % 7);
  const stats: IgStat[] =
    e.kind === 'Reel'
      ? [
          { id: 'views', label: 'Views', value: compactK(reach), note: versus(e.did), good: e.did > 1.05 },
          { id: 'watched', label: 'Watched past 3s', value: `${between(r, 46, 66)}%`, note: 'You usually get 52%', good: e.did > 1 },
          { id: 'likes', label: 'Likes', value: Math.round(reach * (0.08 + r() * 0.04)).toLocaleString('en-US'), note: versus(e.did), good: false },
          { id: 'comments', label: 'Comments', value: `${comments}`, note: `${Math.min(asked, comments)} asked the price`, good: true },
          { id: 'saves', label: 'Saves', value: saves.toLocaleString('en-US'), note: 'People planning to buy', good: false },
          { id: 'followers', label: 'New followers', value: `+${followers}`, note: 'From this reel', good: false },
        ]
      : e.kind === 'Post'
        ? [
            { id: 'reach', label: 'Reach', value: compactK(reach), note: versus(e.did), good: e.did > 1.05 },
            { id: 'likes', label: 'Likes', value: Math.round(reach * (0.1 + r() * 0.04)).toLocaleString('en-US'), note: versus(e.did), good: false },
            { id: 'comments', label: 'Comments', value: `${comments}`, note: `${Math.min(asked, comments)} asked the price`, good: true },
            { id: 'saves', label: 'Saves', value: saves.toLocaleString('en-US'), note: 'People planning to buy', good: false },
            { id: 'clicks', label: 'Link clicks', value: `${Math.round(reach * 0.03)}`, note: `${between(r, 3, 9)} sold from the post`, good: true },
            { id: 'followers', label: 'New followers', value: `+${followers}`, note: 'From this post', good: false },
          ]
        : [
            { id: 'views', label: 'Views', value: compactK(reach), note: versus(e.did), good: e.did > 1.05 },
            { id: 'completion', label: 'Watched to the end', value: `${between(r, 54, 68)}%`, note: 'You usually get 58%', good: true },
            { id: 'replies', label: 'Replies', value: `${comments}`, note: `${Math.min(asked, comments)} asked when`, good: false },
            { id: 'taps', label: 'Taps forward', value: compactK(Math.round(reach * 0.3)), note: 'About usual', good: false },
            { id: 'shares', label: 'Shares', value: `${Math.round(reach * 0.012)}`, note: 'Shared to stories', good: false },
            { id: 'followers', label: 'New followers', value: `+${followers}`, note: 'From this story', good: false },
          ];
  return {
    id: e.id,
    title: e.title,
    kind: e.kind,
    day: e.day,
    time: e.time,
    metric: `${compactK(reach)} ${e.kind === 'Post' ? 'reach' : 'views'}`,
    lift: e.did >= 1.5 ? `${e.did.toFixed(1)}×` : undefined,
    posted: `${e.kind} · ${weekday} ${d} ${month}, ${e.time} · posted by Zee`,
    caption: e.caption,
    image: `/products/large/${e.photo}.webp`,
    swatch: e.swatch,
    stats,
    commentTotal: comments,
    comments: pick(r, POOL, 3).map(([h, a, t]) => T(h, a, t)),
    answer: `${e.kind === 'Post' ? 'It reached' : 'It got'} ${compactK(reach)}${e.kind === 'Post' ? '' : ' views'}, ${versus(e.did).toLowerCase()}. ${comments} comments, ${Math.min(asked, comments)} of them about the price, and ${saves} saves.`,
  };
}

/** Every post, newest first. */
export const IG_POSTS: IgPost[] = [...WEEK, ...EARLIER.map(earlier).reverse()];
/** "Posted this week": the last 7 days, Fri 18 – Thu 24 Sep. */
export const IG_WEEK_FROM = 46;
export const IG_WEEK = IG_POSTS.filter((p) => p.day >= IG_WEEK_FROM);
export const postsOn = (day: number) => IG_POSTS.filter((p) => p.day === day);
export const IG_POST_DAYS = new Set(IG_POSTS.map((p) => p.day));
/** The day a post's list has to show it on: null when it's in the last 7 days. */
export const igListDay = (id: string): number | null => {
  const p = igPost(id);
  return p.day >= IG_WEEK_FROM ? null : p.day;
};
/** The list line under a post's title: the weekday in the week's list, the time in a day's. */
export const listMeta = (p: IgPost, byDay: boolean) => `${p.kind} · ${byDay ? p.time : weekdayOf(((p.day % 7) + 7) % 7)} · ${p.metric}`;

export const IG_DEFAULT_POST = WEEK[0].id;
export function igPost(id: string) {
  return IG_POSTS.find((p) => p.id === id) ?? IG_POSTS[0];
}

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
