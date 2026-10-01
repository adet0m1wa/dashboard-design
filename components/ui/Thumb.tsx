import { PHOTOS } from '@/data/photos';
import type { Swatch } from '@/data/types';

// A product or post thumbnail: its photo when there is one, over the gradient swatch (which shows
// while it loads, and stays when there's no photo). Decorative — the row's name sits beside it.
export function Thumb({ id, swatch, className }: { id: string; swatch: Swatch; className: string }) {
  const src = PHOTOS[id];
  return (
    <span className={`relative shrink-0 overflow-hidden ${className}`} style={{ background: `var(--gradient-${swatch})` }}>
      {src && <img src={src} alt="" decoding="async" className="absolute inset-0 size-full object-cover" />}
    </span>
  );
}
