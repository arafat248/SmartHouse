export interface Meal {
  id: number;
  household: number;
  member: number;
  member_detail: any;
  date: string;
  breakfast: string;
  lunch: string;
  dinner: string;
  guest_meals: string;
  total_meals: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface MealInput {
  household: number;
  member: number;
  date: string;
  breakfast?: string | number;
  lunch?: string | number;
  dinner?: string | number;
  guest_meals?: string | number;
  notes?: string;
}
