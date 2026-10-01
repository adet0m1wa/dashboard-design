import type { Person } from '@/data/team';
import type { AvatarColor } from '@/data/types';
import { HopAvatar } from '@/components/hop/HopAvatar';

// Round initial avatar in the person's token colour (brief A2). Hop gets its own face.
const BG: Record<AvatarColor, string> = {
  'avatar-amara': 'bg-avatar-amara',
  'avatar-ife': 'bg-avatar-ife',
  'avatar-dayo': 'bg-avatar-dayo',
  'avatar-zee': 'bg-avatar-zee',
  'palette-tone-15': 'bg-palette-tone-15',
  'palette-tone-17': 'bg-palette-tone-17',
  'status-info': 'bg-status-info',
};

// Figma sizes → initial type size: 16px avatar 8.5, 18px 9 (History), 28px 12, 32px 11.
// Instagram comments 26 → 10.5, Customers list 32 and header 40.
const TEXT: Record<number, string> = { 16: 'text-8-5', 18: 'text-9', 20: 'text-9', 24: 'text-11', 26: 'text-10-5', 28: 'text-12', 32: 'text-11', 40: 'text-13' };

export function PersonAvatar({ person, size }: { person: Person; size: number }) {
  if (person.color === 'hop') return <HopAvatar size={size} />;
  return <InitialsAvatar initials={person.initial} color={person.color} size={size} label={person.name} />;
}

export function InitialsAvatar({ initials, color, size, label }: { initials: string; color: AvatarColor; size: number; label?: string }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full font-600 text-text-on-dark ${BG[color]} ${TEXT[size] ?? 'text-11'}`}
      style={{ width: size, height: size }}
      aria-hidden={label ? undefined : true}
      title={label}
    >
      {initials}
    </span>
  );
}
