"use client";

import { MEAL_TYPES, PHASES, PLAN_TYPES } from "@/lib/constants";
import type { MealType, PhaseId, PlanType } from "@/types/database";

interface FiltersState {
  mealType: MealType | 'all';
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
    filters.mealType !== 'all' ||
    filters.phase !== 'all' ||
    filters.planType !== 'all' ||
    filters.minCalories !== '' ||
    filters.maxCalories !== '' ||
    filters.minProtein !== '' ||
    filters.search !== '';

  return (
    <div className="card p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold text-gray-900">Filters</h2>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="text-sm text-[var(--ajenda-red)] hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Search */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Search
        </label>
        <input
          type="text"
          value={filters.search}
          onChange={(e) => handleChange('search', e.target.value)}
          placeholder="Search by name..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--ajenda-red)] focus:border-transparent"
        />
      </div>

      {/* Meal Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Meal Type
        </label>
        <select
          value={filters.mealType}
          onChange={(e) => handleChange('mealType', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--ajenda-red)] focus:border-transparent"
        >
          <option value="all">All Types</option>
          {MEAL_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* Phase */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Phase
        </label>
        <select
          value={filters.phase}
          onChange={(e) => handleChange('phase', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--ajenda-red)] focus:border-transparent"
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
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Plan Type
        </label>
        <select
          value={filters.planType || 'all'}
          onChange={(e) => handleChange('planType', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--ajenda-red)] focus:border-transparent"
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
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Calories
        </label>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            value={filters.minCalories}
            onChange={(e) => handleChange('minCalories', e.target.value)}
            placeholder="Min"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--ajenda-red)] focus:border-transparent"
          />
          <span className="text-gray-500">-</span>
          <input
            type="number"
            value={filters.maxCalories}
            onChange={(e) => handleChange('maxCalories', e.target.value)}
            placeholder="Max"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--ajenda-red)] focus:border-transparent"
          />
        </div>
      </div>

      {/* Min Protein */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Min Protein (g)
        </label>
        <input
          type="number"
          value={filters.minProtein}
          onChange={(e) => handleChange('minProtein', e.target.value)}
          placeholder="e.g., 25"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--ajenda-red)] focus:border-transparent"
        />
      </div>

      {/* Quick Filters */}
      <div className="pt-2 border-t">
        <p className="text-sm font-medium text-gray-700 mb-2">Quick Filters</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onChange({ ...filters, minProtein: '25' })}
            className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 hover:bg-blue-200"
          >
            High Protein
          </button>
          <button
            onClick={() => onChange({ ...filters, maxCalories: '300' })}
            className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
          >
            Low Cal
          </button>
          <button
            onClick={() => onChange({ ...filters, planType: 'Autophagy' as PlanType })}
            className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800 hover:bg-purple-200"
          >
            Autophagy
          </button>
        </div>
      </div>
    </div>
  );
}

export type { FiltersState };
