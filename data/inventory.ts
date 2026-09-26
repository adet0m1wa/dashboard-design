import type { Swatch } from './types';

// Inventory (Figma "Inventory — nothing selected, jump chips stay"; brief B7.4).

export const STOCK_SUMMARY = [
  { id: 'products', label: 'Products', value: '146', tone: 'default' },
  { id: 'low', label: 'Low stock', value: '3', tone: 'warning' },
  { id: 'soldout', label: 'Sold out', value: '1', tone: 'danger' },
  { id: 'value', label: 'Stock value', value: '$38.2k', tone: 'default' },
] as const;

export const NEED_ATTENTION = '3 need attention';

export type StockStatus = 'Low' | 'In stock' | 'Sold out';

export interface StockRow {
  id: string;
  name: string;
  variant: string;
  swatch: Swatch;
  inStock: number;
  sold7d: number;
  status: StockStatus;
  /** Frame label when tagged (matches the conversation: "Adire shirt dress"). */
  tagLabel: string;
}

/** A full stock bar is 40 units (Figma: 40 in stock → the whole 70px bar). */
export const STOCK_BAR_MAX = 40;

export const STOCK: StockRow[] = [
  { id: 'linen-sand', name: 'Linen two-piece', variant: 'Sand · sizes 8–16', swatch: 'swatch-sand', inStock: 4, sold7d: 31, status: 'Low', tagLabel: 'Linen two-piece (Sand)' },
  { id: 'linen-olive', name: 'Linen two-piece', variant: 'Olive · sizes 8–16', swatch: 'swatch-olive', inStock: 7, sold7d: 18, status: 'Low', tagLabel: 'Linen two-piece (Olive)' },
  { id: 'trousers-ecru', name: 'Wide-leg trousers', variant: 'Ecru linen', swatch: 'swatch-ecru', inStock: 9, sold7d: 14, status: 'Low', tagLabel: 'Wide-leg trousers (Ecru)' },
  { id: 'slip-emerald', name: 'Satin slip dress', variant: 'Emerald', swatch: 'swatch-emerald', inStock: 22, sold7d: 20, status: 'In stock', tagLabel: 'Satin slip dress (Emerald)' },
  { id: 'kimono-indigo', name: 'Wrap kimono', variant: 'Indigo', swatch: 'swatch-indigo', inStock: 16, sold7d: 11, status: 'In stock', tagLabel: 'Wrap kimono (Indigo)' },
  { id: 'adire-blue', name: 'Adire shirt dress', variant: 'Blue', swatch: 'swatch-adire', inStock: 0, sold7d: 9, status: 'Sold out', tagLabel: 'Adire shirt dress' },
  { id: 'shirt-white', name: 'Linen shirt', variant: 'White', swatch: 'swatch-white', inStock: 25, sold7d: 8, status: 'In stock', tagLabel: 'Linen shirt (White)' },
  { id: 'scarf-rust', name: 'Silk scarf', variant: 'Rust', swatch: 'swatch-rust', inStock: 40, sold7d: 6, status: 'In stock', tagLabel: 'Silk scarf (Rust)' },
];
