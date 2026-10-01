'use client';

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect } from 'react';
import { easeSoft, timing } from '@/lib/motion';
import { useHop } from '@/lib/store';

// Small dark toast at the bottom of the page area ("Reminder sent to Ife", stub actions).
// Announced politely; it leaves on its own after timing.toast. Emil Kowalski's toast: rises its
// own height in and sinks back out the same way (400ms, CSS `ease`); a new one replaces the old
// in the same spot (one grid cell), not beside it. Reduced motion: fades only.
export function Toast() {
  const reduce = useReducedMotion();
  const toast = useHop((s) => s.toast);
  const hideToast = useHop((s) => s.hideToast);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => hideToast(toast.id), timing.toast * 1000);
    return () => clearTimeout(t);
  }, [toast, hideToast]);

  return (
    <div role="status" aria-live="polite" className="pointer-events-none absolute inset-x-0 bottom-24 z-20 grid justify-items-center">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            className="col-start-1 row-start-1 rounded-8 bg-action-primary px-12 py-8 text-12-5 font-500 text-text-on-dark shadow-composer"
            initial={{ opacity: 0, ...(reduce ? {} : { transform: 'translateY(100%)' }) }}
            animate={{ opacity: 1, ...(reduce ? {} : { transform: 'translateY(0%)' }) }}
            exit={{ opacity: 0, ...(reduce ? {} : { transform: 'translateY(100%)' }) }}
            transition={{ duration: timing.toastMove, ease: easeSoft }}
          >
            {toast.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
