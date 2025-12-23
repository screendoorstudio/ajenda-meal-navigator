"use client";

import { MEAL_TIMES, PHASES, PLAN_TYPES, MEAL_CATEGORIES } from "@/lib/constants";
import type { MealType, PhaseId, PlanType } from "@/types/database";

interface FiltersState {
  mealTime: MealType | 'all';
  mealCategory: string | 'all';
  phase: PhaseId | 'all';
  planType: PlanType | 'all';
  minCalories: string;
  maxCalories: string;
  minProtein: string;
  search: string;
}

interface MealFiltersProps {
  filters: FiltersState;
  onChange: (filters: FiltersState) => void;
  onReset: () => void;
}

export default function MealFilters({ filters, onChange, onReset }: MealFiltersProps) {
  const handleChange = (key: keyof FiltersState, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  const hasActiveFilters =
    filters.mealTime !== 'all' ||
    filters.mealCategory !== 'all' ||
    filters.phase !== 'all' ||
    filters.planType !== 'all' ||
    filters.minCalories !== '' ||
    filters.maxCalories !== '' ||
    filters.minProtein !== '' ||
    filters.search !== '';

  return (
    <div className="card overflow-hidden">
      {/* Black Bar Header */}
      <div className="section-header-bar flex justify-between items-center">
        <span>Filters</span>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="text-xs font-normal text-white/80 hover:text-white transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="p-5 space-y-5">
        {/* Search */}
        <div>
          <label className="label-uppercase block mb-2">
            Search
          </label>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => handleChange('search', e.target.value)}
            placeholder="Search by name..."
            className="input-field"
          />
        </div>

        {/* Meal Time (Breakfast, Lunch, Dinner, etc.) */}
        <div>
          <label className="label-uppercase block mb-2">
            Meal Time
          </label>
          <select
            value={filters.mealTime}
            onChange={(e) => handleChange('mealTime', e.target.value)}
            className="input-field"
          >
            <option value="all">All Times</option>
            {MEAL_TIMES.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>

        {/* Meal Type (Smoothie, Salad, Chicken, etc.) */}
        <div>
          <label className="label-uppercase block mb-2">
            Meal Type
          </label>
          <select
            value={filters.mealCategory}
            onChange={(e) => handleChange('mealCategory', e.target.value)}
            className="input-field"
          >
            <option value="all">All Types</option>
            {MEAL_CATEGORIES.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        {/* Phase */}
        <div>
          <label className="label-uppercase block mb-2">
            Phase
          </label>
          <select
            value={filters.phase}
            onChange={(e) => handleChange('phase', e.target.value)}
            className="input-field"
          >
            <option value="all">All Phases</option>
            {PHASES.map((phase) => (
              <option key={phase.id} value={phase.id}>
                {phase.name}
              </option>
            ))}
          </select>
        </div>

        {/* Plan Type */}
        <div>
          <label className="label-uppercase block mb-2">
            Plan Type
          </label>
          <select
            value={filters.planType || 'all'}
            onChange={(e) => handleChange('planType', e.target.value)}
            className="input-field"
          >
            <option value="all">All Plans</option>
            {PLAN_TYPES.map((plan) => (
              <option key={plan.value || 'none'} value={plan.value || ''}>
                {plan.label}
              </option>
            ))}
          </select>
        </div>

        {/* Calorie Range */}
        <div>
          <label className="label-uppercase block mb-2">
            Calories
          </label>
          <div className="flex gap-2 items-center">
            <input
              type="number"
              value={filters.minCalories}
              onChange={(e) => handleChange('minCalories', e.target.value)}
              placeholder="Min"
              className="input-field"
            />
            <span className="text-[var(--text-muted)]">–</span>
            <input
              type="number"
              value={filters.maxCalories}
              onChange={(e) => handleChange('maxCalories', e.target.value)}
              placeholder="Max"
              className="input-field"
            />
          </div>
        </div>

        {/* Min Protein */}
        <div>
          <label className="label-uppercase block mb-2">
            Min Protein (g)
          </label>
          <input
            type="number"
            value={filters.minProtein}
            onChange={(e) => handleChange('minProtein', e.target.value)}
            placeholder="e.g., 25"
            className="input-field"
          />
        </div>

        {/* Quick Filters */}
        <div className="pt-4 border-t border-[var(--border-subtle)]">
          <p className="label-uppercase mb-3">Quick Filters</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onChange({ ...filters, minProtein: '25' })}
              className="badge bg-[var(--ajenda-blue-tint)] text-[var(--ajenda-blue)] hover:opacity-80 transition-opacity cursor-pointer"
            >
              High Protein
            </button>
            <button
              onClick={() => onChange({ ...filters, maxCalories: '300' })}
              className="badge bg-amber-100 text-amber-800 hover:opacity-80 transition-opacity cursor-pointer"
            >
              Low Cal
            </button>
            <button
              onClick={() => onChange({ ...filters, planType: 'Autophagy' as PlanType })}
              className="badge bg-purple-100 text-purple-800 hover:opacity-80 transition-opacity cursor-pointer"
            >
              Autophagy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export type { FiltersState };
