'use client';

import { useEffect, useRef, useState } from 'react';
import { STATUS_TONE, thread as findThread, THREADS, WAITING_COUNT, waitTone, type Bubble, type InboxTab, type Thread } from '@/data/customers';
import { useHop } from '@/lib/store';
import { UpIcon } from '@/components/icons/figma';
import { HopAvatar } from '@/components/hop/HopAvatar';
import { HopFrame } from '@/components/select/HopFrame';
import { OutlineButton } from '@/components/ui/OutlineButton';
import { InitialsAvatar } from '@/components/ui/PersonAvatar';
import { Segmented } from '@/components/ui/Segmented';
import { SmallButton } from '@/components/ui/SmallButton';
import { Tag } from '@/components/ui/Tag';
import { Truncate } from '@/components/ui/Truncate';

// Customers (designed 2026-10-01 after the older "04 · Customers" Figma reference, in today's
// styling): the DM inbox (waiting first, how long in red), the open conversation with Hop's
// drafted reply on top of the composer, and who the customer is — what they've spent, their
// recent orders, the team's notes. Picking a conversation or a tab changes things at once.
// Under 800px wide (Hop open on a smaller laptop) the profile steps aside so the conversation
// keeps room, and the header drops its wait tag when the conversation itself gets narrow.
export function CustomersPage() {
  const threadId = useHop((s) => s.pages.thread);
  const t = findThread(threadId);
  return (
    <div className="@container flex h-full min-h-[560px]">
      <Inbox selected={t.id} />
      <Conversation key={t.id} t={t} />
      <Profile t={t} />
    </div>
  );
}

const TABS: { id: InboxTab; label: string; count?: number }[] = [
  { id: 'all', label: 'All' },
  { id: 'waiting', label: 'Waiting', count: WAITING_COUNT },
  { id: 'vip', label: 'VIP' },
];

function Inbox({ selected }: { selected: string }) {
  const tab = useHop((s) => s.pages.inboxTab);
  const query = useHop((s) => s.pages.inboxQuery.trim().toLowerCase());
  const setPages = useHop((s) => s.setPages);
  const rows = THREADS.filter((x) => (tab === 'waiting' ? x.waiting : tab === 'vip' ? x.vip : true)).filter((x) => !query || x.name.toLowerCase().includes(query));

  return (
    <div className="flex w-[240px] shrink-0 flex-col border-r border-surface-divider-tint">
      <div className="px-12 py-12">
        <Segmented label="Show conversations" options={TABS} value={tab} onChange={(inboxTab) => setPages({ inboxTab })} stretch />
      </div>
      <ul aria-label="Conversations" className="min-h-0 flex-1 overflow-y-auto">
        {rows.map((x) => {
          const on = x.id === selected;
          return (
            <li key={x.id}>
              <HopFrame id={`customers.chat.${x.id}`} label={`Chat thread · ${x.name}`} page="customers" className={`border-b border-surface-divider-tint ${on ? 'bg-palette-tone-29' : ''}`}>
                <button
                  type="button"
                  onClick={() => setPages({ thread: x.id })}
                  aria-current={on}
                  className="flex w-full items-start gap-10 px-14 py-10 text-left hover:bg-surface-faint"
                >
                  {on && <span aria-hidden="true" className="absolute left-0 top-[18px] h-[24px] w-[3px] rounded-2 bg-action-primary" />}
                  <InitialsAvatar initials={x.initials} color={x.avatar} size={32} />
                  <span className="flex min-w-0 flex-1 flex-col gap-3">
                    <span className="flex items-center justify-between gap-8">
                      <Truncate className="text-13 font-500 text-text-primary">{x.name}</Truncate>
                      <span className="shrink-0 text-11 text-text-muted">{x.time}</span>
                    </span>
                    <span className="flex items-center justify-between gap-6">
                      <Truncate className={`text-12 ${x.waiting ? 'text-text-strong-secondary' : 'text-text-secondary'}`}>{x.preview}</Truncate>
                      {x.waiting && <Tag tone={waitTone(x.waiting)}>{x.waiting}</Tag>}
                    </span>
                  </span>
                </button>
              </HopFrame>
            </li>
          );
        })}
        {rows.length === 0 && <li className="px-16 pt-24 text-center text-12-5 text-text-secondary">No conversations match.</li>}
      </ul>
    </div>
  );
}

