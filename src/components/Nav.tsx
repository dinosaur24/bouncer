"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Pricing", href: "/pricing" },
  { label: "Docs", href: "/dashboard/settings/docs" },
  { label: "Blog", href: "#" },
];

const primaryButtonClasses =
  "bg-dark text-white font-heading text-[13px] font-medium px-5 py-2.5 cursor-pointer hover:bg-dark/90 transition-colors inline-block text-center";

export function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="border-b border-border">
      <div className="flex items-center justify-between px-5 py-3 md:px-12 md:py-4">
        {/* Logo */}
        <div className="flex items-center gap-2.5 md:gap-3">
          <div className="w-5 h-5 md:w-6 md:h-6 bg-brand" />
          <span className="font-heading text-base md:text-lg font-semibold text-dark">
            Bouncer
          </span>
        </div>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="font-heading text-sm text-gray hover:text-dark transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop right */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/login"
            className="font-heading text-sm text-gray hover:text-dark transition-colors"
          >
            Login
          </Link>
          <Link href="/signup" className={primaryButtonClasses}>
            Start for free
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden cursor-pointer"
          aria-label="Toggle menu"
        >
          {menuOpen ? (
            <X size={24} className="text-dark" />
          ) : (
            <Menu size={24} className="text-dark" />
          )}
        </button>
      </div>

      {/* Mobile menu panel */}
      {menuOpen && (
        <div className="md:hidden border-t border-border px-5 py-4 flex flex-col gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="font-heading text-sm text-gray hover:text-dark transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <div className="border-t border-border pt-4 flex flex-col gap-3">
            <Link
              href="/login"
              className="font-heading text-sm text-gray hover:text-dark transition-colors"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className={`${primaryButtonClasses} w-full`}
            >
              Start for free
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
