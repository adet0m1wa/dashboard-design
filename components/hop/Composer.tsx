'use client';

import { motion } from 'motion/react';
import { useState } from 'react';
import { press } from '@/lib/motion';
import { useHop } from '@/lib/store';
import { UpIcon } from '@/components/icons/figma';

// The composer (brief B7.2; Figma "Composer"). Grows with the text up to 4 lines (CSS
// field-sizing), Enter sends, Shift+Enter adds a line. Sending needs text or a tag.
// The idle chip "Select any frame" is a hint, not a button (B11 #6).
export function Composer() {
  const [text, setText] = useState('');
  const selection = useHop((s) => s.selection);
  const busy = useHop((s) => s.hopStatus !== 'idle');
  const ask = useHop((s) => s.ask);
  const canSend = Boolean(text.trim() || selection) && !busy;

  const send = () => {
    if (!canSend) return;
    ask(text);
    setText('');
  };

  return (
    <div className="shrink-0 px-12 pb-12 pt-4">
      <div className="flex flex-col gap-14 rounded-14 border border-composer-border bg-surface-default pb-10 pl-14 pr-12 pt-12 shadow-composer focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-selection">
        <div className="flex">
          <span className="rounded-6 bg-surface-subtle px-8 py-4 text-11-5 font-500 text-text-secondary">Select any frame</span>
        </div>
        <div className="flex items-center justify-between">
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
            placeholder="Ask Hop about sales, posts, stock or customers…"
            className="max-h-[68px] min-w-0 flex-1 resize-none bg-transparent text-13 text-text-primary outline-none field-sizing-content placeholder:text-text-muted"
          />
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
