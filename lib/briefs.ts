import { BRIEFS, type Brief } from '@/data/history';
import { PAGE_TITLES } from '@/data/nav';
import { TEAM } from '@/data/team';
import type { HistoryState, Message, SavedThread } from './store';

// History's list: conversations saved by New chat go on top of "Today" (brief B7.2), then the
// seeded chain. A saved thread becomes one brief, named after its last question (like the 2:33
// brief, whose thread starts with the 2:31 Sand question).

export function briefFromThread(thread: SavedThread): Brief | null {
  const msgs = thread.messages;
  let at = -1;
  for (let i = msgs.length - 1; i >= 0; i--) if (msgs[i].kind === 'user') { at = i; break; }
  if (at < 0) return null;
  const q = msgs[at] as Extract<Message, { kind: 'user' }>;
  const answer = msgs.slice(at + 1).find((m) => m.kind === 'hop');
  const firstText = answer?.kind === 'hop' ? answer.blocks.find((b) => b.kind === 'text') : undefined;
  return {
    id: thread.id,
    day: 'Today',
    date: 'Thu 24 Sep',
    who: q.author,
    time: q.time,
    page: q.page,
    pageLabel: q.page === 'analytics' ? 'Chat' : PAGE_TITLES[q.page],
    question: q.text,
    tag: q.tag,
    summary: firstText?.kind === 'text' ? firstText.text : '',
    kind: q.tag ? 'tagged' : q.page === 'analytics' ? 'analytics' : 'screenshot',
    view: q.view,
    // What History shows is the finished thread: nothing streams or thinks there.
    thread: msgs.map((m) => (m.kind === 'hop' ? { ...m, status: 'done' as const } : m)),
    anchor: q.id,
  };
}

export function allBriefs(threads: SavedThread[]): Brief[] {
  return [...threads.map(briefFromThread).filter((b): b is Brief => b !== null), ...BRIEFS];
}

export function matches(b: Brief, f: Pick<HistoryState, 'person' | 'pageFilter' | 'query'>) {
  if (f.person !== 'all' && b.who !== f.person) return false;
  if (f.pageFilter !== 'all' && b.page !== f.pageFilter) return false;
  const q = f.query.trim().toLowerCase();
  if (!q) return true;
  return [b.question, b.summary, b.tag?.label ?? '', TEAM[b.who].name, b.pageLabel].some((s) => s.toLowerCase().includes(q));
}

/** The note above the left side (Figma "Snapshot note"; wording from brief B7.5). */
export function snapshotNote(b: Brief) {
  const name = TEAM[b.who].name;
  if (b.page === 'analytics') {
    const when = b.who === 'hop' ? 'when Hop wrote the morning brief' : b.tag ? `when ${name} tagged “${b.tag.label}”` : `when ${name} asked`;
    return `Analytics as it was at ${b.time}, ${b.date} — ${when}`;
  }
  const page = PAGE_TITLES[b.page];
  if (b.tag) return `Screenshot of ${page} — taken at ${b.time} when ${name} tagged “${b.tag.label}”`;
  return `Screenshot of ${page} — taken at ${b.time}, ${b.date}, when ${name} asked`;
}
