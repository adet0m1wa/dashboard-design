import type { Tone } from '@/data/types';

// Small status pill: px 8, py 2, radius 10, 11/600 (Figma "Tag/4 left", "Tag/To pack", "Tag/8h").
const TONE: Record<Tone, string> = {
  success: 'bg-status-success-soft text-status-success-text',
  warning: 'bg-status-warning-soft text-status-warning-text',
  danger: 'bg-status-danger-soft text-status-danger-text',
  info: 'bg-info-soft text-info-icon',
};

export function Tag({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return <span className={`shrink-0 whitespace-nowrap rounded-10 px-8 py-2 text-11 font-600 ${TONE[tone]}`}>{children}</span>;
}
