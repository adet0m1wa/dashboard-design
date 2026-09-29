import type { SVGProps } from 'react';
import type { Page } from '@/data/types';
import { BoxIcon, ClockCounterClockwiseIcon, InstagramIcon, SalesIcon, UsersIcon } from '@/components/icons/figma';
import { HopHeadIcon } from '@/components/icons/HopHeadIcon';

const ICONS: Record<Page, (props: SVGProps<SVGSVGElement>) => React.ReactElement> = {
  analytics: HopHeadIcon,
  history: ClockCounterClockwiseIcon,
  sales: SalesIcon,
  instagram: InstagramIcon, // the current Instagram glyph (user feedback 2026-09-29), at the camera's size and stroke
  inventory: BoxIcon,
  customers: UsersIcon,
};

/** The 16px icon for a page, as used in the sidebar and the top bar. */
export function PageIcon({ page, ...props }: { page: Page } & SVGProps<SVGSVGElement>) {
  const Icon = ICONS[page];
  return <Icon {...props} />;
}
