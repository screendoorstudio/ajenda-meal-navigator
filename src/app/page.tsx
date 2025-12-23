import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-12">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
          <span style={{ color: 'var(--ajenda-red)' }}>AJENDA</span>{" "}
          <span className="text-gray-900">Meal Navigator</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          Search and browse Dr. Jen Ashton&apos;s 8-Week Wellness Experiment meal plans
          by ingredients, nutritional values, and more.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/search"
            className="btn-primary text-lg px-6 py-3"
          >
            Search by Ingredients
          </Link>
          <Link
            href="/browse"
            className="bg-gray-100 text-gray-900 px-6 py-3 rounded-md font-medium hover:bg-gray-200 transition-colors text-lg"
          >
            Browse All Meals
          </Link>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-6 text-center">
          <div className="text-3xl font-bold" style={{ color: 'var(--ajenda-red)' }}>600+</div>
          <div className="text-gray-600">Recipes</div>
        </div>
        <div className="card p-6 text-center">
          <div className="text-3xl font-bold" style={{ color: 'var(--ajenda-red)' }}>42</div>
          <div className="text-gray-600">Weekly PDFs</div>
        </div>
        <div className="card p-6 text-center">
          <div className="text-3xl font-bold" style={{ color: 'var(--ajenda-red)' }}>10</div>
          <div className="text-gray-600">Months</div>
        </div>
        <div className="card p-6 text-center">
          <div className="text-3xl font-bold" style={{ color: 'var(--ajenda-red)' }}>4</div>
          <div className="text-gray-600">Meal Types</div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="grid md:grid-cols-3 gap-6">
        <Link href="/search" className="card p-6 hover:shadow-md transition-shadow group">
          <div className="text-2xl mb-3">🔍</div>
          <h3 className="text-lg font-semibold mb-2 group-hover:text-[var(--ajenda-red)]">
            Ingredient Search
          </h3>
          <p className="text-gray-600">
            Type in ingredients you have on hand and find matching recipes instantly.
          </p>
        </Link>

        <Link href="/browse" className="card p-6 hover:shadow-md transition-shadow group">
          <div className="text-2xl mb-3">📋</div>
          <h3 className="text-lg font-semibold mb-2 group-hover:text-[var(--ajenda-red)]">
            Browse & Filter
          </h3>
          <p className="text-gray-600">
            Filter by meal type, phase, calories, protein, fiber, and plan type.
          </p>
        </Link>

        <Link href="/pdfs" className="card p-6 hover:shadow-md transition-shadow group">
          <div className="text-2xl mb-3">📄</div>
          <h3 className="text-lg font-semibold mb-2 group-hover:text-[var(--ajenda-red)]">
            Download PDFs
          </h3>
          <p className="text-gray-600">
            Access and download any of the 42 weekly nutrition guides.
          </p>
        </Link>
      </section>

      {/* Plan Types Section */}
      <section className="card p-6">
        <h2 className="text-xl font-semibold mb-4">Special Plan Types</h2>
        <div className="flex flex-wrap gap-3">
          <span className="badge bg-purple-100 text-purple-800">Autophagy</span>
          <span className="badge bg-blue-100 text-blue-800">Liquid-Only</span>
          <span className="badge bg-green-100 text-green-800">Weight Adjustable</span>
          <span className="badge bg-orange-100 text-orange-800">High Protein</span>
          <span className="badge bg-yellow-100 text-yellow-800">Low Calorie</span>
        </div>
        <p className="text-gray-600 mt-4">
          The Ajenda program includes specialized meal plans for different wellness goals.
          Use filters to find meals that match your current phase and dietary needs.
        </p>
      </section>
    </div>
  );
}
