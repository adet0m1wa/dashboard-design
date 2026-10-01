'use client';

import { AnimatePresence, motion, useReducedMotion, type Variants } from 'motion/react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { PROMPT_CUES } from '@/data/conversation';
import { PAGE_TITLES } from '@/data/nav';
import { duration, easeExit, easeOut, press, rise, timing } from '@/lib/motion';
import { CHAT_FADE, PANEL_MAX, PANEL_MIN } from '@/lib/layout';
import { useHop, type Message } from '@/lib/store';
import { ArrowRIcon, BoundingBoxIcon, ChatCenteredIcon } from '@/components/icons/figma';
import { HopAvatar, type HopAvatarState } from './HopAvatar';
import { Composer } from './Composer';
import { HopMessage, Marker, UserMessage } from './Message';
import { HistoryPanel, HistoryTitle } from '@/components/history/HistoryPanel';

// The side panel, on every page (brief B7.2). Header (avatar + "Hop" + New chat + Highlight —
// Figma "example 1"), the conversation, prompt cues / jump chips, and the composer.
//   • The mascot opens and closes it ("example 2": a 63px strip with only the mascot) — instantly
//     (user feedback 2026-09-29). The conversation stays mounted, so an answer that is streaming
//     keeps going while the panel is shut.
//   • Its left edge drags it narrower or wider, between PANEL_MIN and PANEL_MAX (the default); the
//     width follows the pointer with no easing. One setting for every page, kept while closed.
//   • On History it shows the brief chain instead of the chat, keeps Hop's face and can't be
//     closed (user feedback 2026-09-29). The chat stays mounted underneath.
//   • Prompt cues only on an empty chat (starting a new one); the conversation fades out at the
//     bottom only while there's more below (see MessageList).
export function HopPanel() {
  const page = useHop((s) => s.page);
  const selection = useHop((s) => s.selection);
  const hopStatus = useHop((s) => s.hopStatus);
  const jumpOrigin = useHop((s) => s.jumpOrigin);
  const scanning = useHop((s) => s.scanning);
  const announce = useHop((s) => s.announce);
  const empty = useHop((s) => s.messages.length === 0);
  const newChat = useHop((s) => s.newChat);
  const ask = useHop((s) => s.ask);
  const togglePanel = useHop((s) => s.togglePanel);
  const highlightMode = useHop((s) => s.highlightMode);
  const setHighlightMode = useHop((s) => s.setHighlightMode);
  const width = useHop((s) => s.panelWidth);
  const onHistory = page === 'history';
  const collapsed = useHop((s) => s.panelCollapsed) && !onHistory;
  const hidden = collapsed ? 'opacity-0' : '';

  const avatar: HopAvatarState = scanning ? 'scanning' : hopStatus === 'thinking' ? 'thinking' : 'idle';
  // Jump chips (brief B3): Analytics with a selection that has a jump target, or any page
  // reached through a jump chip. Prompt cues: Analytics, an empty chat, nothing selected.
  // On Analytics they swap: cues out (fast) → chips in (base).
  const showChips = (page === 'analytics' && Boolean(selection?.jumpTarget)) || jumpOrigin !== null;
  const showCues = !showChips && page === 'analytics' && !selection && hopStatus === 'idle' && empty;
  const bottom = showChips ? 'chips' : showCues ? 'cues' : null;

  return (
    <aside
      className="relative shrink-0 overflow-hidden border-l border-surface-divider-tint bg-surface-default"
      style={{ width: collapsed ? 'var(--spacing-panel-rail)' : width }}
      aria-label={onHistory ? 'Hop: History' : 'Hop'}
    >
      {!collapsed && <ResizeHandle width={width} />}
      {/* Its own width inside, so closing clips the panel instead of squashing it. */}
      <div className="flex h-full flex-col" style={{ width }}>
        <header className="flex h-bar shrink-0 items-center justify-between border-b border-surface-faint px-16">
          <div className="flex items-center gap-10">
            {onHistory ? (
              <HopAvatar state={avatar} />
            ) : (
              <motion.button
                type="button"
                whileTap={press}
                onClick={togglePanel}
                aria-label={collapsed ? 'Open Hop' : 'Close Hop'}
                aria-expanded={!collapsed}
                className="rounded-8"
              >
                <HopAvatar state={avatar} />
              </motion.button>
            )}
            {onHistory ? <HistoryTitle /> : <span className={`text-14 font-600 text-text-primary ${hidden}`}>Hop</span>}
          </div>
          {!onHistory && (
            <div className={`flex items-center gap-14 ${hidden}`} inert={collapsed}>
              <motion.button type="button" whileTap={press} onClick={newChat} aria-label="New chat" className="relative rounded-4 text-text-black after:absolute after:-inset-4">
                <ChatCenteredIcon />
              </motion.button>
              {/* Highlight mode: only while it's on can frames on the page be hovered and picked. */}
              <motion.button
                type="button"
                whileTap={press}
                onClick={(e) => {
                  setHighlightMode(!highlightMode);
                  // From the keyboard (detail 0), turning it on jumps to the page's first frame:
                  // the frames sit before this button in the Tab order.
                  if (e.detail === 0 && !highlightMode) {
                    requestAnimationFrame(() => {
                      // The first frame, or — for a frame reached through its own control, like a
                      // KPI tab — that control.
                      const frame = document.querySelector<HTMLElement>('main [data-hop-frame]:not([inert] *)');
                      const target = frame?.getAttribute('tabindex') === '0' ? frame : frame?.querySelector<HTMLElement>('button:not([tabindex="-1"])');
                      target?.focus();
                    });
                  }
                }}
                aria-label="Highlight a frame"
                aria-pressed={highlightMode}
                aria-describedby="highlight-help"
                className={`-m-4 rounded-6 p-4 transition-colors duration-(--dur-fast) ease-hop-color ${
                  highlightMode ? 'bg-tag-bg text-selection' : 'text-text-black hover:bg-surface-subtle'
                }`}
              >
                <BoundingBoxIcon />
              </motion.button>
            </div>
          )}
        </header>

        {/* Hop's conversation: mounted on every page (a streaming answer carries on); on History
            the brief chain takes its place. */}
        <div className={`min-h-0 flex-1 flex-col ${onHistory ? 'hidden' : 'flex'} ${hidden}`} inert={collapsed || onHistory}>
          <div className="flex min-h-0 flex-1 flex-col gap-16 px-16 py-14">
            <MessageList />
            <AnimatePresence initial={false} mode="wait">
              {bottom === 'chips' && <JumpChips key="chips" />}
              {bottom === 'cues' && (
                // No entrance (user feedback 2026-10-01): the cues are just there when Analytics shows.
                <div key="cues" className="flex shrink-0 flex-wrap gap-6">
                  {PROMPT_CUES.map((cue) => (
                    <motion.button
                      key={cue}
                      type="button"
                      whileTap={press}
                      onClick={() => ask(cue)}
                      className="rounded-999 border border-surface-border-tint px-11 py-6 text-12-5 text-text-strong-secondary transition-colors duration-(--dur-fast) ease-hop-color hover:bg-surface-subtle"
                    >
                      {cue}
                    </motion.button>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>

          <Composer />
        </div>
        {onHistory && <HistoryPanel />}
      </div>
      <p id="highlight-help" className="sr-only">
        Then point at a part of the page, or Tab to it, and click or press Enter to ask Hop about it.
      </p>
      <div className="sr-only" aria-live="polite">
        {announce}
      </div>
    </aside>
  );
}

/**
 * The panel's left edge: drag it (or focus it and use ←/→, Shift for bigger steps, Home/End) to
 * set the panel's width. A 2px line shows on hover (grey) and while dragging or focused (blue).
 */
function ResizeHandle({ width }: { width: number }) {
  const setWidth = useHop((s) => s.setPanelWidth);
  const drag = useRef<{ x: number; w: number } | null>(null);
  const [active, setActive] = useState(false);

  const end = (e: React.PointerEvent) => {
    if (!drag.current) return;
    drag.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
    document.documentElement.style.removeProperty('cursor');
    setActive(false);
  };

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label="Side panel width"
      aria-valuemin={PANEL_MIN}
      aria-valuemax={PANEL_MAX}
      aria-valuenow={width}
      tabIndex={0}
      onPointerDown={(e) => {
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        drag.current = { x: e.clientX, w: width };
        document.documentElement.style.cursor = 'col-resize';
        setActive(true);
      }}
      onPointerMove={(e) => drag.current && setWidth(drag.current.w + (drag.current.x - e.clientX))}
      onPointerUp={end}
      onPointerCancel={end}
      onKeyDown={(e) => {
        const step = e.shiftKey ? 32 : 8;
        const next = { ArrowLeft: width + step, ArrowRight: width - step, Home: PANEL_MIN, End: PANEL_MAX }[e.key];
        if (next === undefined) return;
        e.preventDefault();
        setWidth(next);
      }}
      // Its focus shows as the edge line turning blue (a ring would be clipped by the panel).
      className="group absolute inset-y-0 left-0 z-20 w-6 cursor-col-resize touch-none focus-visible:outline-none"
    >
      <span
        aria-hidden="true"
        className={`absolute inset-y-0 left-0 w-2 group-focus-visible:bg-selection ${
          active ? 'bg-selection' : 'group-hover:bg-palette-tone-27'
        }`}
      />
    </div>
  );
}

/**
 * Jump chips (brief B7.3; Figma "Page cues"). The first chip goes to the selected frame's page,
 * the second back to Analytics. After a jump the fills swap over (base): the page she's on turns
 * inactive and "Go to Analytics" becomes the active one. Inactive chips are aria-disabled and
 * skipped by Tab (B5).
 */
function JumpChips() {
  const page = useHop((s) => s.page); // the destination: the chips flip as soon as she jumps
  const selection = useHop((s) => s.selection);
  const jumpOrigin = useHop((s) => s.jumpOrigin);
  const navigate = useHop((s) => s.navigate);
  const reduce = useReducedMotion();
  const arrived = jumpOrigin !== null;
  const target = arrived ? page : (selection?.jumpTarget ?? page);
  const chips = [
    { key: 'target', label: `Go to ${PAGE_TITLES[target]}`, active: !arrived, go: () => navigate(target, 'jump') },
    { key: 'back', label: `Go to ${PAGE_TITLES[jumpOrigin ?? 'analytics']}`, active: arrived, go: () => navigate(jumpOrigin ?? 'analytics', 'jump') },
  ];

  return (
    <motion.div className="flex shrink-0 flex-col gap-8" {...rise(reduce)}>
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
            className={`flex items-center gap-6 whitespace-nowrap rounded-999 px-12 py-7 text-12-5 font-500 transition-colors duration-(--dur-base) ease-hop-color ${
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
// New chat: messages lift and fade out (y −8, 30ms stagger, fast). Moved by transform strings.
type ItemCustom = { kind: Message['kind']; index: number };
const ITEM: Variants = {
  enter: (c: ItemCustom) => (c.kind === 'user' ? { opacity: 0, transform: 'translateY(8px)' } : { opacity: 0, transform: 'translateY(0px)' }),
  shown: { opacity: 1, transform: 'translateY(0px)', transition: { duration: duration.base, ease: easeOut } },
  leave: (c: ItemCustom) => ({
    opacity: 0,
    transform: 'translateY(-8px)',
    transition: { duration: duration.fast, ease: easeExit, delay: c.index * timing.rowExitStagger },
  }),
};

function MessageList() {
  const messages = useHop((s) => s.messages);
  const showToast = useHop((s) => s.showToast);
  const rehighlight = useHop((s) => s.rehighlight);
  const activeTagId = useHop((s) => s.activeTagId);
  const reduce = useReducedMotion();
  const scroller = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const pinned = useRef(true);

  // Keep the newest message in view while it streams, but only if she hasn't scrolled up
  // (Hop never moves things while she's scrolling, brief A3). The bottom fade shows only while
  // there's more below (CHAT_FADE); at the end nothing covers the newest message.
  useEffect(() => {
    const el = scroller.current;
    const inner = content.current;
    if (!el || !inner) return;
    const fade = () => {
      const more = el.scrollHeight - el.scrollTop - el.clientHeight > 1;
      const mask = more ? `linear-gradient(to bottom, black calc(100% - ${CHAT_FADE}px), transparent)` : '';
      el.style.maskImage = mask;
      el.style.webkitMaskImage = mask;
      el.dataset.fade = more ? String(CHAT_FADE) : '0';
    };
    const onScroll = () => {
      pinned.current = el.scrollHeight - el.scrollTop - el.clientHeight < 32;
      fade();
    };
    const ro = new ResizeObserver(() => {
      if (pinned.current) el.scrollTop = el.scrollHeight;
      fade();
    });
    ro.observe(el);
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
