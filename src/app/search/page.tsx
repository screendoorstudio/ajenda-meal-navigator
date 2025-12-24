"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import MealGrid from "@/components/meals/meal-grid";
import { createClient } from "@/lib/supabase/client";
import { MEAL_TIMES } from "@/lib/constants";
import type { Meal, MealType } from "@/types/database";

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchPageSkeleton />}>
      <SearchPageContent />
    </Suspense>
  );
}

function SearchPageSkeleton() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="heading-serif text-3xl sm:text-4xl mb-3 not-italic font-semibold text-[var(--scandi-charcoal)]">
          Search by Ingredients
        </h1>
        <p className="text-[var(--text-muted)]">
          Type ingredients you have on hand to find matching recipes.
        </p>
      </div>
      <div className="card overflow-hidden mb-8 animate-pulse">
        <div className="section-header-bar">Ingredient Search</div>
        <div className="p-6">
          <div className="h-24 bg-[var(--scandi-linen)] rounded"></div>
        </div>
      </div>
    </div>
  );
}

function SearchPageContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [ingredients, setIngredients] = useState<string>(initialQuery);
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

        // Check if ALL ingredients match (AND logic)
        return parsedIngredients.every(ingredient =>
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
      <div className="mb-8">
        <h1 className="heading-serif text-3xl sm:text-4xl mb-3 not-italic font-semibold text-[var(--scandi-charcoal)]">
          Search by Ingredients
        </h1>
        <p className="text-[var(--text-muted)]">
          Type ingredients you have on hand to find matching recipes.
        </p>
      </div>

      {/* Search Form */}
      <div className="card overflow-hidden mb-8">
        <div className="section-header-bar">Ingredient Search</div>
        <div className="p-6 space-y-5">
          {/* Ingredient Input */}
          <div>
            <label className="label-uppercase block mb-2">
              What ingredients do you have?
            </label>
            <textarea
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              placeholder="Enter ingredients separated by commas or new lines...&#10;&#10;Examples: chicken, avocado, quinoa"
              className="input-field min-h-[100px] resize-y"
            />
            {parsedIngredients.length > 0 && (
              <p className="text-sm text-[var(--text-muted)] mt-2">
                Searching for: {parsedIngredients.join(', ')}
              </p>
            )}
          </div>

          {/* Meal Time Filter */}
          <div>
            <label className="label-uppercase block mb-3">
              Meal Times (optional)
            </label>
            <div className="flex flex-wrap gap-2">
              {MEAL_TIMES.map((type) => (
                <button
                  key={type}
                  onClick={() => toggleMealType(type)}
                  className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                    selectedMealTypes.has(type)
                      ? 'bg-[var(--ajenda-red)] text-white'
                      : 'bg-[var(--scandi-linen)] text-[var(--scandi-charcoal)] hover:bg-[var(--scandi-birch)]'
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
          <div className="callout-circle w-20 h-20 mx-auto mb-4 nutrition-protein">
            <svg className="w-8 h-8 value" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[var(--scandi-charcoal)] mb-2">
            Start Searching
          </h3>
          <p className="text-[var(--text-muted)]">
            Enter some ingredients above to find matching recipes.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <p className="text-[var(--text-muted)]">
              Found <span className="font-semibold text-[var(--ajenda-red)]">{searchResults.length}</span> meals
              matching your ingredients.
            </p>
          </div>
          <MealGrid meals={searchResults} searchQuery={ingredients} />
        </>
      )}
    </div>
  );
}
