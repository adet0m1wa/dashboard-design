'use client';

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useState } from 'react';
import { duration, easeExit, easeOut, enter, leave, press } from '@/lib/motion';
import { viaKeyboard } from '@/lib/input';
import { useHop } from '@/lib/store';
import { BoundingBoxIcon, FrameIcon, UpIcon, XIcon } from '@/components/icons/figma';
import { Truncate } from '@/components/ui/Truncate';

// The composer (brief B7.2, B6; Figma "Composer"). Grows with the text up to 4 lines (CSS
// field-sizing), Enter sends, Shift+Enter adds a line. Sending needs text or a tag.
// Idle: a hint that picking starts at the highlight button, drawn with that button's icon (user
// feedback 2026-09-30; a hint, not a button — B11 #6). With highlight on it says to click a
// frame instead, since clicking the button again would turn it off. With a frame selected:
// its tag chip pops in (scale 0.92 → 1, base), the placeholder crossfades to "Ask about this
// frame…". Once sent, the chip leaves (scale 0.92, fast) while the frame on the page scans.
// Picked or sent from the keyboard, the chip comes and goes at once (Emil Kowalski).
const IDLE_PLACEHOLDER = 'Ask Hop about sales, posts, stock or customers…';
const TAG_PLACEHOLDER = 'Ask about this frame…';

export function Composer() {
  const [text, setText] = useState('');
  const selection = useHop((s) => s.selection);
  const highlightMode = useHop((s) => s.highlightMode);
  const scanning = useHop((s) => s.scanning);
  const busy = useHop((s) => s.hopStatus !== 'idle');
  const ask = useHop((s) => s.ask);
  const deselect = useHop((s) => s.deselect);
  const reduce = useReducedMotion();
  const still = reduce || viaKeyboard();
  const tag = selection && !scanning ? selection : null;
  const canSend = Boolean(text.trim() || tag) && !busy;
  const placeholder = tag ? TAG_PLACEHOLDER : IDLE_PLACEHOLDER;

  const send = () => {
    if (!canSend) return;
    ask(text);
    setText('');
  };

  return (
    <div className="shrink-0 px-12 pb-12 pt-4">
      {/* Typing turns the box's own border blue (no second ring around it). */}
      <div className="flex flex-col gap-14 rounded-14 border border-composer-border bg-surface-default pb-10 pl-14 pr-12 pt-12 shadow-composer transition-colors duration-(--dur-fast) ease-hop-color has-[textarea:focus]:border-selection">
        <div className="grid" aria-live="polite">
          <AnimatePresence initial={false} mode="popLayout">
            {tag ? (
              <motion.span
                key={`tag-${tag.id}`}
                className="col-start-1 row-start-1 flex max-w-full items-center gap-6 justify-self-start rounded-6 border border-tag-border bg-tag-bg px-8 py-3 text-11-5 font-500 text-tag-text"
                initial={still ? false : { opacity: 0, transform: 'scale(0.92)' }}
                animate={{ opacity: 1, transform: 'scale(1)', transition: { duration: duration.base, ease: easeOut } }}
                exit={still ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, transform: 'scale(0.92)', transition: { duration: duration.fast, ease: easeExit } }}
                style={{ transformOrigin: 'left center' }}
              >
                <FrameIcon className="shrink-0 text-selection" />
                <Truncate>{tag.label}</Truncate>
                <button
                  type="button"
                  onClick={deselect}
                  aria-label={`Remove ${tag.label}`}
                  className="relative -my-2 -mr-2 flex shrink-0 items-center rounded-4 text-selection transition-colors duration-(--dur-fast) ease-hop-color after:absolute after:-inset-6 hover:bg-tag-border"
                >
                  <XIcon />
                </button>
              </motion.span>
            ) : (
              <motion.span
                key="hint"
                className="col-start-1 row-start-1 flex items-center gap-4 justify-self-start rounded-6 bg-surface-subtle px-8 py-4 text-11-5 font-500 text-text-secondary"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: enter() }}
                exit={{ opacity: 0, transition: leave(duration.fast) }}
              >
                {highlightMode ? (
                  'Click any frame to select it'
                ) : (
                  <>
                    Click the
                    <BoundingBoxIcon className="size-[12px] shrink-0 text-text-primary" />
                    <span className="sr-only">{' highlight button '}</span>
                    to select a frame
                  </>
                )}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <div className="flex items-center justify-between">
          <div className="relative grid min-w-0 flex-1">
            <textarea
              rows={1}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  send();
                }
              }}
              aria-label="Message Hop"
              placeholder={placeholder}
              className="col-start-1 row-start-1 max-h-[68px] min-w-0 resize-none bg-transparent text-13 text-text-primary outline-none field-sizing-content placeholder:text-transparent"
            />
            {/* The visible placeholder, so it can crossfade (the real one sizes the field). */}
            {text === '' && (
              <span aria-hidden="true" className="pointer-events-none col-start-1 row-start-1 grid text-13 text-text-muted">
                <AnimatePresence initial={false}>
                  <motion.span
                    key={placeholder}
                    className="col-start-1 row-start-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: enter() }}
                    exit={{ opacity: 0, transition: leave() }}
                  >
                    {placeholder}
                  </motion.span>
                </AnimatePresence>
              </span>
            )}
          </div>
          <motion.button
            type="button"
            whileTap={canSend ? press : undefined}
            onClick={send}
            aria-label="Send"
            aria-disabled={!canSend}
            className={`flex size-[28px] shrink-0 items-center justify-center rounded-14 bg-action-primary text-text-on-dark ${canSend ? '' : 'cursor-default'}`}
          >
            <UpIcon />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
