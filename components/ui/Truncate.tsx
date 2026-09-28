'use client';

import { useLayoutEffect, useRef, type ReactNode } from 'react';

// Text that may be cut off with an ellipsis (one line, or a 2-line clamp). When it is actually
// cut, the full text is kept reachable as a tooltip; when it fits, there's no tooltip.
export function Truncate({ lines = 1, className = '', id, children }: { lines?: 1 | 2; className?: string; id?: string; children: ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const cut = lines === 1 ? el.scrollWidth > el.clientWidth + 1 : el.scrollHeight > el.clientHeight + 1;
      if (cut) el.title = el.textContent ?? '';
      else el.removeAttribute('title');
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  });

  return (
    <span ref={ref} id={id} className={`${lines === 1 ? 'truncate' : 'line-clamp-2'} ${className}`}>
      {children}
    </span>
  );
}
