import { createClient } from "@/lib/supabase/server";
import { PHASES } from "@/lib/constants";
import { formatRecipeForDisplay } from "@/lib/utils/format-recipe";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Meal } from "@/types/database";

interface MealPageProps {
  params: Promise<{ id: string }>;
}

export default async function MealPage({ params }: MealPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch meal
  const { data, error } = await supabase
    .from('meals')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    notFound();
  }

  const meal = data as Meal;

  // Fetch PDF for this meal
  const { data: pdfData } = await supabase
    .from('weekly_pdfs')
    .select('pdf_url')
    .eq('phase_id', meal.phase_id)
    .eq('week_number', meal.week)
    .single();

  const pdf = pdfData as { pdf_url: string | null } | null;

  const phase = PHASES.find(p => p.id === meal.phase_id);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <ol className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
          <li>
            <Link href="/browse" className="hover:text-[var(--ajenda-red)] transition-colors">
              Browse
            </Link>
          </li>
          <li className="text-[var(--scandi-oak)]">/</li>
          <li>
            <Link
              href={`/browse?phase=${meal.phase_id}`}
              className="hover:text-[var(--ajenda-red)] transition-colors"
            >
              {phase?.name || meal.phase_id}
            </Link>
          </li>
          <li className="text-[var(--scandi-oak)]">/</li>
          <li className="text-[var(--scandi-charcoal)] font-medium truncate">{meal.name}</li>
        </ol>
      </nav>

      {/* Header Card */}
      <div className="card overflow-hidden mb-8">
        <div className="section-header-bar flex justify-between items-center">
          <span>{meal.meal_type}</span>
          {meal.plan_type && (
            <span className="text-xs font-normal opacity-80">
              {meal.plan_type}
            </span>
          )}
        </div>
        <div className="p-6">
          <h1 className="heading-serif text-3xl sm:text-4xl mb-3 not-italic font-semibold text-[var(--scandi-charcoal)]">
            {meal.name}
          </h1>
          <p className="text-[var(--text-muted)]">
            {phase?.name} · Week {meal.week} · Day {meal.day} · Page {meal.page}
          </p>
        </div>
      </div>

      {/* Circular Nutrition Stats (PDF Style) */}
      <div className="flex flex-wrap justify-center gap-6 sm:gap-10 mb-8">
        <div className="callout-circle w-24 h-24 sm:w-28 sm:h-28 nutrition-calories">
          <span className="text-2xl sm:text-3xl font-bold value">
            {meal.calories || '—'}
          </span>
          <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Calories</span>
        </div>
        <div className="callout-circle w-24 h-24 sm:w-28 sm:h-28 nutrition-protein">
          <span className="text-2xl sm:text-3xl font-bold value">
            {meal.protein_g ? `${meal.protein_g}g` : '—'}
          </span>
          <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Protein</span>
        </div>
        <div className="callout-circle w-24 h-24 sm:w-28 sm:h-28 nutrition-fiber">
          <span className="text-2xl sm:text-3xl font-bold value">
            {meal.fiber_g ? `${meal.fiber_g}g` : '—'}
          </span>
          <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Fiber</span>
        </div>
      </div>

      {/* Recipe */}
      {meal.recipe_text && (
        <RecipeDisplay recipeText={meal.recipe_text} mealName={meal.name} />
      )}

      {/* PDF Download */}
      <div className="card overflow-hidden mb-6">
        <div className="section-header-bar">Source PDF</div>
        <div className="p-6">
          <p className="text-[var(--text-muted)] mb-4">
            This recipe is from the {phase?.name} Week {meal.week} nutrition guide, page {meal.page}.
          </p>
          {pdf?.pdf_url ? (
            <a
              href={pdf.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download PDF
            </a>
          ) : (
            <p className="text-[var(--text-muted)] italic">PDF not yet uploaded</p>
          )}
        </div>
      </div>

      {/* Related Meals */}
      {meal.other_meal_plans && (
        <div className="card overflow-hidden mb-6">
          <div className="section-header-bar">Also Appears In</div>
          <div className="p-6">
            <p className="text-[var(--text-muted)]">
              This meal also appears in: {meal.other_meal_plans}
            </p>
          </div>
        </div>
      )}

      {/* Back Link */}
      <div className="mt-8">
        <Link
          href="/browse"
          className="link-primary inline-flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Browse
        </Link>
      </div>
    </div>
  );
}

function RecipeDisplay({ recipeText, mealName }: { recipeText: string; mealName: string }) {
  const formatted = formatRecipeForDisplay(recipeText, mealName);

  // If formatting fails or returns empty, show raw text with basic cleanup
  if (!formatted || (formatted.ingredients.length === 0 && formatted.instructions.length === 0)) {
    return (
      <div className="card overflow-hidden mb-8">
        <div className="section-header-bar">Recipe</div>
        <div className="p-6">
          <p className="whitespace-pre-wrap text-[var(--scandi-charcoal)] leading-relaxed">{recipeText}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden mb-8">
      <div className="section-header-bar">Recipe</div>

      {/* Two-Column Layout */}
      <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[var(--border-subtle)]">
        {/* Ingredients Column */}
        {formatted.ingredients.length > 0 && (
          <div className="p-6">
            <h3 className="label-uppercase mb-4 pb-2 border-b border-[var(--border-subtle)]">
              Ingredients
            </h3>
            <ul className="space-y-3">
              {formatted.ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-start gap-3 text-[var(--scandi-charcoal)]">
                  <input
                    type="checkbox"
                    className="checkbox-ingredient mt-0.5"
                    aria-label={`Mark ${ingredient} as gathered`}
                  />
                  <span className="text-sm leading-relaxed">{ingredient}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Instructions Column */}
        {formatted.instructions.length > 0 && (
          <div className="p-6">
            <h3 className="label-uppercase mb-4 pb-2 border-b border-[var(--border-subtle)]">
              Instructions
            </h3>
            <ol className="space-y-4">
              {formatted.instructions.map((instruction, index) => (
                <li key={index} className="flex items-start gap-3 text-[var(--scandi-charcoal)]">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--ajenda-blue)] text-white text-xs flex items-center justify-center font-semibold">
                    {index + 1}
                  </span>
                  <span className="text-sm leading-relaxed pt-0.5">{instruction}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
