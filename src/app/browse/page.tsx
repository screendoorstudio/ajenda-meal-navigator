"use client";

import { useState, useEffect, useMemo } from "react";
import MealGrid from "@/components/meals/meal-grid";
import MealFilters, { type FiltersState } from "@/components/filters/meal-filters";
import { createClient } from "@/lib/supabase/client";
import type { Meal, MealType, PhaseId, PlanType } from "@/types/database";

const initialFilters: FiltersState = {
  mealType: 'all',
  phase: 'all',
  planType: 'all',
  minCalories: '',
  maxCalories: '',
  minProtein: '',
  search: '',
};

export default function BrowsePage() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FiltersState>(initialFilters);

  // Fetch meals from Supabase
  useEffect(() => {
    async function fetchMeals() {
      setLoading(true);
      const supabase = createClient();

      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .order('phase_id')
        .order('week')
        .order('day');

      if (error) {
        console.error('Error fetching meals:', error);
      } else {
        setMeals(data || []);
      }
      setLoading(false);
    }

    fetchMeals();
  }, []);

  // Filter meals client-side
  const filteredMeals = useMemo(() => {
    return meals.filter((meal) => {
      // Meal type filter
      if (filters.mealType !== 'all' && meal.meal_type !== filters.mealType) {
        return false;
      }

      // Phase filter
      if (filters.phase !== 'all' && meal.phase_id !== filters.phase) {
        return false;
      }

      // Plan type filter
      if (filters.planType !== 'all' && meal.plan_type !== filters.planType) {
        return false;
      }

      // Calorie filters
      if (filters.minCalories && meal.calories && meal.calories < parseInt(filters.minCalories)) {
        return false;
      }
      if (filters.maxCalories && meal.calories && meal.calories > parseInt(filters.maxCalories)) {
        return false;
      }

      // Protein filter
      if (filters.minProtein && meal.protein_g && meal.protein_g < parseInt(filters.minProtein)) {
        return false;
      }

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (!meal.name.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      return true;
    });
  }, [meals, filters]);

  const handleResetFilters = () => {
    setFilters(initialFilters);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Meals</h1>
        <p className="text-gray-600">
          Explore all {meals.length} meals from the Ajenda program.
          {filteredMeals.length !== meals.length && (
            <span className="ml-1 text-[var(--ajenda-red)]">
              Showing {filteredMeals.length} results.
            </span>
          )}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters Sidebar */}
        <aside className="w-full lg:w-64 shrink-0">
          <MealFilters
            filters={filters}
            onChange={setFilters}
            onReset={handleResetFilters}
          />
        </aside>

        {/* Meals Grid */}
        <div className="flex-1">
          <MealGrid meals={filteredMeals} loading={loading} />
        </div>
      </div>
    </div>
  );
}
