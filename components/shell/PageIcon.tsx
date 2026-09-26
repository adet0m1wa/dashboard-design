import type { SVGProps } from 'react';
import type { Page } from '@/data/types';
import { BoxIcon, CameraIcon, ClockCounterClockwiseIcon, SalesIcon, UsersIcon } from '@/components/icons/figma';
import { HopHeadIcon } from '@/components/icons/HopHeadIcon';

const ICONS: Record<Page, (props: SVGProps<SVGSVGElement>) => React.ReactElement> = {
  analytics: HopHeadIcon,
  history: ClockCounterClockwiseIcon,
  sales: SalesIcon,
  instagram: CameraIcon,
  inventory: BoxIcon,
  customers: UsersIcon,
};

/** The 16px icon for a page, as used in the sidebar and the top bar. */
export function PageIcon({ page, ...props }: { page: Page } & SVGProps<SVGSVGElement>) {
  const Icon = ICONS[page];
  return <Icon {...props} />;
}
