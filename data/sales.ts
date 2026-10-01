import type { Answer } from './conversation';
import type { AvatarColor, Tone } from './types';

// The Sales page (user feedback 2026-10-01: design the remaining screens), laid out after the
// older Figma reference "07 · Sales — Hop collapsed" (1791:2608) in today's styling.
//
// "Last 7 days" = Fri 18 – Thu 24 Sep. Revenue and orders per day are the Analytics series (last
// week's Fri–Sun, this week's Mon–Thu); the 7 days before that use last week's Mon–Thu plus a
// weekend written for the prototype (Fri 11 – Sun 13). Today's orders are the Analytics ones
// (Tolu, Ada, Grace…), "6 to pack" as on the Urgent card; #1042 is Chioma's (Customers).

export const SALES_DAYS = ['Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Today'] as const;
export const SALES_REVENUE = {
  current: [2300, 2600, 2150, 1920, 2380, 3120, 2480], // 16,950
  previous: [2150, 2450, 1980, 2050, 2100, 2400, 2210], // 15,340
  max: 3500,
};

export const SALES_TILES = [
  { id: 'revenue', label: 'Revenue', value: '$16,950', note: '+10%', tone: 'success' },
  { id: 'orders', label: 'Orders', value: '224', note: '+10%', tone: 'success' }, // 203 the week before
  { id: 'average', label: 'Average order', value: '$76', note: 'same as before', tone: 'muted' },
  { id: 'returning', label: 'Returning customers', value: '38%', note: '+3 pts', tone: 'success' },
] as const;

export type Fulfilment = 'To pack' | 'Shipped' | 'Delivered';
export const FULFILMENT_TONE: Record<Fulfilment, Tone> = { 'To pack': 'warning', Shipped: 'info', Delivered: 'success' };

export interface SalesOrder {
  number: number;
  customer: string;
  initials: string;
  avatar: AvatarColor;
  productId: string; // data/photos.ts
  item: string; // "Satin slip dress (Emerald) × 1"
  total: number;
  fulfilment: Fulfilment;
  placed: string;
}

export const SALES_ORDERS: SalesOrder[] = [
  { number: 1048, customer: 'Tolu Bakare', initials: 'TB', avatar: 'avatar-ife', productId: 'slip-emerald', item: 'Satin slip dress (Emerald) × 1', total: 90, fulfilment: 'To pack', placed: '2:02 PM' },
  { number: 1047, customer: 'Ada Williams', initials: 'AW', avatar: 'palette-tone-15', productId: 'kimono-indigo', item: 'Wrap kimono (Indigo) × 1', total: 90, fulfilment: 'To pack', placed: '1:30 PM' },
  { number: 1046, customer: 'Grace Mensah', initials: 'GM', avatar: 'avatar-dayo', productId: 'linen-sand', item: 'Linen two-piece (Sand) × 2', total: 180, fulfilment: 'To pack', placed: '12:48 PM' },
  { number: 1045, customer: 'Kemi Lawal', initials: 'KL', avatar: 'palette-tone-15', productId: 'scarf-rust', item: 'Silk scarf (Rust) × 2', total: 170, fulfilment: 'To pack', placed: '11:20 AM' },
  { number: 1044, customer: 'Bisi Adeyemi', initials: 'BA', avatar: 'avatar-zee', productId: 'tote-natural', item: 'Canvas tote (Natural) × 1', total: 90, fulfilment: 'To pack', placed: '10:05 AM' },
  { number: 1043, customer: 'Ngozi Okafor', initials: 'NO', avatar: 'avatar-amara', productId: 'linen-olive', item: 'Linen two-piece (Olive) × 1', total: 90, fulfilment: 'To pack', placed: '9:40 AM' },
  { number: 1042, customer: 'Chioma Eze', initials: 'CE', avatar: 'palette-tone-17', productId: 'linen-sand', item: 'Linen two-piece (Sand) × 1', total: 90, fulfilment: 'Shipped', placed: 'Wed' },
  { number: 1041, customer: 'Sarah Kim', initials: 'SK', avatar: 'status-info', productId: 'shirt-white', item: 'Linen shirt (White) × 1', total: 75, fulfilment: 'Shipped', placed: 'Wed' },
  { number: 1040, customer: 'Zainab Bello', initials: 'ZB', avatar: 'palette-tone-17', productId: 'clutch-gold', item: 'Beaded clutch (Gold) × 1', total: 115, fulfilment: 'Delivered', placed: 'Tue' },
  { number: 1039, customer: 'Funke Ola', initials: 'FO', avatar: 'avatar-ife', productId: 'midi-navy', item: 'Pleated midi skirt (Navy) × 1', total: 92, fulfilment: 'Delivered', placed: 'Tue' },
];

export type SalesFilter = 'all' | Fulfilment;
export const SALES_FILTERS: { id: SalesFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'To pack', label: 'To pack' },
  { id: 'Shipped', label: 'Shipped' },
  { id: 'Delivered', label: 'Delivered' },
];

const text = (t: string): Answer['blocks'][number] => ({ kind: 'text', text: t });

export const SALES_ANSWERS: Record<string, Answer> = {
  'sales.tile.revenue': { reads: ['sales'], blocks: [text('$16,950 in the last 7 days, 10% up on the 7 before ($15,340). Wednesday was the best day at $3,120.')] },
  'sales.tile.orders': { reads: ['sales'], blocks: [text('224 orders in 7 days, up from 203. 6 of today’s 34 are still to pack.')] },
  'sales.tile.average': { reads: ['sales'], blocks: [text('The average order is $76, the same as the week before. Two-piece sets lift it; single scarves pull it down.')] },
  'sales.tile.returning': { reads: ['sales', 'customers'], blocks: [text('38% of this week’s orders came from returning customers, up 3 points. Chioma and Grace are among this week’s repeat buyers.')] },
  'sales.chart': { reads: ['sales'], blocks: [text('Every day since Tuesday is ahead of the same day a week before. Wednesday ($3,120) was the peak, the day after the Sand reel went up.')] },
  'sales.orders': { reads: ['sales'], blocks: [text('6 orders are to pack, all from today: Tolu, Ada, Grace, Kemi, Bisi and Ngozi. Ife is on packing today.')] },
  ...Object.fromEntries(
    SALES_ORDERS.map((o) => [
      `sales.order.${o.number}`,
      {
        reads: ['sales'],
        blocks: [
          text(
            o.fulfilment === 'To pack'
              ? `Order #${o.number} from ${o.customer}: ${o.item.replace(' × ', ', ')} for $${o.total}, placed ${o.placed}. It’s paid and waiting to be packed.`
              : `Order #${o.number} from ${o.customer} (${o.item.replace(' × ', ', ')}) is ${o.fulfilment.toLowerCase()}.${o.number === 1042 ? ' It left this morning, and Chioma has been asking about it since 6:12 AM.' : ''}`,
          ),
        ],
      } satisfies Answer,
    ]),
  ),
};
