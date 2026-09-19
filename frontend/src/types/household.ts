import type { User } from './auth';

export interface Household {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface HouseholdMember {
  id: number;
  household: number;
  user: User;
  role: 'ADMIN' | 'MEMBER';
  joined_at: string;
}

export interface HouseholdInput {
  name: string;
  description?: string;
}
