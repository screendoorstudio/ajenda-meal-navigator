"use client";

import Link from "next/link";
import type { Meal } from "@/types/database";
import { PHASES } from "@/lib/constants";

interface MealCardProps {
  meal: Meal;
}

export default function MealCard({ meal }: MealCardProps) {
  const phase = PHASES.find(p => p.id === meal.phase_id);

  return (
    <Link
      href={`/meals/${meal.id}`}
      className="card p-4 hover:shadow-md transition-shadow block"
    >
      {/* Meal Type Badge */}
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          {meal.meal_type}
        </span>
        {meal.plan_type && (
          <span className={`badge text-xs ${getPlanTypeBadgeClass(meal.plan_type)}`}>
            {getPlanTypeLabel(meal.plan_type)}
          </span>
        )}
      </div>

      {/* Meal Name */}
      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
        {meal.name}
      </h3>

      {/* Phase & Week */}
      <p className="text-sm text-gray-500 mb-3">
        {phase?.name || meal.phase_id} • Week {meal.week} • Day {meal.day}
      </p>

      {/* Nutritional Info */}
      <div className="flex flex-wrap gap-2">
        {meal.calories && (
          <span className="badge badge-calories">
            {meal.calories} cal
          </span>
        )}
        {meal.protein_g && (
          <span className="badge badge-protein">
            {meal.protein_g}g protein
          </span>
        )}
        {meal.fiber_g && (
          <span className="badge badge-fiber">
            {meal.fiber_g}g fiber
          </span>
        )}
      </div>
    </Link>
  );
}

function getPlanTypeBadgeClass(planType: string): string {
  switch (planType) {
    case 'Autophagy':
      return 'bg-purple-100 text-purple-800';
    case 'Liquid-Only':
      return 'bg-blue-100 text-blue-800';
    case 'Wt. Adj. Avail.':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function getPlanTypeLabel(planType: string): string {
  switch (planType) {
    case 'Wt. Adj. Avail.':
      return 'Wt. Adj.';
    default:
      return planType;
  }
}
