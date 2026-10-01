'use client';

import { useLayoutEffect, useRef, useState } from 'react';

/** Width of an element, kept up to date while it resizes (e.g. while a sidebar collapses). */
export function useElementWidth<T extends HTMLElement>(fallback: number) {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(fallback);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    setWidth(el.clientWidth);
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return [ref, width] as const;
}

/** Height of an element, kept up to date (Customers: how tall the details column is). */
export function useElementHeight<T extends HTMLElement>(fallback: number) {
  const ref = useRef<T>(null);
  const [height, setHeight] = useState(fallback);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    // The border box: what a style height sets (border-box sizing), so a drag starts from it.
    setHeight(el.offsetHeight);
    const ro = new ResizeObserver(() => setHeight(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return [ref, height] as const;
}
