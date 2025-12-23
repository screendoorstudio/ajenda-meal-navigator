// Database types for Supabase

export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' | 'Dessert' | 'Party';

export type PlanType = 'Autophagy' | 'Liquid-Only' | 'Wt. Adj. Avail.' | 'Serves 12' | 'Special Exception' | null;

export type PhaseId = 'phase-1' | 'phase-2' | 'phase-3' | 'bonus' | 'm7' | 'm8' | 'm9' | 'm10';

export interface Phase {
  id: PhaseId;
  name: string;
  display_order: number;
  description: string | null;
}

export interface WeeklyPdf {
  id: string;
  phase_id: PhaseId;
  week_number: number;
  pdf_storage_path: string;
  pdf_url: string | null;
  total_pages: number | null;
  created_at: string;
}

export interface Meal {
  id: string;
  meal_type: MealType;
  name: string;
  phase_id: PhaseId;
  week: number;
  day: string; // '1'-'7' or 'A','B','C','D'
  page: number;
  calories: number | null;
  protein_g: number | null;
  fiber_g: number | null;
  plan_type: PlanType;
  other_meal_plans: string | null;
  recipe_text: string | null;
  created_at: string;
  updated_at: string;
}

export interface Ingredient {
  id: string;
  name: string;
  normalized_name: string;
  category: string | null;
}

export interface MealIngredient {
  meal_id: string;
  ingredient_id: string;
  quantity: string | null;
}

// Extended types for joins
export interface MealWithIngredients extends Meal {
  ingredients: (Ingredient & { quantity: string | null })[];
  pdf_url?: string;
}

export interface MealSearchResult extends Meal {
  match_count?: number;
  pdf_url?: string;
}

// Database schema type for Supabase
export interface Database {
  public: {
    Tables: {
      phases: {
        Row: Phase;
        Insert: Omit<Phase, 'id'> & { id?: PhaseId };
        Update: Partial<Phase>;
      };
      weekly_pdfs: {
        Row: WeeklyPdf;
        Insert: Omit<WeeklyPdf, 'id' | 'created_at'>;
        Update: Partial<Omit<WeeklyPdf, 'id' | 'created_at'>>;
      };
      meals: {
        Row: Meal;
        Insert: Omit<Meal, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Meal, 'id' | 'created_at' | 'updated_at'>>;
      };
      ingredients: {
        Row: Ingredient;
        Insert: Omit<Ingredient, 'id'>;
        Update: Partial<Omit<Ingredient, 'id'>>;
      };
      meal_ingredients: {
        Row: MealIngredient;
        Insert: MealIngredient;
        Update: Partial<MealIngredient>;
      };
    };
  };
}
