'use client';

import { IG_ACCOUNT, IG_HANDLE, IG_WEEK, igPost, listMeta, postsOn, type IgPost } from '@/data/instagram';
import { dateOf, weekdayOf } from '@/data/orders';
import { useHop } from '@/lib/store';
import { ExternalIcon, PlayIcon } from '@/components/icons/figma';
import { HopFrame } from '@/components/select/HopFrame';
import { OutlineButton } from '@/components/ui/OutlineButton';
import { InitialsAvatar } from '@/components/ui/PersonAvatar';
import { Thumb } from '@/components/ui/Thumb';
import { Truncate } from '@/components/ui/Truncate';
import { PostCalendar, useBackToWeek } from './PostCalendar';

// Instagram (designed 2026-10-01): the Figma Instagram card in History ("asked on another page",
// 1839:3721) drawn at full size — that card is this page at 0.83, so every value here is the
// Figma one ÷ 0.83. Left: the account and the week's posts; right: the picked post — preview,
// how it did against the usual, and the comments worth answering. Picking a post swaps the right
// side at once. History's 1:40 PM brief now draws this page instead of a flat image. Under 800px
// wide the preview shrinks so the stats keep two readable columns. Round 7: a calendar beside
// "Posted this week" lists any day's posts instead.
export function InstagramPage() {
  const postId = useHop((s) => s.pages.igPost);
  const post = igPost(postId);

  return (
    <div className="@container flex h-full min-h-[480px]">
      <PostList selected={post.id} />
      <PostCanvas post={post} />
    </div>
  );
}

