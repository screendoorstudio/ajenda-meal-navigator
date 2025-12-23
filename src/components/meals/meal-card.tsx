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
      className="card p-5 block group"
    >
      {/* Top Row - Meal Type & Plan Badge */}
      <div className="flex justify-between items-start mb-3">
        <span className="label-uppercase">
          {meal.meal_type}
        </span>
        {meal.plan_type && (
          <span className={`badge text-xs ${getPlanTypeBadgeClass(meal.plan_type)}`}>
            {getPlanTypeLabel(meal.plan_type)}
          </span>
        )}
      </div>

      {/* Meal Name */}
      <h3 className="text-lg font-semibold text-[var(--scandi-charcoal)] mb-2 line-clamp-2 group-hover:text-[var(--ajenda-red)] transition-colors">
        {meal.name}
      </h3>

      {/* Phase & Week */}
      <p className="text-sm text-[var(--text-muted)] mb-4">
        {phase?.name || meal.phase_id} · Week {meal.week} · Day {meal.day}
      </p>

      {/* Nutritional Info - with subtle top border */}
      <div className="flex flex-wrap gap-2 pt-3 border-t border-[var(--border-subtle)]">
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
      return 'bg-[var(--ajenda-blue-tint)] text-[var(--ajenda-blue)]';
    case 'Wt. Adj. Avail.':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-[var(--scandi-linen)] text-[var(--text-muted)]';
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
