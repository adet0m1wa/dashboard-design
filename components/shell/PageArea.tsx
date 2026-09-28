'use client';

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useRef } from 'react';
import type { Page } from '@/data/types';
import { duration, easeIn, easeOut, timing } from '@/lib/motion';
import { useHop } from '@/lib/store';
import { AnalyticsPage } from '@/components/pages/AnalyticsPage';
import { InventoryPage } from '@/components/pages/InventoryPage';
import { HistoryPage } from '@/components/history/HistoryPage';
import { useSelection } from '@/components/select/useSelection';
import { PlaceholderPage } from '@/components/pages/PlaceholderPage';

// Only the page area changes between pages; the sidebar and Hop panel stay put (brief B7.6).
// Outgoing: fade + x 0 → −8 (fast, easeIn). Incoming: fade + x 8 → 0 (base, easeOut).
// Reduced motion: 100ms fades, no movement.
export function PageArea() {
  const page = useHop((s) => s.page);
  const reduce = useReducedMotion();
  // The first page shows without a slide. Done on the wrapper, not with
  // <AnimatePresence initial={false}>, which would also switch off every initial animation
  // nested inside the page (the Analytics first-load entrance).
  const first = useRef(true);
  const area = useRef<HTMLDivElement>(null);
  useSelection(area);
  useEffect(() => {
    first.current = false;
  }, []);

  const variants = reduce
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { duration: timing.reducedFade } },
        exit: { opacity: 0, transition: { duration: timing.reducedFade } },
      }
    : {
        initial: { opacity: 0, x: 8 },
        animate: { opacity: 1, x: 0, transition: { duration: duration.base, ease: easeOut } },
        exit: { opacity: 0, x: -8, transition: { duration: duration.fast, ease: easeIn } },
      };

  return (
    <div ref={area} className="relative min-h-0 flex-1">
      <AnimatePresence mode="wait">
        <motion.div
          key={page}
          className="absolute inset-0 overflow-y-auto"
          variants={variants}
          initial={first.current ? false : 'initial'}
          animate="animate"
          exit="exit"
          data-page={page}
        >
          <PageContent page={page} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export function PageContent({ page }: { page: Page }) {
  switch (page) {
    case 'analytics':
      return <AnalyticsPage />;
    case 'inventory':
      return <InventoryPage />;
    case 'history':
      return <HistoryPage />;
    default:
      return <PlaceholderPage page={page} />;
  }
}
