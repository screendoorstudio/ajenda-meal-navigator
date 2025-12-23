"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Search", href: "/search" },
  { name: "Browse", href: "/browse" },
  { name: "PDFs", href: "/pdfs" },
  { name: "About", href: "/about" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="bg-[var(--scandi-linen)] border-b border-[var(--border-strong)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-4 group">
            {/* Ajenda Ajent Logo */}
            <Image
              src="/ajenda-ajent-logo.png"
              alt="Ajenda Ajent"
              width={56}
              height={56}
              className="w-12 h-12 sm:w-14 sm:h-14 group-hover:scale-105 transition-transform"
            />

            {/* Title & Subhead */}
            <div className="hidden sm:flex flex-col">
              <span className="text-[10px] font-medium tracking-widest text-[var(--ajenda-red)] uppercase">
                The Wellness Experiment
              </span>
              <span className="heading-serif text-xl text-[var(--scandi-charcoal)]">
                Ajenda Ajent
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
