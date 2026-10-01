'use client';

import { animate, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { viaKeyboard } from './input';
import { duration as D, easeInOut } from './motion';

/**
 * Tweens an array of numbers towards `target` (brief B7.1: "animate the array of y-values
 * and the y-max together, then rebuild the path every frame"). Each change starts from
 * whatever is on screen, so interrupting a morph never jumps. It's a morph on screen, so it eases
 * in-out (Emil Kowalski). Reduced motion, or a change made from the keyboard → instant.
 */
export function useTweenedArray(target: number[], opts: { duration?: number; from?: number[] } = {}) {
  const reduce = useReducedMotion();
  const [current, setCurrent] = useState<number[]>(() => opts.from ?? target);
  const live = useRef(current);
  const key = target.join(',');

  useEffect(() => {
    const to = key.split(',').map(Number);
    const start = live.current;
    if (reduce || viaKeyboard() || start.length !== to.length) {
      live.current = to;
      setCurrent(to);
      return;
    }
    const controls = animate(0, 1, {
      duration: opts.duration ?? D.data,
      ease: easeInOut,
      onUpdate: (p) => {
        const next = to.map((t, i) => start[i] + (t - start[i]) * p);
        live.current = next;
        setCurrent(next);
      },
    });
    return () => controls.stop();
    // `key` stands in for `target`; opts.duration is read once per change on purpose.
  }, [key, reduce]);

  return current;
}
