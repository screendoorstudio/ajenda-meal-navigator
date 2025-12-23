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
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <span
              className="text-2xl font-bold tracking-tight transition-colors group-hover:opacity-90"
              style={{ color: 'var(--ajenda-red)' }}
            >
              AJENDA
            </span>
            <span className="hidden sm:block">
              <span className="text-[var(--scandi-oak)]">|</span>
              <span className="heading-serif text-base ml-3 text-[var(--text-muted)]">
                Meal Navigator
              </span>
            </span>
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
