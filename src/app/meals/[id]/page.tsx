import { createClient } from "@/lib/supabase/server";
import { PHASES } from "@/lib/constants";
import Link from "next/link";
import { notFound } from "next/navigation";

interface MealPageProps {
  params: Promise<{ id: string }>;
}

export default async function MealPage({ params }: MealPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch meal
  const { data: meal, error } = await supabase
    .from('meals')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !meal) {
    notFound();
  }

  // Fetch PDF for this meal
  const { data: pdf } = await supabase
    .from('weekly_pdfs')
    .select('pdf_url')
    .eq('phase_id', meal.phase_id)
    .eq('week_number', meal.week)
    .single();

  const phase = PHASES.find(p => p.id === meal.phase_id);

  return (
    <div className="max-w-3xl mx-auto">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <ol className="flex items-center gap-2 text-sm text-gray-500">
          <li>
            <Link href="/browse" className="hover:text-[var(--ajenda-red)]">
              Browse
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link
              href={`/browse?phase=${meal.phase_id}`}
              className="hover:text-[var(--ajenda-red)]"
            >
              {phase?.name || meal.phase_id}
            </Link>
          </li>
          <li>/</li>
          <li className="text-gray-900 font-medium truncate">{meal.name}</li>
        </ol>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            {meal.meal_type}
          </span>
          {meal.plan_type && (
            <span className={`badge ${getPlanTypeBadgeClass(meal.plan_type)}`}>
              {meal.plan_type}
            </span>
          )}
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{meal.name}</h1>
        <p className="text-gray-600">
          {phase?.name} • Week {meal.week} • Day {meal.day} • Page {meal.page}
        </p>
      </div>

      {/* Nutritional Info */}
      <div className="card p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Nutrition Facts</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-800">
              {meal.calories || '—'}
            </div>
            <div className="text-sm text-yellow-700">Calories</div>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-800">
              {meal.protein_g ? `${meal.protein_g}g` : '—'}
            </div>
            <div className="text-sm text-blue-700">Protein</div>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-800">
              {meal.fiber_g ? `${meal.fiber_g}g` : '—'}
            </div>
            <div className="text-sm text-green-700">Fiber</div>
          </div>
        </div>
      </div>

      {/* Recipe */}
      {meal.recipe_text && (
        <div className="card p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recipe</h2>
          <div className="prose prose-gray max-w-none">
            <p className="whitespace-pre-wrap">{meal.recipe_text}</p>
          </div>
        </div>
      )}

      {/* PDF Download */}
      <div className="card p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Source PDF</h2>
        <p className="text-gray-600 mb-4">
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
          <p className="text-gray-500 italic">PDF not yet uploaded</p>
        )}
      </div>

      {/* Related Meals */}
      {meal.other_meal_plans && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Also Appears In</h2>
          <p className="text-gray-600">
            This meal also appears in: {meal.other_meal_plans}
          </p>
        </div>
      )}

      {/* Back Link */}
      <div className="mt-8">
        <Link
          href="/browse"
          className="text-[var(--ajenda-red)] hover:underline inline-flex items-center gap-1"
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
