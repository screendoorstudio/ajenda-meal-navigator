import type { PhaseId, MealType, PlanType } from '@/types/database';

export const PHASES: { id: PhaseId; name: string; displayOrder: number }[] = [
  { id: 'phase-1', name: 'Phase 1', displayOrder: 1 },
  { id: 'phase-2', name: 'Phase 2', displayOrder: 2 },
  { id: 'phase-3', name: 'Phase 3', displayOrder: 3 },
  { id: 'bonus', name: 'Bonus', displayOrder: 4 },
  { id: 'm7', name: 'Month 7', displayOrder: 5 },
  { id: 'm8', name: 'Month 8', displayOrder: 6 },
  { id: 'm9', name: 'Month 9', displayOrder: 7 },
  { id: 'm10', name: 'Month 10', displayOrder: 8 },
];

// Meal Times (formerly Meal Types) - when the meal is eaten
export const MEAL_TIMES: MealType[] = [
  'Breakfast',
  'Lunch',
  'Dinner',
  'Snack',
  'Dessert',
  'Party',
];

// Keep MEAL_TYPES as alias for backward compatibility
export const MEAL_TYPES = MEAL_TIMES;

// Meal Categories - type of food/dish (derived from meal names)
export const MEAL_CATEGORIES: { value: string; label: string; keywords: string[] }[] = [
  { value: 'smoothie', label: 'Smoothie', keywords: ['smoothie'] },
  { value: 'salad', label: 'Salad', keywords: ['salad'] },
  { value: 'chicken', label: 'Chicken', keywords: ['chicken'] },
  { value: 'stir-fry', label: 'Stir-Fry', keywords: ['stir-fry', 'stir fry'] },
  { value: 'soup', label: 'Soup', keywords: ['soup', 'stew', 'chili'] },
  { value: 'toast', label: 'Toast', keywords: ['toast'] },
  { value: 'bowl', label: 'Bowl', keywords: ['bowl'] },
  { value: 'wrap', label: 'Wrap', keywords: ['wrap', 'burrito'] },
  { value: 'veggie', label: 'Veggie', keywords: ['veggie', 'vegetable', 'vegetarian'] },
  { value: 'oatmeal', label: 'Oatmeal/Oats', keywords: ['oatmeal', 'oats', 'overnight oats', 'porridge'] },
  { value: 'scramble', label: 'Scramble/Eggs', keywords: ['scramble', 'omelet', 'frittata', 'eggs'] },
  { value: 'yogurt', label: 'Yogurt', keywords: ['yogurt', 'parfait', 'skyr', 'kefir'] },
  { value: 'curry', label: 'Curry', keywords: ['curry', 'masala'] },
  { value: 'tacos', label: 'Tacos', keywords: ['taco', 'fajita'] },
  { value: 'sandwich', label: 'Sandwich', keywords: ['sandwich', 'pita'] },
  { value: 'salmon', label: 'Salmon', keywords: ['salmon'] },
  { value: 'tofu', label: 'Tofu', keywords: ['tofu', 'tempeh'] },
  { value: 'pasta', label: 'Pasta', keywords: ['pasta', 'noodle', 'spaghetti', 'orzo'] },
  { value: 'pudding', label: 'Pudding', keywords: ['pudding', 'chia pudding'] },
];

export const PLAN_TYPES: { value: PlanType; label: string }[] = [
  { value: 'Autophagy', label: 'Autophagy' },
  { value: 'Liquid-Only', label: 'Liquid Only' },
  { value: 'Wt. Adj. Avail.', label: 'Weight Adjustable' },
  { value: 'Serves 12', label: 'Serves 12 (Party)' },
  { value: 'Special Exception', label: 'Special Exception' },
];

// Phase mappings from Excel format to database format
export const PHASE_MAPPING: Record<string, PhaseId> = {
  '1': 'phase-1',
  '2': 'phase-2',
  '3': 'phase-3',
  'Bonus': 'bonus',
  'M7': 'm7',
  'M8': 'm8',
  'M9': 'm9',
  'M10': 'm10',
};

// Nutritional thresholds for quick filters
export const NUTRITIONAL_THRESHOLDS = {
  highProtein: 25, // grams
  lowCalorie: 300, // calories
  highFiber: 10, // grams
};
