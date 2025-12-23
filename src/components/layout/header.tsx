"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Search", href: "/search" },
  { name: "Browse", href: "/browse" },
  { name: "PDFs", href: "/pdfs" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="bg-[var(--scandi-linen)] border-b border-[var(--border-strong)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-4 group">
            {/* Circular Ajenda Logo */}
            <div className="ajenda-logo w-12 h-12 sm:w-14 sm:h-14 rounded-full border-[2.5px] border-[var(--ajenda-red)] flex items-center justify-center bg-white group-hover:bg-[var(--ajenda-red-light)] transition-colors">
              <span className="font-serif text-[10px] sm:text-xs font-bold tracking-wide text-[var(--ajenda-red)]">
                AJENDA
              </span>
            </div>

            {/* Title & Subhead */}
            <div className="hidden sm:flex flex-col">
              <span className="text-[10px] font-medium tracking-widest text-[var(--ajenda-red)] uppercase">
                The Wellness Experiment
              </span>
              <span className="heading-serif text-xl text-[var(--scandi-charcoal)]">
                Meal Navigator
              </span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex gap-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-4 py-2 text-sm font-medium transition-all border-b-2 ${
                    isActive
                      ? "border-[var(--ajenda-red)] text-[var(--scandi-charcoal)]"
                      : "border-transparent text-[var(--text-muted)] hover:text-[var(--scandi-charcoal)] hover:border-[var(--scandi-oak)]"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
