'use client';

import { motion, useReducedMotion } from 'motion/react';
import type { Brief } from '@/data/history';
import { INSTAGRAM_SCREENSHOT } from '@/data/history';
import { PAGE_TITLES } from '@/data/nav';
import type { Page } from '@/data/types';
import { snapshotNote } from '@/lib/briefs';
import { duration, easeOut, leave } from '@/lib/motion';
import { HopStoreProvider } from '@/lib/store';
import { useElementWidth } from '@/lib/useElementWidth';
import { ScreenshotIcon, TimeIcon } from '@/components/icons/figma';
import { AnalyticsPage } from '@/components/pages/AnalyticsPage';
import { InventoryPage } from '@/components/pages/InventoryPage';
import { PlaceholderPage } from '@/components/pages/PlaceholderPage';
import { TopBar } from '@/components/shell/TopBar';

// History's left side: what the selected brief looked like when it was asked (brief B7.5).
//   • asked on Analytics → the Analytics page redrawn with that moment's view, read-only
//   • asked on another page → a screenshot card: the real page drawn at 0.83 inside a white card
//     (12px radius, soft shadow); Instagram isn't built, so its card is the Figma export
//   • a tagged frame → the same, with the selection outline on the tagged frame
// Each snapshot has its own store, so it draws the page as it was without touching the live one.
// The swap: fade + y 6 → 0 (slow); a card also grows 0.98 → 1.
const SCALE = 0.83; // Figma: the page's 56px top bar is 46px in the card

export function Snapshot({ brief }: { brief: Brief }) {
  const reduce = useReducedMotion();
  const Icon = brief.page === 'analytics' ? TimeIcon : ScreenshotIcon;

  return (
    <motion.div
      className="flex flex-col"
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0, transition: { duration: duration.slow, ease: easeOut } }}
      exit={{ opacity: 0, transition: leave(duration.fast) }}
    >
      {/* Figma "Snapshot note" */}
      <p className="mx-28 mt-24 flex items-center gap-8 rounded-8 bg-surface-subtle px-12 py-8 text-12-5 font-500 text-text-strong-secondary">
        <Icon className="shrink-0 text-text-secondary" />
        {snapshotNote(brief)}
      </p>
      {brief.page === 'analytics' ? (
        <AnalyticsSnapshot brief={brief} />
      ) : brief.page === 'instagram' ? (
        <Card>
          <img
            src={INSTAGRAM_SCREENSHOT.src}
            width={INSTAGRAM_SCREENSHOT.width}
            height={INSTAGRAM_SCREENSHOT.height}
            alt={`The Instagram page at ${brief.time}: the Sand reel's numbers and top comments`}
            className="block h-auto max-w-full"
          />
        </Card>
      ) : (
        <PageCard brief={brief} />
      )}
    </motion.div>
  );
}

/** The Analytics page as it was: that moment's KPI, week and day, and the tagged frame if any. */
function AnalyticsSnapshot({ brief }: { brief: Brief }) {
  return (
    <HopStoreProvider
      initialPage="analytics"
      init={{
        analytics: brief.view ?? { kpi: 'revenue', range: 'thisWeek', day: null },
        analyticsIntroPending: false,
        selection: brief.tag?.page === 'analytics' ? brief.tag : null,
      }}
    >
      <div inert aria-label={`Analytics as it was at ${brief.time}`} role="img">
        <AnalyticsPage />
      </div>
    </HopStoreProvider>
  );
}

function Card({ children, fill = false }: { children: React.ReactNode; fill?: boolean }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={`mx-28 mt-14 overflow-hidden rounded-12 bg-surface-default shadow-screenshot-card ${fill ? 'h-snapshot' : 'self-start'}`}
      initial={reduce ? false : { scale: 0.98 }}
      animate={{ scale: 1, transition: { duration: duration.slow, ease: easeOut } }}
    >
      {children}
    </motion.div>
  );
}

/** A built page (or a placeholder) drawn at 0.83 with its top bar, read-only. */
function PageCard({ brief }: { brief: Brief }) {
  const [box, width] = useElementWidth<HTMLDivElement>(0);
  const page = brief.page;
  return (
    <Card fill>
      <div ref={box} className="h-full" role="img" aria-label={`Screenshot of ${PAGE_TITLES[page]} at ${brief.time}`}>
        {width > 0 && (
          <div inert className="flex origin-top-left flex-col bg-surface-default" style={{ width: width / SCALE, height: `${100 / SCALE}%`, transform: `scale(${SCALE})` }}>
            <HopStoreProvider initialPage={page} init={{ inventoryIntroPending: false, selection: brief.tag?.page === page ? brief.tag : null }}>
              <TopBar />
              <div className="relative min-h-0 flex-1 overflow-hidden" data-page={page}>
                <SnapshotPage page={page} />
              </div>
            </HopStoreProvider>
          </div>
        )}
      </div>
    </Card>
  );
}

function SnapshotPage({ page }: { page: Page }) {
  if (page === 'inventory') return <InventoryPage />;
  if (page === 'analytics') return <AnalyticsPage />;
  return <PlaceholderPage page={page} />;
}
