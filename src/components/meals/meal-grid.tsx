"use client";

import type { Meal } from "@/types/database";
import MealCard from "./meal-card";

interface MealGridProps {
  meals: Meal[];
  loading?: boolean;
}

export default function MealGrid({ meals, loading }: MealGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="card p-5 animate-pulse">
            <div className="h-3 bg-[var(--scandi-linen)] rounded w-20 mb-3"></div>
            <div className="h-5 bg-[var(--scandi-linen)] rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-[var(--scandi-linen)] rounded w-1/2 mb-4"></div>
            <div className="flex gap-2 pt-3 border-t border-[var(--border-subtle)]">
              <div className="h-6 bg-[var(--scandi-linen)] rounded w-16"></div>
              <div className="h-6 bg-[var(--scandi-linen)] rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (meals.length === 0) {
    return (
      <div className="text-center py-12 card">
        <div className="callout-circle w-20 h-20 mx-auto mb-4" style={{ borderColor: 'var(--ajenda-red)' }}>
          <svg className="w-8 h-8 text-[var(--ajenda-red)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-[var(--scandi-charcoal)] mb-2">No meals found</h3>
        <p className="text-[var(--text-muted)]">
          Try adjusting your filters or search terms.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {meals.map((meal) => (
        <MealCard key={meal.id} meal={meal} />
      ))}
    </div>
  );
}
