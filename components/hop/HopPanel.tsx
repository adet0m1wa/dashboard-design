'use client';

import { AnimatePresence, motion, useReducedMotion, type Variants } from 'motion/react';
import { useEffect, useLayoutEffect, useRef } from 'react';
import { PROMPT_CUES } from '@/data/conversation';
import { PAGE_TITLES } from '@/data/nav';
import { duration, easeIn, easeOut, press, timing } from '@/lib/motion';
import { useHop, type Message } from '@/lib/store';
import { ArrowRIcon, NewChatIcon } from '@/components/icons/figma';
import { HopAvatar, type HopAvatarState } from './HopAvatar';
import { Composer } from './Composer';
import { HopMessage, Marker, UserMessage } from './Message';

// The Hop panel, on every page (brief B7.2). Header (avatar + "Hop" + New chat — the Analytics
// header everywhere, B11 #3), the conversation, prompt cues / jump chips, and the composer.
export function HopPanel() {
  const page = useHop((s) => s.page);
  const selection = useHop((s) => s.selection);
  const hopStatus = useHop((s) => s.hopStatus);
  const jumpOrigin = useHop((s) => s.jumpOrigin);
  const scanning = useHop((s) => s.scanning);
  const announce = useHop((s) => s.announce);
  const newChat = useHop((s) => s.newChat);
  const ask = useHop((s) => s.ask);

  const avatar: HopAvatarState = scanning ? 'scanning' : hopStatus === 'thinking' ? 'thinking' : 'idle';
  // Jump chips (brief B3): Analytics with a selection that has a jump target, or any page
  // reached through a jump chip. Prompt cues: Analytics only, nothing selected, and not while
  // an answer is coming in. On Analytics they swap: cues out (fast) → chips in (base).
  const showChips = (page === 'analytics' && Boolean(selection?.jumpTarget)) || jumpOrigin !== null;
  const showCues = !showChips && page === 'analytics' && !selection && hopStatus === 'idle';
  const bottom = showChips ? 'chips' : showCues ? 'cues' : null;

  return (
    <aside className="flex w-panel shrink-0 flex-col border-l border-surface-divider-tint bg-surface-default" aria-label="Hop">
      <header className="flex h-bar shrink-0 items-center justify-between border-b border-surface-faint px-16">
        <div className="flex items-center gap-10">
          <HopAvatar state={avatar} />
          <span className="text-14 font-600 text-text-primary">Hop</span>
        </div>
        <motion.button type="button" whileTap={press} onClick={newChat} aria-label="New chat" className="rounded-4 text-text-black">
          <NewChatIcon />
        </motion.button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-16 px-16 py-14">
        <MessageList masked={bottom !== null} />
        <AnimatePresence initial={false} mode="wait">
          {bottom === 'chips' && <JumpChips key="chips" />}
          {bottom === 'cues' && (
            <motion.div
              key="cues"
              className="flex shrink-0 flex-wrap gap-6"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0, transition: { duration: duration.base, ease: easeOut } }}
              exit={{ opacity: 0, y: -4, transition: { duration: duration.fast, ease: easeIn } }}
            >
              {PROMPT_CUES.map((cue) => (
                <motion.button
                  key={cue}
                  type="button"
                  whileTap={press}
                  onClick={() => ask(cue)}
                  className="rounded-999 border border-surface-border-tint px-11 py-6 text-12-5 text-text-strong-secondary transition-colors duration-(--dur-fast) ease-hop-out hover:bg-surface-subtle"
                >
                  {cue}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Composer />
      <div className="sr-only" aria-live="polite">
        {announce}
      </div>
    </aside>
  );
}

/**
 * Jump chips (brief B7.3; Figma "Page cues"). The first chip goes to the selected frame's page,
 * the second back to Analytics. After a jump the fills swap over (base): the page she's on turns
 * inactive and "Go to Analytics" becomes the active one. Inactive chips are aria-disabled and
 * skipped by Tab (B5).
 */
function JumpChips() {
  const page = useHop((s) => s.page);
  const selection = useHop((s) => s.selection);
  const jumpOrigin = useHop((s) => s.jumpOrigin);
  const navigate = useHop((s) => s.navigate);
  const arrived = jumpOrigin !== null;
  const target = arrived ? page : (selection?.jumpTarget ?? page);
  const chips = [
    { key: 'target', label: `Go to ${PAGE_TITLES[target]}`, active: !arrived, go: () => navigate(target, 'jump') },
    { key: 'back', label: `Go to ${PAGE_TITLES[jumpOrigin ?? 'analytics']}`, active: arrived, go: () => navigate(jumpOrigin ?? 'analytics', 'jump') },
  ];

  return (
    <motion.div
      className="flex shrink-0 flex-col gap-8"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0, transition: { duration: duration.base, ease: easeOut } }}
      exit={{ opacity: 0, y: -4, transition: { duration: duration.fast, ease: easeIn } }}
    >
      <span className="text-11 font-500 text-text-muted">Jump to</span>
      <div className="flex gap-6">
        {chips.map((c) => (
          <motion.button
            key={c.key}
            type="button"
            whileTap={c.active ? press : undefined}
            onClick={c.active ? c.go : undefined}
            aria-disabled={!c.active}
            tabIndex={c.active ? 0 : -1}
            className={`flex items-center gap-6 whitespace-nowrap rounded-999 px-12 py-7 text-12-5 font-500 transition-colors duration-(--dur-base) ease-hop-out ${
              c.active ? 'bg-action-primary text-text-on-dark hover:bg-palette-tone-25' : 'cursor-default bg-chip-off-bg text-chip-off-text'
            }`}
          >
            {c.label}
            {c.active && <ArrowRIcon />}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

// Enter: user bubbles rise from the composer (y 8 → 0), everything else fades in (base).
// New chat: messages lift and fade out (y −8, 20ms stagger, fast).
type ItemCustom = { kind: Message['kind']; index: number };
const ITEM: Variants = {
  enter: (c: ItemCustom) => (c.kind === 'user' ? { opacity: 0, y: 8 } : { opacity: 0 }),
  shown: { opacity: 1, y: 0, transition: { duration: duration.base, ease: easeOut } },
  leave: (c: ItemCustom) => ({
    opacity: 0,
    y: -8,
    transition: { duration: duration.fast, ease: easeIn, delay: c.index * timing.rowExitStagger },
  }),
};

function MessageList({ masked }: { masked: boolean }) {
  const messages = useHop((s) => s.messages);
  const showToast = useHop((s) => s.showToast);
  const rehighlight = useHop((s) => s.rehighlight);
  const activeTagId = useHop((s) => s.activeTagId);
  const reduce = useReducedMotion();
  const scroller = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const pinned = useRef(true);

  // Keep the newest message in view while it streams, but only if she hasn't scrolled up
  // (Hop never moves things while she's scrolling, brief A3).
  useEffect(() => {
    const el = scroller.current;
    const inner = content.current;
    if (!el || !inner) return;
    const onScroll = () => {
      pinned.current = el.scrollHeight - el.scrollTop - el.clientHeight < 32;
    };
    const ro = new ResizeObserver(() => {
      if (pinned.current) el.scrollTop = el.scrollHeight;
    });
    el.addEventListener('scroll', onScroll, { passive: true });
    ro.observe(inner);
    return () => {
      el.removeEventListener('scroll', onScroll);
      ro.disconnect();
    };
  }, []);

  // Her own new question (or a page marker) always scrolls into view.
  const last = messages[messages.length - 1];
  useLayoutEffect(() => {
    if (last?.kind === 'user' || last?.kind === 'marker') {
      pinned.current = true;
      if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight;
    }
  }, [last?.id, last?.kind]);

  return (
    <div
      ref={scroller}
      className="-mx-16 min-h-0 flex-1 overflow-y-auto px-16"
      style={masked ? { maskImage: 'linear-gradient(to bottom, black calc(100% - 48px), transparent)' } : undefined}
      role="log"
      aria-label="Conversation with Hop"
    >
      <div ref={content} className="flex flex-col gap-16">
        <AnimatePresence initial={false}>
          {messages.map((m, index) => (
            <motion.div
              key={m.id}
              custom={{ kind: m.kind, index } satisfies ItemCustom}
              variants={reduce ? undefined : ITEM}
              initial={reduce ? false : 'enter'}
              animate="shown"
              exit={reduce ? { opacity: 0, transition: { duration: 0 } } : 'leave'}
            >
              {m.kind === 'user' ? (
                <UserMessage msg={m} tagActive={activeTagId === m.id} onTagClick={m.tag ? () => rehighlight(m.id) : undefined} />
              ) : m.kind === 'hop' ? <HopMessage msg={m} onAction={showToast} /> : <Marker msg={m} />}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
