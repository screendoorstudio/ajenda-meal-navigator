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

export const MEAL_TYPES: MealType[] = [
  'Breakfast',
  'Lunch',
  'Dinner',
  'Snack',
  'Dessert',
  'Party',
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
