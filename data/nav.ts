import type { Page, Tone } from './types';

// Sidebar navigation (Figma frame "Analytics" > Sidebar), top to bottom.
export const NAV: { id: Page; label: string; badge?: { count: number; tone: Extract<Tone, 'warning' | 'danger'> } }[] = [
  { id: 'analytics', label: 'Analytics' },
  { id: 'history', label: 'History' },
  { id: 'sales', label: 'Sales' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'inventory', label: 'Inventory', badge: { count: 4, tone: 'warning' } },
  { id: 'customers', label: 'Customers', badge: { count: 3, tone: 'danger' } },
];

export const PAGE_TITLES: Record<Page, string> = {
  analytics: 'Analytics',
  history: 'History',
  sales: 'Sales',
  instagram: 'Instagram',
  inventory: 'Inventory',
  customers: 'Customers',
};
