'use client';

import { AnimatePresence, motion } from 'motion/react';
import { PAGE_TITLES } from '@/data/nav';
import type { Page } from '@/data/types';
import { enter, leave } from '@/lib/motion';
import { useHop } from '@/lib/store';
import { PageIcon } from './PageIcon';
import { AnalyticsTopActions } from '@/components/analytics/AnalyticsTopActions';
import { InventoryTopActions } from '@/components/pages/InventoryTopActions';

// The page top bar: 56px, lines up with the Hop panel header. Only the title and the
// page's own actions change between pages; they crossfade (brief B7.6).
export function TopBar() {
  const page = useHop((s) => s.page);

  return (
    <header className="flex h-bar shrink-0 items-center justify-between border-b border-surface-faint px-20">
      <div className="grid">
        <AnimatePresence initial={false}>
          <motion.h1
            key={page}
            className="col-start-1 row-start-1 flex items-center gap-8 text-13 font-600 text-text-primary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: enter() }}
            exit={{ opacity: 0, transition: leave() }}
          >
            <PageIcon page={page} className="text-text-primary" />
            {PAGE_TITLES[page]}
          </motion.h1>
        </AnimatePresence>
      </div>
      <div className="grid justify-items-end">
        <AnimatePresence initial={false}>
          <motion.div
            key={page}
            className="col-start-1 row-start-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: enter() }}
            exit={{ opacity: 0, transition: leave() }}
          >
            <TopActions page={page} />
          </motion.div>
        </AnimatePresence>
      </div>
    </header>
  );
}

function TopActions({ page }: { page: Page }) {
  if (page === 'analytics') return <AnalyticsTopActions />;
  if (page === 'inventory') return <InventoryTopActions />;
  return null;
}
