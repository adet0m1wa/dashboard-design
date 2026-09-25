import type { Kpi, KpiDef } from './types';

// The five KPI tabs, in display order (brief A7). Figma's layer is called
// "KPI/Instagram reach" but the label says likes — it's `likes` everywhere in code (B11 #5).
export const KPI_ORDER: Kpi[] = ['revenue', 'orders', 'likes', 'followers', 'dms'];

export const KPIS: Record<Kpi, KpiDef> = {
  revenue: {
    id: 'revenue',
    label: 'Revenue',
    todayLabel: 'Revenue today',
    chartName: 'Revenue',
    format: 'currency',
    chartMax: 3500,
    tone: 'success',
    jumpTarget: 'sales',
  },
  orders: {
    id: 'orders',
    label: 'Orders',
    todayLabel: 'Orders',
    chartName: 'Orders',
    format: 'int',
    chartMax: 50,
    tone: 'success',
    jumpTarget: 'sales',
  },
  likes: {
    id: 'likes',
    label: 'Instagram likes',
    todayLabel: 'Instagram likes',
    chartName: 'Instagram likes',
    format: 'compact',
    chartMax: 25000,
    tone: 'success',
    jumpTarget: 'instagram',
  },
  followers: {
    id: 'followers',
    label: 'New followers',
    todayLabel: 'New followers',
    chartName: 'New followers',
    format: 'int',
    chartMax: 350,
    tone: 'success',
    jumpTarget: 'instagram',
  },
  dms: {
    id: 'dms',
    label: 'Unanswered DMs',
    todayLabel: 'Unanswered DMs',
    chartName: 'Unanswered DMs',
    format: 'int',
    chartMax: 12,
    tone: 'danger',
    jumpTarget: 'customers',
  },
};

export const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
export const TODAY_INDEX = 3; // "Now" is Thursday 24 September, 2:30 PM

/** Chart series (brief A7). Likes are stored as whole likes (18.2k → 18200). */
export const SERIES: Record<Kpi, { thisWeek: number[]; lastWeek: number[] }> = {
  revenue: { thisWeek: [1920, 2380, 3120, 2480], lastWeek: [2050, 2100, 2400, 2210, 2300, 2600, 2150] },
  orders: { thisWeek: [26, 30, 41, 34], lastWeek: [27, 26, 31, 32, 30, 35, 28] },
  likes: {
    thisWeek: [9800, 11400, 21600, 18200],
    lastWeek: [10100, 9500, 12000, 13900, 11200, 12600, 10400],
  },
  followers: { thisWeek: [96, 120, 310, 214], lastWeek: [88, 92, 110, 196, 140, 150, 105] },
  dms: { thisWeek: [4, 6, 5, 9], lastWeek: [3, 5, 4, 8, 6, 7, 5] },
};
