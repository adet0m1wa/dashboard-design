'use client';

import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';
import type { Block } from '@/data/conversation';
import { PAGE_TITLES } from '@/data/nav';
import { TEAM } from '@/data/team';
import { duration, easeOut, timing } from '@/lib/motion';
import { useHop, type Message } from '@/lib/store';
import { PersonAvatar } from '@/components/ui/PersonAvatar';
import { SmallButton } from '@/components/ui/SmallButton';
import { TagChip } from './TagChip';
import { TypingDots } from './TypingDots';

// Messages in the Hop panel (brief B7.2; Figma "Message/Amara", "Message/Hop", "Marker").

const meta = 'text-11 font-500 text-text-muted whitespace-nowrap';
const para = 'text-13 leading-19 text-text-primary';

export function UserMessage({ msg, onTagClick, tagActive }: { msg: Extract<Message, { kind: 'user' }>; onTagClick?: () => void; tagActive?: boolean }) {
  const person = TEAM[msg.author];
  return (
    <div className="flex flex-col items-end gap-6">
      <div className="flex items-center gap-6">
        <span className={meta}>
          {person.name} · {msg.time}
        </span>
        <PersonAvatar person={person} size={16} />
      </div>
      {msg.tag && <TagChip label={msg.tag.label} active={tagActive} onClick={onTagClick} />}
      <div className={`max-w-[85%] rounded-t-12 rounded-bl-12 rounded-br-4 bg-background-app px-14 py-10 ${para}`}>{msg.text}</div>
    </div>
  );
}

export function Marker({ msg }: { msg: Extract<Message, { kind: 'marker' }> }) {
  return (
    <div className="flex items-center gap-8" role="separator" aria-label={`${msg.text} at ${msg.time}`}>
      <span className="h-px flex-1 bg-surface-divider-tint" />
      <span className={meta}>
        {msg.text} · {msg.time}
      </span>
      <span className="h-px flex-1 bg-surface-divider-tint" />
    </div>
  );
}

const words = (t: string) => t.split(' ');
type Progress = { block: number; words: number }; // everything before `block` is fully shown

/**
 * Hop's answer. Typing dots while thinking; then the text streams word by word (~20ms/word),
 * rich blocks fade up once the text before them has finished, action buttons come last
 * (40ms stagger). Scripted: nothing here waits on a model.
 */
export function HopMessage({ msg, onAction }: { msg: Extract<Message, { kind: 'hop' }>; onAction?: (toast: string) => void }) {
  const finishAnswer = useHop((s) => s.finishAnswer);
  const reduce = useReducedMotion();
  const done: Progress = { block: msg.blocks.length, words: 0 };
  const [progress, setProgress] = useState<Progress>(msg.status === 'done' ? done : { block: 0, words: 0 });

  useEffect(() => {
    if (msg.status !== 'streaming') return;
    let b = 0;
    let w = 0;
    let timer: ReturnType<typeof setTimeout>;
    const step = () => {
      const block = msg.blocks[b];
      if (!block) {
        setProgress({ block: b, words: 0 });
        finishAnswer(msg.id);
        return;
      }
      if (block.kind === 'text') {
        w += 1;
        setProgress({ block: b, words: w });
        if (w >= words(block.text).length) {
          b += 1;
          w = 0;
        }
        timer = setTimeout(step, timing.streamWord * 1000);
      } else {
        setProgress({ block: b, words: 1 }); // mount it; its own fade-up runs
        b += 1;
        const wait =
          block.kind === 'actions'
            ? duration.base + block.buttons.length * timing.actionStagger
            : block.kind === 'list'
              ? duration.base + block.items.length * timing.actionStagger
              : duration.base;
        timer = setTimeout(step, wait * 1000);
      }
    };
    step();
    return () => clearTimeout(timer);
  }, [msg.status, msg.blocks, msg.id, finishAnswer]);

  const reads = msg.reads.length ? ` · read ${msg.reads.map((p) => PAGE_TITLES[p]).join(', ')}` : '';

  return (
    <div className="flex w-full flex-col items-start gap-8">
      <span className={meta}>
        Hop · {msg.time}
        {msg.status !== 'thinking' && reads}
      </span>
      {msg.status === 'thinking' ? (
        <TypingDots />
      ) : (
        msg.blocks.map((block, i) => {
          if (i > progress.block || (i === progress.block && progress.words === 0)) return null;
          const partial = i === progress.block && block.kind === 'text' ? words(block.text).slice(0, progress.words).join(' ') : null;
          return <AnswerBlock key={i} block={block} partial={partial} animate={msg.status === 'streaming' && !reduce} onAction={onAction} />;
        })
      )}
    </div>
  );
}

function AnswerBlock({ block, partial, animate, onAction }: { block: Block; partial: string | null; animate: boolean; onAction?: (toast: string) => void }) {
  const fadeUp = animate
    ? { initial: { opacity: 0, transform: 'translateY(6px)' }, animate: { opacity: 1, transform: 'translateY(0px)' }, transition: { duration: duration.base, ease: easeOut } }
    : {};

  if (block.kind === 'text') return <p className={para}>{partial ?? block.text}</p>;

  if (block.kind === 'list') {
    // Numbered, each item fading up a beat after the one before (as the action buttons do).
    return (
      <ol className="flex w-full flex-col gap-10">
        {block.items.map((item, i) => (
          <motion.li
            key={item.title}
            className="flex gap-10"
            initial={animate ? { opacity: 0, transform: 'translateY(6px)' } : false}
            animate={{ opacity: 1, transform: 'translateY(0px)' }}
            transition={{ duration: duration.base, ease: easeOut, delay: i * timing.actionStagger }}
          >
            <span className="flex size-[20px] shrink-0 items-center justify-center rounded-full bg-surface-subtle text-11 font-600 text-text-secondary tabular-nums">{i + 1}</span>
            <span className="flex min-w-0 flex-col gap-2">
              <span className="text-13 font-500 leading-18 text-text-primary">{item.title}</span>
              <span className="text-12-5 leading-18 text-text-secondary">{item.detail}</span>
            </span>
          </motion.li>
        ))}
      </ol>
    );
  }

  if (block.kind === 'sizes') {
    return (
      <motion.div className="flex w-full flex-col gap-8 rounded-10 border border-surface-border-tint p-12" {...fadeUp}>
        <span className="text-11-5 font-500 text-text-secondary">{block.title}</span>
        <div className="flex gap-6">
          {block.sizes.map((s) => {
            const out = s.left === 0;
            return (
              <div
                key={s.size}
                className={`flex flex-1 flex-col items-center gap-1 rounded-8 py-6 ${out ? 'bg-status-danger-soft text-status-danger-text' : 'bg-surface-subtle'}`}
              >
                <span className={`text-10-5 ${out ? '' : 'text-text-secondary'}`}>Size {s.size}</span>
                <span className={`text-15 font-600 tabular-nums ${out ? '' : 'text-text-primary'}`}>{s.left}</span>
              </div>
            );
          })}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-wrap gap-8">
      {block.buttons.map((b, i) => (
        <motion.div
          key={b.label}
          initial={animate ? { opacity: 0, transform: 'translateY(6px)' } : false}
          animate={{ opacity: 1, transform: 'translateY(0px)' }}
          transition={{ duration: duration.base, ease: easeOut, delay: i * timing.actionStagger }}
        >
          <SmallButton variant={b.style} wide onClick={() => onAction?.(b.toast)}>
            {b.label}
          </SmallButton>
        </motion.div>
      ))}
    </div>
  );
}
