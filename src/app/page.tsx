import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-12 px-4">
        {/* Ajenda Ajent Logo */}
        <Image
          src="/ajenda-ajent-logo.png"
          alt="Ajenda Ajent"
          width={96}
          height={96}
          className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6"
        />

        {/* Subhead */}
        <a href="https://www.joinajenda.com/" target="_blank" rel="noopener noreferrer" className="inline-block text-xs sm:text-sm font-medium tracking-[0.2em] text-[var(--ajenda-red)] uppercase mb-4 hover:underline">
          The Wellness Experiment
        </a>

        {/* Main Title - Elegant Serif */}
        <h1 className="heading-serif text-4xl sm:text-5xl md:text-6xl text-[var(--scandi-charcoal)] mb-6">
          Ajenda Ajent
        </h1>

        <p className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto mb-10">
          Search and browse <a href="https://www.joinajenda.com/" target="_blank" rel="noopener noreferrer" className="text-[var(--ajenda-red)] hover:underline">Dr. Jen Ashton&apos;s</a> meal plans
          by ingredients, nutritional values, and more.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/search"
            className="btn-primary text-base px-8 py-3"
          >
            Search by Ingredients
          </Link>
          <Link
            href="/browse"
            className="btn-secondary text-base px-8 py-3"
          >
            Browse All Meals
          </Link>
        </div>
      </section>

      {/* Circular Stats - PDF Style */}
      <section className="flex flex-wrap justify-center gap-6 sm:gap-10">
        <div className="callout-circle w-24 h-24 sm:w-28 sm:h-28 nutrition-calories">
          <span className="text-2xl sm:text-3xl font-bold value">600+</span>
          <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Recipes</span>
        </div>
        <div className="callout-circle w-24 h-24 sm:w-28 sm:h-28 nutrition-protein">
          <span className="text-2xl sm:text-3xl font-bold value">42</span>
          <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">PDFs</span>
        </div>
        <div className="callout-circle w-24 h-24 sm:w-28 sm:h-28 nutrition-fiber">
          <span className="text-2xl sm:text-3xl font-bold value">10</span>
          <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Months</span>
        </div>
        <div className="callout-circle w-24 h-24 sm:w-28 sm:h-28" style={{ borderColor: 'var(--ajenda-red)' }}>
          <span className="text-2xl sm:text-3xl font-bold text-[var(--ajenda-red)]">4</span>
          <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Meal Types</span>
        </div>
      </section>

      {/* Feature Cards */}
      <section>
        <h2 className="heading-serif text-2xl text-center mb-8">Explore the Collection</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Link href="/search" className="card overflow-hidden group">
            <div className="section-header-bar">Search</div>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-2 text-[var(--scandi-charcoal)] group-hover:text-[var(--ajenda-red)] transition-colors">
                Ingredient Search
              </h3>
              <p className="text-[var(--text-muted)]">
                Type in ingredients you have on hand and find matching recipes instantly.
              </p>
            </div>
          </Link>

          <Link href="/browse" className="card overflow-hidden group">
            <div className="section-header-bar">Browse</div>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-2 text-[var(--scandi-charcoal)] group-hover:text-[var(--ajenda-red)] transition-colors">
                Browse & Filter
              </h3>
              <p className="text-[var(--text-muted)]">
                Filter by meal type, phase, calories, protein, fiber, and plan type.
              </p>
            </div>
          </Link>

          <Link href="/pdfs" className="card overflow-hidden group">
            <div className="section-header-bar">Download</div>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-2 text-[var(--scandi-charcoal)] group-hover:text-[var(--ajenda-red)] transition-colors">
                Weekly PDFs
              </h3>
              <p className="text-[var(--text-muted)]">
                Access and download any of the 42 weekly nutrition guides.
              </p>
            </div>
          </Link>
        </div>
      </section>

      {/* Plan Types Section */}
      <section className="card overflow-hidden">
        <div className="section-header-bar">Special Plan Types</div>
        <div className="p-6">
          <div className="flex flex-wrap gap-3 mb-4">
            <span className="badge bg-purple-100 text-purple-800">Autophagy</span>
            <span className="badge bg-[var(--ajenda-blue-tint)] text-[var(--ajenda-blue)]">Liquid-Only</span>
            <span className="badge bg-green-100 text-green-800">Weight Adjustable</span>
            <span className="badge bg-orange-100 text-orange-800">High Protein</span>
            <span className="badge bg-amber-100 text-amber-800">Low Calorie</span>
          </div>
          <p className="text-[var(--text-muted)]">
            The Ajenda program includes specialized meal plans for different wellness goals.
            Use filters to find meals that match your current phase and dietary needs.
          </p>
        </div>
      </section>
    </div>
  );
}
