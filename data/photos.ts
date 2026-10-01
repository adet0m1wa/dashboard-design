// Product and post photos (user-generated in Figma from the round-3 prompts, 2026-10-01), keyed by
// the row id every dataset shares. Originals are 2048² PNGs in images/ (not committed); these are
// 256² WebP (quality 80) — sharp for 36px thumbnails on 2× screens. A row without a photo keeps
// its gradient swatch.
export const PHOTOS: Record<string, string> = {
  // Products
  'linen-sand': '/products/sand-linen.webp',
  'linen-olive': '/products/olive-linen.webp',
  'slip-emerald': '/products/emerald-slip.webp',
  'kimono-indigo': '/products/indigo-kimono.webp',
  'trousers-ecru': '/products/ecru-trousers.webp',
  'adire-blue': '/products/adire-dress.webp',
  'shirt-white': '/products/white-shirt.webp',
  'scarf-rust': '/products/rust-scarf.webp',
  'scarf-terracotta': '/products/terracotta-scarf.webp',
  'robe-mocha': '/products/mocha-robe.webp',
  'tote-natural': '/products/canvas-tote.webp',
  'midi-navy': '/products/navy-skirt.webp',
  'clutch-gold': '/products/gold-clutch.webp',
  'poplin-white': '/products/poplin-shirt.webp',
  // Instagram posts
  'post-sand-reel': '/products/sand-reel.webp',
  'post-fit-check': '/products/fit-check.webp',
  'post-emerald': '/products/emerald-post.webp',
  'post-packing': '/products/packing-day.webp',
  'post-kimono': '/products/kimono-restock.webp',
  // Last week's other posts (data/lastWeekDays.ts) reuse the product shots
  'post-rust': '/products/rust-scarf.webp',
  'post-olive': '/products/olive-linen.webp',
  'post-clutch': '/products/gold-clutch.webp',
  'post-mocha': '/products/mocha-robe.webp',
  // Earlier posts (data/instagram.ts, round 7) reuse the product shots too
  'post-opening-teaser': '/products/sand-linen.webp',
  'post-opening': '/products/olive-linen.webp',
  'post-adire': '/products/adire-dress.webp',
  'post-trousers': '/products/ecru-trousers.webp',
  'post-tote': '/products/canvas-tote.webp',
  'post-terracotta': '/products/terracotta-scarf.webp',
  'post-poplin': '/products/poplin-shirt.webp',
  'post-midi': '/products/navy-skirt.webp',
  'post-white-shirt': '/products/white-shirt.webp',
  'post-kimono-evening': '/products/indigo-kimono.webp',
  'post-sand-photos': '/products/sand-linen.webp',
  'post-olive-teaser': '/products/olive-linen.webp',
};