function Conversation({ t }: { t: Thread }) {
  const showToast = useHop((s) => s.showToast);
  const navigate = useHop((s) => s.navigate);
  const scroller = useRef<HTMLDivElement>(null);
  const [reply, setReply] = useState('');
  const first = t.name.split(' ')[0];

  // Open on the newest message.
  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  let lastDay: Bubble['day'] | null = null;
  return (
    <HopFrame id="customers.thread" label={`Conversation · ${t.name}`} page="customers" className="@container flex min-w-0 flex-1 flex-col border-r border-surface-divider-tint">
      <div className="flex items-center justify-between gap-12 border-b border-surface-divider-tint px-20 py-12">
        <div className="flex min-w-0 items-center gap-10">
          <InitialsAvatar initials={t.initials} color={t.avatar} size={40} />
          <div className="flex min-w-0 flex-col gap-2">
            <Truncate className="text-15 font-600 text-text-primary">{t.name}</Truncate>
            <Truncate className="text-11-5 text-text-muted">{t.handle}</Truncate>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-8">
          {t.waiting && (
            <span className="@max-[440px]:hidden">
              <Tag tone={waitTone(t.waiting)}>Waiting {t.waiting}</Tag>
            </span>
          )}
          <OutlineButton onClick={() => navigate('sales', 'link')}>View orders</OutlineButton>
        </div>
      </div>

      <div ref={scroller} className="flex min-h-0 flex-1 flex-col gap-12 overflow-y-auto px-20 py-16" role="log" aria-label={`Conversation with ${t.name}`}>
        {t.messages.map((m, i) => {
          const header = m.day !== lastDay ? m.day : null;
          lastDay = m.day;
          const mine = m.from === 'team';
          return (
            <div key={i} className="flex flex-col gap-12">
              {header && <span className="self-center text-11 text-text-muted">{header}</span>}
              <div className={`flex max-w-[78%] flex-col gap-4 ${mine ? 'items-end self-end' : 'items-start'}`}>
                <p
                  className={`rounded-12 px-12 py-8 text-12-5 leading-18 ${
                    mine ? 'bg-action-primary text-text-on-dark' : 'border border-surface-border-tint bg-surface-default text-text-primary'
                  }`}
                >
                  {m.text}
                </p>
                <span className="text-11 text-text-muted">{m.meta}</span>
              </div>
            </div>
          );
        })}

        {t.draft && (
          <HopFrame
            id={`customers.draft.${t.id}`}
            label={`Hop’s draft · ${t.name}`}
            page="customers"
            radius={14}
            className="flex flex-col gap-10 rounded-12 border border-status-success-soft bg-surface-default p-12"
          >
            <span className="flex items-center gap-6 text-11-5 font-500 text-status-success-text">
              <HopAvatar size={16} />
              {t.draft.note}
            </span>
            <p className="text-12-5 leading-18 text-text-primary">{t.draft.text}</p>
            <div className="flex gap-8">
              <SmallButton variant="primary" onClick={() => showToast(`Reply sent to ${first}`)}>
                Send reply
              </SmallButton>
              <SmallButton variant="secondary" onClick={() => setReply(t.draft?.text ?? '')}>
                Edit
              </SmallButton>
            </div>
          </HopFrame>
        )}
      </div>

      <form
        className="px-20 pb-16"
        onSubmit={(e) => {
          e.preventDefault();
          if (!reply.trim()) return;
          showToast(`Reply sent to ${first}`);
          setReply('');
        }}
      >
        <div className="flex items-center gap-8 rounded-12 border border-surface-border-tint bg-surface-default py-6 pl-12 pr-6 transition-colors duration-(--dur-fast) ease-hop-color has-[input:focus]:border-selection">
          <input
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder={`Reply to ${first}…`}
            aria-label={`Reply to ${t.name}`}
            className="min-w-0 flex-1 bg-transparent text-12-5 text-text-primary outline-none placeholder:text-text-muted"
          />
          <span className="shrink-0 rounded-6 bg-surface-subtle px-6 py-2 text-11 font-500 text-text-secondary">Instagram DM</span>
          <button type="submit" aria-label="Send reply" className="flex size-[26px] shrink-0 items-center justify-center rounded-full bg-action-primary text-text-on-dark">
            <UpIcon />
          </button>
        </div>
      </form>
    </HopFrame>
  );
}

const TAG_TONE: Record<string, string> = {
  VIP: 'bg-status-warning-soft text-status-warning-text',
  'Repeat buyer': 'bg-status-success-soft text-status-success-text',
};

function Profile({ t }: { t: Thread }) {
  const p = t.profile;
  return (
    <HopFrame id={`customers.profile.${t.id}`} label={`${t.name} · customer`} page="customers" jumpTarget="sales" className="flex w-[230px] shrink-0 flex-col gap-18 overflow-y-auto px-16 py-16 @max-[800px]:hidden">
      <div className="flex gap-6">
        {[
          ['Spent', p.spent],
          ['Orders', p.orders],
          ['Avg order', p.average],
        ].map(([label, value]) => (
          <div key={label} className="flex min-w-0 flex-1 flex-col gap-1 rounded-8 bg-surface-subtle px-8 py-6">
            <span className="text-10-5 text-text-secondary">{label}</span>
            <span className="text-13 font-600 text-text-primary tabular-nums">{value}</span>
          </div>
        ))}
      </div>

      <section className="flex flex-col gap-10">
        <h3 className="text-12 font-500 text-text-secondary">Recent orders</h3>
        {p.recent.map((o) => (
          <div key={o.order} className="flex items-center justify-between gap-8">
            <span className="flex min-w-0 flex-col gap-1">
              <Truncate className="text-12 font-500 text-text-primary">{o.item}</Truncate>
              <span className="text-11 text-text-muted tabular-nums">
                #{o.order} · {o.total}
              </span>
            </span>
            <Tag tone={STATUS_TONE[o.status]}>{o.status}</Tag>
          </div>
        ))}
      </section>

      {p.notes && (
        <section className="flex flex-col gap-6">
          <h3 className="text-12 font-500 text-text-secondary">Notes</h3>
          <p className="text-12 leading-18 text-text-strong-secondary">{p.notes}</p>
          <span className="text-11 text-text-muted">{p.notesBy}</span>
        </section>
      )}

      <section className="flex flex-col gap-8">
        <h3 className="text-12 font-500 text-text-secondary">Tags</h3>
        <div className="flex flex-wrap gap-6">
          {p.tags.map((tag) => (
            <span key={tag} className={`rounded-999 px-8 py-2 text-11 font-500 ${TAG_TONE[tag] ?? 'bg-surface-subtle text-text-secondary'}`}>
              {tag}
            </span>
          ))}
        </div>
      </section>
    </HopFrame>
  );
}
