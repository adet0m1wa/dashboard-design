'use client';

import { AnimatePresence } from 'motion/react';
import { viaKeyboard } from '@/lib/input';
import { useDeferredValue, useMemo } from 'react';
import { allBriefs } from '@/lib/briefs';
import { useHop } from '@/lib/store';
import { Snapshot } from './Snapshot';

// History's page area (brief B7.5): what the selected brief looked like when it was asked. The
// brief chain and its chat live in the side panel (HistoryPanel).
export function HistoryPage() {
  const threads = useHop((s) => s.threads);
  const selectedId = useHop((s) => s.history.selectedId);
  const briefs = useMemo(() => allBriefs(threads), [threads]);
  // Deferred: the snapshot (a whole page) redraws at low priority, so picking a brief never holds
  // up the highlight sliding in the side panel (dev builds took 100–250ms here).
  const shownId = useDeferredValue(selectedId);
  const brief = briefs.find((b) => b.id === shownId) ?? briefs[0];

  return (
    <div className="h-full overflow-y-auto pb-24">
      {/* `custom`: picked with Enter → the old snapshot leaves at once too. */}
      <AnimatePresence mode="wait" initial={false} custom={viaKeyboard()}>
        <Snapshot key={brief.id} brief={brief} />
      </AnimatePresence>
    </div>
  );
}
