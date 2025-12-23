export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="heading-serif text-3xl sm:text-4xl mb-3 not-italic font-semibold text-[var(--scandi-charcoal)]">
          About
        </h1>
      </div>

      <div className="card overflow-hidden">
        <div className="section-header-bar">Disclaimer</div>
        <div className="p-6 space-y-4">
          <p className="text-[var(--scandi-charcoal)] leading-relaxed">
            This website was created as a helpful tool by a fan of <a href="https://www.joinajenda.com/" target="_blank" rel="noopener noreferrer" className="text-[var(--ajenda-red)] hover:underline">Dr. Jen Ashton&apos;s
            Ajenda Wellness Experiment</a>.
          </p>
          <p className="text-[var(--scandi-charcoal)] leading-relaxed font-medium">
            This site is in no way affiliated with Dr. Jen Ashton or Ajenda.
          </p>
          <p className="text-[var(--scandi-charcoal)] leading-relaxed">
            For recipes and health guidance, please defer to Dr. Ashton&apos;s official
            documentation always.
          </p>
        </div>
      </div>
    </div>
  );
}
