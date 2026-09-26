'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useEffect } from 'react';
import { enter, leave, timing } from '@/lib/motion';
import { useHop } from '@/lib/store';

// Small dark toast at the bottom of the page area ("Reminder sent to Ife", stub actions).
// Announced politely; it leaves on its own after timing.toast.
export function Toast() {
  const toast = useHop((s) => s.toast);
  const hideToast = useHop((s) => s.hideToast);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => hideToast(toast.id), timing.toast * 1000);
    return () => clearTimeout(t);
  }, [toast, hideToast]);

  return (
    <div role="status" aria-live="polite" className="pointer-events-none absolute inset-x-0 bottom-24 z-20 flex justify-center">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            className="rounded-8 bg-action-primary px-12 py-8 text-12-5 font-500 text-text-on-dark shadow-composer"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0, transition: enter() }}
            exit={{ opacity: 0, y: 4, transition: leave() }}
          >
            {toast.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
