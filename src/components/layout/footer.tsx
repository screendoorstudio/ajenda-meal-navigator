import Link from "next/link";
import Image from "next/image";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Search", href: "/search" },
  { name: "Browse", href: "/browse" },
  { name: "PDFs", href: "/pdfs" },
  { name: "About", href: "/about" },
];

export default function Footer() {
  return (
    <footer className="bg-[var(--scandi-charcoal)] text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Top Section - Logo & Nav */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8 pb-8 border-b border-white/20">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Image
              src="/ajenda-ajent-logo-white.png"
              alt="Ajenda Ajent"
              width={40}
              height={40}
              className="w-10 h-10"
            />
            <span className="font-serif italic text-lg">Ajenda Ajent</span>
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
        <div className="mb-8 text-sm text-white/60 max-w-3xl space-y-4">
          <p>
            This website was created as a helpful tool by a fan of <a href="https://www.joinajenda.com/" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white underline">Dr. Jen Ashton&apos;s
            Ajenda Wellness Experiment</a>. This site is in no way affiliated with Dr. Jen
            Ashton or Ajenda.
          </p>
          <p>
            For recipes and health guidance, please defer to Dr. Ashton&apos;s official
            documentation always.
          </p>
          <p className="text-white/50 text-xs">
            Nutritional counts are approximate. This plan is informational only and not medical advice.
            Consult a healthcare professional before changing your diet—especially if you&apos;re pregnant,
            under 18, on GLP-1, or taking blood thinners, or if you have other health concerns.
            If you take blood thinners, please discuss your intake of vitamin K–rich foods
            (such as leafy greens) with your doctor.
          </p>
        </div>

        {/* Bottom Section - Credits & Year */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-sm text-white/50">
          <p>Made by <a href="https://screendoorstudio.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Screendoor Studio Inc.</a></p>
          <p>&copy; 2026 All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
