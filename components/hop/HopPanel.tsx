'use client';

import { motion } from 'motion/react';
import { PROMPT_CUES } from '@/data/conversation';
import { press } from '@/lib/motion';
import { useHop } from '@/lib/store';
import { NewChatIcon, UpIcon } from '@/components/icons/figma';
import { HopAvatar } from './HopAvatar';

// The Hop panel, on every page (brief B7.2). Phase 1: the empty state from the "Analytics"
// frame. Sending, streaming, selection and jump chips arrive in phases 4–6.
export function HopPanel() {
  const page = useHop((s) => s.page);

  return (
    <aside className="flex w-panel shrink-0 flex-col border-l border-surface-divider-tint bg-surface-default" aria-label="Hop">
      <header className="flex h-bar shrink-0 items-center justify-between border-b border-surface-faint px-16">
        <div className="flex items-center gap-10">
          <HopAvatar />
          <span className="text-14 font-600 text-text-primary">Hop</span>
        </div>
        <motion.button type="button" whileTap={press} aria-label="New chat" className="rounded-4 text-text-black">
          <NewChatIcon />
        </motion.button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-16 px-16 py-14">
        <div className="flex-1" />
        {page === 'analytics' && (
          <div className="flex flex-wrap gap-6">
            {PROMPT_CUES.map((cue) => (
              <motion.button
                key={cue}
                type="button"
                whileTap={press}
                className="rounded-999 border border-surface-border-tint px-11 py-6 text-12-5 text-text-strong-secondary transition-colors duration-(--dur-fast) ease-hop-out hover:bg-surface-subtle"
              >
                {cue}
              </motion.button>
            ))}
          </div>
        )}
      </div>

      <div className="shrink-0 px-12 pb-12 pt-4">
        <div className="flex flex-col gap-14 rounded-14 border border-composer-border bg-surface-default pb-10 pl-14 pr-12 pt-12 shadow-composer">
          <div className="flex">
            <span className="rounded-6 bg-surface-subtle px-8 py-4 text-11-5 font-500 text-text-secondary">Select any frame</span>
          </div>
          <div className="flex items-center justify-between">
            <textarea
              rows={1}
              aria-label="Message Hop"
              placeholder="Ask Hop about sales, posts, stock or customers…"
              className="max-h-[68px] min-w-0 flex-1 resize-none bg-transparent text-13 text-text-primary outline-none field-sizing-content placeholder:text-text-muted"
            />
            <motion.button
              type="button"
              whileTap={press}
              aria-label="Send"
              className="flex size-[28px] shrink-0 items-center justify-center rounded-14 bg-action-primary text-text-on-dark"
            >
              <UpIcon />
            </motion.button>
          </div>
        </div>
      </div>
    </aside>
  );
}
