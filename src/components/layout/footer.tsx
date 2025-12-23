import Link from "next/link";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Search", href: "/search" },
  { name: "Browse", href: "/browse" },
  { name: "PDFs", href: "/pdfs" },
  { name: "About", href: "/about" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[var(--scandi-charcoal)] text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Top Section - Logo & Nav */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8 pb-8 border-b border-white/20">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-[var(--ajenda-red)] flex items-center justify-center bg-white">
              <span className="font-serif text-[8px] font-bold tracking-wide text-[var(--ajenda-red)]">
                AJENDA
              </span>
            </div>
            <span className="font-serif italic text-lg">Meal Navigator</span>
          </div>

          {/* Navigation */}
          <nav className="flex flex-wrap gap-4 sm:gap-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm text-white/70 hover:text-white transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Disclaimer */}
        <div className="mb-8 text-sm text-white/60 max-w-3xl">
          <p className="mb-2">
            This website was created as a helpful tool by a fan of Dr. Jen Ashton&apos;s
            Ajenda Wellness Experiment. This site is in no way affiliated with Dr. Jen
            Ashton or Ajenda.
          </p>
          <p>
            For recipes and health guidance, please defer to Dr. Ashton&apos;s official
            documentation always.
          </p>
        </div>

        {/* Bottom Section - Credits & Year */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-sm text-white/50">
          <p>Made by Screendoor Studio Inc.</p>
          <p>&copy; {currentYear} All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
