"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const navLinks = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Pricing", href: "/pricing" },
  { label: "Docs", href: "/dashboard/settings/docs" },
  { label: "Blog", href: "#" },
];

const primaryButtonClasses =
  "bg-dark text-white font-heading text-[13px] font-medium px-5 py-2.5 rounded-lg cursor-pointer hover:bg-dark/90 transition-colors inline-block text-center";

export function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);

  // AuthProvider wraps the entire app in root layout, so this should always work
  const { user, isAuthenticated, logout } = useAuth();

  const userInitial = user?.firstName
    ? user.firstName[0].toUpperCase()
    : user?.email
      ? user.email[0].toUpperCase()
      : "U";

  return (
    <nav className="border-b border-border">
      <div className="flex items-center justify-between px-5 py-3 md:px-12 md:py-4">
        {/* Logo */}
        <div className="flex items-center gap-2.5 md:gap-3">
          <div className="w-5 h-5 md:w-6 md:h-6 bg-brand rounded-md" />
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
          {isAuthenticated ? (
            <>
              <Link
                href="/dashboard"
                className="font-heading text-sm text-gray hover:text-dark transition-colors"
              >
                Dashboard
              </Link>
              <button
                onClick={logout}
                className="font-heading text-sm text-gray hover:text-dark transition-colors cursor-pointer"
              >
                Log out
              </button>
              <Link
                href="/dashboard"
                className="w-8 h-8 bg-dark rounded-lg flex items-center justify-center"
              >
                <span className="text-white font-heading text-[13px] font-medium">
                  {userInitial}
                </span>
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="font-heading text-sm text-gray hover:text-dark transition-colors"
              >
                Login
              </Link>
              <Link href="/signup" className={primaryButtonClasses}>
                Start for free
              </Link>
            </>
          )}
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
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className="font-heading text-sm text-gray hover:text-dark transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                  }}
                  className="font-heading text-sm text-gray hover:text-dark transition-colors text-left cursor-pointer"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
