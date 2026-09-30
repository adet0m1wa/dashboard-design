// Shared types for every data file. Numbers live in data/*.ts only — never in components.

export type Page = 'analytics' | 'history' | 'sales' | 'instagram' | 'inventory' | 'customers';
export type Kpi = 'revenue' | 'orders' | 'likes' | 'followers' | 'dms';
export type PersonId = 'amara' | 'ife' | 'dayo' | 'zee' | 'hop';

/** A token-backed fill: a colour alias from styles/globals.css or a gradient from tokens.css. */
export type AvatarColor = 'avatar-amara' | 'avatar-ife' | 'avatar-dayo' | 'avatar-zee' | 'palette-tone-15' | 'palette-tone-17';
export type Swatch =
  | 'swatch-sand'
  | 'swatch-emerald'
  | 'swatch-indigo'
  | 'swatch-terracotta'
  | 'post-sand-reel'
  | 'post-fit-check'
  | 'swatch-olive'
  | 'swatch-ecru'
  | 'swatch-adire'
  | 'swatch-white'
  | 'swatch-rust';

export type Tone = 'success' | 'warning' | 'danger' | 'info';
export type NumberFormat = 'currency' | 'int' | 'compact';

/** Which slice of time the Analytics page is showing. */
export type PeriodKey = 'today' | 'mon' | 'tue' | 'wed' | 'lastWeek';

export interface KpiDef {
  id: Kpi;
  label: string; // "Revenue"
  todayLabel: string; // "Revenue today" — the tab label when today is showing
  chartName: string; // "Revenue" in "Revenue over the last 7 days"
  format: NumberFormat;
  chartMax: number;
  tone: 'success' | 'danger'; // chart colour
  jumpTarget: Page;
}

export interface KpiReading {
  value: number;
  note: string; // "+12%", "3 over 2h", "all answered"
  noteTone: 'success' | 'danger';
}

export interface ProductRow {
  id: string;
  name: string;
  swatch: Swatch;
  sold: number;
  share: number; // % of the period's revenue
  amount: number;
  tag?: { text: string; tone: Tone };
}

export interface OrderRow {
  id: string;
  customer: string;
  initials: string;
  avatar: AvatarColor;
  item: string;
  qty: number;
  time: string;
  amount: number;
  status: string;
  /** The status pill's tone: today's orders are "To pack" (warning, the default); past ones are done. */
  tone?: Tone;
}

export interface PostRow {
  id: string;
  title: string;
  meta: string;
  swatch: Swatch;
  likes: number;
}

export interface SourceRow {
  id: string;
  label: string;
  count: number;
  share: number;
}

export interface DmRow {
  id: string;
  customer: string;
  initials: string;
  avatar: AvatarColor;
  quote: string;
  waiting: string; // "8h" today; "Replied in 1h 10m" for a past period
  /** The wait pill's tone: danger (the default) while unanswered, success once replied. */
  tone?: Tone;
}

// The card's title is the selected KPI's name (user feedback 2026-09-30), so it isn't stored here.
interface CardBase {
  link: { label: string; page: Page };
  footer: [left: string, right: string];
}

export type Card =
  | (CardBase & { kind: 'products'; rows: ProductRow[] })
  | (CardBase & { kind: 'orders'; rows: OrderRow[] })
  | (CardBase & { kind: 'posts'; rows: PostRow[] })
  | (CardBase & { kind: 'sources'; rows: SourceRow[] })
  | (CardBase & { kind: 'dms'; rows: DmRow[] });

export type UrgentIcon = 'msg' | 'box' | 'users';

export interface UrgentItem {
  id: string;
  icon: UrgentIcon;
  title: string;
  sub: string;
  jumpTarget: Page;
  /** Live item: a button a person presses. */
  action?: { label: string; kind: 'draft' | 'reorder' | 'remind'; style: 'primary' | 'secondary' };
  /** Done item (past days / last week): a quiet status pill. */
  done?: 'Resolved' | 'Completed' | 'Attended';
}

/** Everything the Analytics page shows for one period, apart from the chart series. */
export interface Snapshot {
  key: PeriodKey;
  kpis: Record<Kpi, KpiReading>;
  /** The card beside Urgent, one per KPI. */
  cards: Record<Kpi, Card>;
  urgent: UrgentItem[];
}
