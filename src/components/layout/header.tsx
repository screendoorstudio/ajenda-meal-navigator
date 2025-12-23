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
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span
              className="text-2xl font-bold tracking-tight"
              style={{ color: 'var(--ajenda-red)' }}
            >
              AJENDA
            </span>
            <span className="text-sm text-gray-500 hidden sm:block">
              Meal Navigator
            </span>
          </Link>

          {/* Navigation */}
          <nav className="flex gap-1 sm:gap-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
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
