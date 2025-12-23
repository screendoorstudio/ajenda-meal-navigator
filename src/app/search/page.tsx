"use client";

import { useState, useEffect, useMemo } from "react";
import MealGrid from "@/components/meals/meal-grid";
import { createClient } from "@/lib/supabase/client";
import { MEAL_TIMES } from "@/lib/constants";
import type { Meal, MealType } from "@/types/database";

export default function SearchPage() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [ingredients, setIngredients] = useState<string>("");
  const [selectedMealTypes, setSelectedMealTypes] = useState<Set<MealType>>(new Set());

  // Fetch all meals on mount
  useEffect(() => {
    async function fetchMeals() {
      setLoading(true);
      const supabase = createClient();

      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching meals:', error);
      } else {
        setMeals((data || []) as Meal[]);
      }
      setLoading(false);
    }

    fetchMeals();
  }, []);

  // Parse ingredients from input
  const parsedIngredients = useMemo(() => {
    return ingredients
      .toLowerCase()
      .split(/[,\n]+/)
      .map(i => i.trim())
      .filter(i => i.length > 0);
  }, [ingredients]);

  // Filter meals by ingredients and meal types
  const searchResults = useMemo(() => {
    if (parsedIngredients.length === 0) {
      return [];
    }

    return meals
      .filter((meal) => {
        // Filter by meal type if any selected
        if (selectedMealTypes.size > 0 && !selectedMealTypes.has(meal.meal_type)) {
          return false;
        }

        // Search in meal name and recipe text
        const searchText = `${meal.name} ${meal.recipe_text || ''}`.toLowerCase();

        // Check if any ingredient matches
        return parsedIngredients.some(ingredient =>
          searchText.includes(ingredient)
        );
      })
      .map((meal) => {
        // Count how many ingredients match
        const searchText = `${meal.name} ${meal.recipe_text || ''}`.toLowerCase();
        const matchCount = parsedIngredients.filter(ingredient =>
          searchText.includes(ingredient)
        ).length;

        return { ...meal, matchCount };
      })
      .sort((a, b) => b.matchCount - a.matchCount);
  }, [meals, parsedIngredients, selectedMealTypes]);

  const toggleMealType = (type: MealType) => {
    const newSet = new Set(selectedMealTypes);
    if (newSet.has(type)) {
      newSet.delete(type);
    } else {
      newSet.add(type);
    }
    setSelectedMealTypes(newSet);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Search by Ingredients
        </h1>
        <p className="text-gray-600">
          Type ingredients you have on hand to find matching recipes.
        </p>
      </div>

      {/* Search Form */}
      <div className="card p-6 mb-6">
        <div className="space-y-4">
          {/* Ingredient Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What ingredients do you have?
            </label>
            <textarea
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              placeholder="Enter ingredients separated by commas or new lines...&#10;&#10;Examples: chicken, avocado, quinoa"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--ajenda-red)] focus:border-transparent min-h-[100px]"
            />
            {parsedIngredients.length > 0 && (
              <p className="text-sm text-gray-500 mt-2">
                Searching for: {parsedIngredients.join(', ')}
              </p>
            )}
          </div>

          {/* Meal Time Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meal Times (optional)
            </label>
            <div className="flex flex-wrap gap-2">
              {MEAL_TIMES.map((type) => (
                <button
                  key={type}
                  onClick={() => toggleMealType(type)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    selectedMealTypes.has(type)
                      ? 'bg-[var(--ajenda-red)] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <MealGrid meals={[]} loading={true} />
      ) : parsedIngredients.length === 0 ? (
        <div className="text-center py-12 card">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Start Searching
          </h3>
          <p className="text-gray-600">
            Enter some ingredients above to find matching recipes.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <p className="text-gray-600">
              Found <span className="font-semibold text-[var(--ajenda-red)]">{searchResults.length}</span> meals
              matching your ingredients.
            </p>
          </div>
          <MealGrid meals={searchResults} />
        </>
      )}
    </div>
  );
}
