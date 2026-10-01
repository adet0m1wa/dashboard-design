'use client';

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useId, useRef, useState } from 'react';
import { viaKeyboard } from '@/lib/input';
import { duration, easeExit, easeOut, exitOf, press } from '@/lib/motion';
import { Chev13Icon } from '@/components/icons/figma';

// A top-bar menu in the outline button's look ("Weekly ⌄"): opens a short list under it, aligned
// to its right edge. The list grows out of the button's corner (scale 0.97 → 1 and a fade, fast;
// Emil Kowalski: popovers scale from their trigger, never from nothing) and leaves faster; from
// the keyboard it opens and closes at once. Arrow keys move, Enter picks, Esc or a press outside
// closes without changing anything.
export function MenuButton<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
}) {
  const id = useId();
  const reduce = useReducedMotion();
  const keys = viaKeyboard();
  const chosen = Math.max(0, options.findIndex((o) => o.id === value));
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(chosen);
  const wrap = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLDivElement>(null);

  const show = () => {
    setActive(chosen);
    setOpen(true);
  };
  const close = (refocus: boolean) => {
    setOpen(false);
    if (refocus) button.current?.focus({ preventScroll: true });
  };
  const choose = (i: number) => {
    if (options[i].id !== value) onChange(options[i].id);
    close(true);
  };

  useEffect(() => {
    if (open) list.current?.focus({ preventScroll: true });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) close(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);

  const onKey = (e: React.KeyboardEvent) => {
    const step = { ArrowDown: 1, ArrowUp: -1 }[e.key];
    if (step) {
      e.preventDefault();
      setActive((a) => Math.min(options.length - 1, Math.max(0, a + step)));
    } else if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault();
      setActive(e.key === 'Home' ? 0 : options.length - 1);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      choose(active);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation(); // Esc here doesn't also clear a selection or close a chat
      close(true);
    } else if (e.key === 'Tab') {
      close(false);
    }
  };

  return (
    <div ref={wrap} className="relative">
      <motion.button
        ref={button}
        type="button"
        whileTap={press}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${label}: ${options[chosen].label}`}
        onClick={() => (open ? close(false) : show())}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' && !open) {
            e.preventDefault();
            show();
          }
        }}
        className="flex shrink-0 items-center gap-6 rounded-8 border border-surface-border-tint bg-surface-default px-10 py-6 text-12-5 font-500 whitespace-nowrap text-text-strong-secondary transition-colors duration-(--dur-fast) ease-hop-color hover:bg-surface-subtle"
      >
        {options[chosen].label}
        <Chev13Icon className="text-text-secondary" />
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.div
            ref={list}
            role="listbox"
            tabIndex={-1}
            aria-label={label}
            aria-activedescendant={`${id}-${active}`}
            onKeyDown={onKey}
            initial={keys ? false : { opacity: 0, transform: reduce ? 'scale(1)' : 'scale(0.97)' }}
            animate={{ opacity: 1, transform: 'scale(1)', transition: { duration: duration.fast, ease: easeOut } }}
            exit={keys ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, transition: { duration: exitOf(duration.fast), ease: easeExit } }}
            style={{ transformOrigin: 'top right' }}
            className="absolute right-0 top-[calc(100%+4px)] z-30 flex min-w-full flex-col gap-2 rounded-8 border border-surface-border-tint bg-surface-default p-4 shadow-screenshot-card outline-none"
          >
            {options.map((o, i) => (
              <div
                key={o.id}
                id={`${id}-${i}`}
                role="option"
                aria-selected={o.id === value}
                onPointerEnter={() => setActive(i)}
                onClick={() => choose(i)}
                className={`cursor-pointer rounded-6 px-8 py-6 text-12-5 whitespace-nowrap ${i === active ? 'bg-surface-subtle' : ''} ${
                  o.id === value ? 'font-500 text-text-primary' : 'text-text-strong-secondary'
                }`}
              >
                {o.label}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
