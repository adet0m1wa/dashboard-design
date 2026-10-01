'use client';

import { LayoutGroup, motion, type Variants } from 'motion/react';
import type { Brief } from '@/data/history';
import { PAGE_TITLES } from '@/data/nav';
import type { Page } from '@/data/types';
import { snapshotNote } from '@/lib/briefs';
import { viaKeyboard } from '@/lib/input';
import { duration, easeExit, easeOut, exitOf } from '@/lib/motion';
import { HopStoreProvider } from '@/lib/store';
import { useElementWidth } from '@/lib/useElementWidth';
import { ScreenshotIcon, TimeIcon } from '@/components/icons/figma';
import { StillOutline } from '@/components/select/HopFrame';
import { AnalyticsPage } from '@/components/pages/AnalyticsPage';
import { InventoryPage } from '@/components/pages/InventoryPage';
import { CustomersPage } from '@/components/customers/CustomersPage';
import { InstagramPage } from '@/components/instagram/InstagramPage';
import { SalesPage } from '@/components/sales/SalesPage';
import { TopBar } from '@/components/shell/TopBar';

// History's left side: what the selected brief looked like when it was asked (brief B7.5).
//   • asked on Analytics → the Analytics page redrawn with that moment's view, read-only
//   • asked on another page → a screenshot card: the real page drawn at 0.83 inside a white card
//     (12px radius, soft shadow) — Instagram too, since it was built (2026-10-01; it used to be the
//     Figma export, gradients and all)
//   • a tagged frame → the same, with the selection outline on the tagged frame
// Each snapshot has its own store, so it draws the page as it was without touching the live one.
// The swap is a quick crossfade (fast; no movement — briefs are switched all day, so Emil
// Kowalski's rule for frequent changes: drastically reduce), instant from the keyboard. A
// snapshot is a picture: its tag outline is simply there (StillOutline), it doesn't pop in.
const SCALE = 0.83; // Figma: the page's 56px top bar is 46px in the card

const SWAP: Variants = {
  hidden: (instant: boolean) => ({ opacity: 0, transition: instant ? { duration: 0 } : { duration: exitOf(duration.fast), ease: easeExit } }),
  shown: (instant: boolean) => ({ opacity: 1, transition: instant ? { duration: 0 } : { duration: duration.fast, ease: easeOut } }),
};

export function Snapshot({ brief }: { brief: Brief }) {
  const Icon = brief.page === 'analytics' ? TimeIcon : ScreenshotIcon;

  return (
    <motion.div className="flex flex-col" variants={SWAP} custom={viaKeyboard()} initial="hidden" animate="shown" exit="hidden">
      <StillOutline.Provider value={true}>
        {/* Figma "Snapshot note" */}
        <p className="mx-28 mt-24 flex items-center gap-8 rounded-8 bg-surface-subtle px-12 py-8 text-12-5 font-500 text-text-strong-secondary">
          <Icon className="shrink-0 text-text-secondary" />
          {snapshotNote(brief)}
        </p>
        {brief.page === 'analytics' ? (
          <AnalyticsSnapshot brief={brief} />
        ) : (
          <PageCard brief={brief} />
        )}
      </StillOutline.Provider>
    </motion.div>
  );
}

/** The Analytics page as it was: that moment's KPI, week and day, and the tagged frame if any.
 *  Its own LayoutGroup keeps its KPI pill and week thumb apart from the live page's (and from
 *  other briefs'): sharing the layoutIds made them fly across when changing page or brief (user
 *  feedback 2026-09-30). */
function AnalyticsSnapshot({ brief }: { brief: Brief }) {
  return (
    <LayoutGroup id={`snapshot-${brief.id}`}>
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
    </LayoutGroup>
  );
}

function Card({ children, fill = false }: { children: React.ReactNode; fill?: boolean }) {
  return <div className={`mx-28 mt-14 overflow-hidden rounded-12 bg-surface-default shadow-screenshot-card ${fill ? 'h-snapshot' : 'self-start'}`}>{children}</div>;
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
  if (page === 'sales') return <SalesPage />;
  if (page === 'instagram') return <InstagramPage />; // opens on the Sand reel, as at 1:40 PM
  if (page === 'customers') return <CustomersPage />; // opens on Chioma's thread
  return null;
}
