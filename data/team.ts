import type { AvatarColor, PersonId } from './types';

// Amara Atelier's team (brief A2). All names are placeholders.
export interface Person {
  id: PersonId;
  name: string;
  initial: string;
  role: string;
  color: AvatarColor | 'hop';
}

export const TEAM: Record<PersonId, Person> = {
  amara: { id: 'amara', name: 'Amara', initial: 'A', role: 'Owner', color: 'avatar-amara' },
  ife: { id: 'ife', name: 'Ife', initial: 'I', role: 'Assistant, restocks and packing', color: 'avatar-ife' },
  dayo: { id: 'dayo', name: 'Dayo', initial: 'D', role: 'Customer service, DMs', color: 'avatar-dayo' },
  zee: { id: 'zee', name: 'Zee', initial: 'Z', role: 'Content creator', color: 'avatar-zee' },
  hop: { id: 'hop', name: 'Hop', initial: 'H', role: 'Analyst', color: 'hop' },
};

export const CURRENT_USER = { ...TEAM.amara, fullName: 'Amara Obi', store: 'Amara Atelier', storeInitials: 'AA' };

export const NOW = { dayLabel: 'Thursday, 24 Sep', time: '2:30 PM', shortDate: 'Thu 24 Sep' };
export const SYNC = { before: '14:00', after: '14:30', checkedBefore: '2:00 PM', checkedAfter: '2:30 PM' };
