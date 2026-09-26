import type { Page } from '@/data/types';

// Server-safe page list (lib/store.tsx is a client module).
export const PAGE_IDS: Page[] = ['analytics', 'history', 'sales', 'instagram', 'inventory', 'customers'];
export const isPage = (p: string): p is Page => (PAGE_IDS as string[]).includes(p);
