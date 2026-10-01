'use client';

import { motion } from 'motion/react';
import { press } from '@/lib/motion';
import { useHop } from '@/lib/store';
import { Chev13Icon, PlusIcon } from '@/components/icons/figma';

// Inventory top bar, right side (Figma "Row / All products"). Both are stubs (brief B7.4).
export function InventoryTopActions() {
  const showToast = useHop((s) => s.showToast);
  return (
    <div className="flex items-center gap-8">
      <motion.button
        type="button"
        whileTap={press}
        onClick={() => showToast('Product filters are coming soon')}
        className="flex items-center gap-6 rounded-8 border border-surface-border-tint bg-surface-default px-10 py-6 text-12-5 font-500 text-text-strong-secondary transition-colors duration-(--dur-fast) ease-hop-color hover:bg-surface-subtle"
      >
        All products
        <Chev13Icon className="text-text-secondary" />
      </motion.button>
      <motion.button
        type="button"
        whileTap={press}
        onClick={() => showToast('Adding products is coming soon')}
        className="flex items-center gap-6 rounded-8 bg-action-primary px-11 py-6 text-12 font-500 text-text-on-dark transition-colors duration-(--dur-fast) ease-hop-color hover:bg-palette-tone-25"
      >
        <PlusIcon />
        Add product
      </motion.button>
    </div>
  );
}