function PostList({ selected }: { selected: string }) {
  const setPages = useHop((s) => s.setPages);
  const day = useHop((s) => s.pages.igDay);
  const backToWeek = useBackToWeek();
  const posts = day === null ? IG_WEEK : postsOn(day);
  const heading = day === null ? 'Posted this week' : `Posted ${weekdayOf(((day % 7) + 7) % 7)} ${dateOf(day).d} ${dateOf(day).month}`;
  return (
    <div className="flex w-[250px] shrink-0 flex-col border-r border-surface-divider-tint">
      <div className="flex gap-6 border-b border-surface-divider-tint px-16 py-14">
        {IG_ACCOUNT.map((s) => (
          <HopFrame key={s.id} id={`instagram.account.${s.id}`} label={s.label} page="instagram" radius={10} className="flex min-w-0 flex-1 flex-col gap-1 rounded-8 bg-surface-subtle px-9 py-7">
            <span className="text-10-5 text-text-secondary">{s.label}</span>
            <span className="text-14 font-600 tracking-px-0-141 text-text-primary tabular-nums">{s.value}</span>
          </HopFrame>
        ))}
      </div>
      <div className="flex items-center justify-between gap-8 px-16 pb-6 pt-14">
        <h2 className="text-11-5 font-500 text-text-muted">{heading}</h2>
        <div className="flex items-center gap-10">
          {day !== null && (
            <button type="button" onClick={backToWeek} className="relative rounded-4 text-11-5 font-500 text-text-secondary transition-colors duration-(--dur-fast) ease-hop-color after:absolute after:-inset-6 hover:text-text-primary">
              This week
            </button>
          )}
          <PostCalendar />
        </div>
      </div>
      <ul>
        {posts.map((p) => {
          const on = p.id === selected;
          return (
            <li key={p.id}>
              <HopFrame id={`instagram.post.${p.id}`} label={p.title} page="instagram" className={on ? 'bg-palette-tone-29' : ''}>
                <button
                  type="button"
                  onClick={() => setPages({ igPost: p.id })}
                  aria-current={on}
                  className="flex w-full items-center gap-10 px-16 py-10 text-left hover:bg-surface-faint"
                >
                  {on && <span aria-hidden="true" className="absolute left-0 top-[24px] h-[24px] w-[3px] rounded-2 bg-action-primary" />}
                  <Thumb id={p.id} swatch={p.swatch} className="h-[52px] w-[40px] rounded-6" />
                  <span className="flex min-w-0 flex-1 flex-col gap-3">
                    <Truncate className="text-12-5 font-500 text-text-primary">{p.title}</Truncate>
                    <Truncate className="text-11 text-text-muted">{listMeta(p, day !== null)}</Truncate>
                  </span>
                  {p.lift && <span className="shrink-0 rounded-10 bg-status-success-soft px-6 py-1 text-10-5 font-600 text-status-success-text">{p.lift}</span>}
                </button>
              </HopFrame>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function PostCanvas({ post }: { post: IgPost }) {
  const showToast = useHop((s) => s.showToast);
  const playable = post.kind !== 'Post';

  return (
    // Scrolls inside itself, so its scrollbar sits on the grey canvas — scrolling the page put it
    // on a white strip down the canvas edge (user feedback 2026-10-02).
    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-16 overflow-y-auto bg-surface-canvas px-24 py-20">
      <div className="flex items-center justify-between gap-12">
        <div className="flex min-w-0 flex-col gap-4">
          <h2 className="truncate text-17 font-600 tracking-px-0-166 text-text-primary">{post.title}</h2>
          <p className="truncate text-12 text-text-secondary">{post.posted}</p>
        </div>
        <OutlineButton onClick={() => showToast('Opening Instagram is coming soon')}>
          Open post
          <ExternalIcon className="text-text-secondary" />
        </OutlineButton>
      </div>

      <div className="flex items-start gap-16">
        <HopFrame
          id={`instagram.preview.${post.id}`}
          label={`${post.kind} preview`}
          page="instagram"
          radius={14}
          className="flex h-[347px] w-[225px] shrink-0 flex-col items-center justify-between rounded-14 p-12 @max-[800px]:h-[278px] @max-[800px]:w-[180px]"
        >
          {/* The photo, with a dark wash at the foot so the caption reads (Figma's was a gradient
              stand-in). They round their own corners: the frame doesn't clip, so its outline
              and handles can sit outside it. */}
          <img src={post.image} alt="" decoding="async" className="absolute inset-0 size-full rounded-14 object-cover" />
          <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/2 rounded-b-14 bg-linear-to-t from-palette-tone-11/60 to-transparent" />
          <span className="relative self-start rounded-6 bg-surface-default px-7 py-2 text-10-5 font-600 text-text-primary">{post.kind}</span>
          {playable ? (
            <span aria-hidden="true" className="relative flex size-[40px] items-center justify-center rounded-full bg-surface-default text-text-primary">
              <PlayIcon />
            </span>
          ) : (
            <span />
          )}
          <span className="relative flex w-full flex-col gap-2 text-11 text-text-on-dark">
            <span className="font-600">{IG_HANDLE}</span>
            <span className="leading-15">{post.caption}</span>
          </span>
        </HopFrame>

        {/* As tall as the preview, three even rows down it, so the last two tiles sit on the
            preview's bottom edge (round 9). The tiles take up the height rather than the gaps:
            spreading the gaps left 53px holes beside the larger preview. */}
        <div className="grid min-w-0 flex-1 grid-cols-2 grid-rows-3 gap-x-10 gap-y-16 self-stretch">
          {post.stats.map((s) => (
            <HopFrame
              key={s.id}
              id={`instagram.stat.${post.id}.${s.id}`}
              label={`${s.label} · ${post.title}`}
              page="instagram"
              radius={10}
              className="flex min-w-0 flex-col justify-center gap-3 rounded-10 border border-surface-border-tint bg-surface-default px-12 py-10"
            >
              {/* Each line stays on one line (user feedback 2026-10-02): the copy is written to fit. */}
              <span className="whitespace-nowrap text-11-5 text-text-secondary">{s.label}</span>
              <span className="text-18 font-600 tracking-px-0-166 text-text-primary tabular-nums">{s.value}</span>
              <span className={`whitespace-nowrap text-11 ${s.good ? 'text-status-success-text' : 'text-text-muted'}`}>{s.note}</span>
            </HopFrame>
          ))}
        </div>
      </div>

      <HopFrame
        id={`instagram.comments.${post.id}`}
        label={`Comments · ${post.title}`}
        page="instagram"
        jumpTarget="customers"
        radius={14}
        className="flex flex-col gap-12 rounded-12 border border-surface-border-tint bg-surface-default p-16"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-13 font-600 text-text-primary">Top comments</h3>
          <span className="text-12 text-text-muted">{post.commentTotal} total</span>
        </div>
        {post.comments.map((c, i) => (
          <div key={`${c.handle}-${i}`} className="flex items-center gap-10">
            <InitialsAvatar initials={c.initial} color={c.avatar} size={26} />
            <span className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="text-12 font-500 text-text-primary">{c.handle}</span>
              <Truncate className="text-12-5 text-text-strong-secondary">{c.text}</Truncate>
            </span>
            <button
              type="button"
              onClick={() => showToast(`Replying to ${c.handle} is coming soon`)}
              className="relative shrink-0 rounded-4 text-12 font-500 text-text-secondary transition-colors duration-(--dur-fast) ease-hop-color after:absolute after:-inset-6 hover:text-text-primary"
            >
              Reply
            </button>
          </div>
        ))}
      </HopFrame>
    </div>
  );
}
