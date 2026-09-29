'use client';

import { useEffect } from 'react';
import { timing } from '@/lib/motion';

// Scrollbars show only while something scrolls (user feedback 2026-09-29): every scroll marks
// the scrolled element [data-scrolling] (globals.css makes its thumb visible), and the mark comes
// off timing.scrollbarLinger after the last scroll.
export function ScrollbarsWhileScrolling() {
  useEffect(() => {
    const timers = new Map<Element, ReturnType<typeof setTimeout>>();
    const onScroll = (e: Event) => {
      const el = e.target instanceof Element ? e.target : document.documentElement;
      el.setAttribute('data-scrolling', '');
      clearTimeout(timers.get(el));
      timers.set(el, setTimeout(() => {
        el.removeAttribute('data-scrolling');
        timers.delete(el);
      }, timing.scrollbarLinger * 1000));
    };
    document.addEventListener('scroll', onScroll, { capture: true, passive: true });
    return () => {
      document.removeEventListener('scroll', onScroll, { capture: true });
      timers.forEach(clearTimeout);
    };
  }, []);
  return null;
}
