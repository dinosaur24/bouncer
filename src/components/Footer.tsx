"use client";

import Link from "next/link";

const footerColumns = [
  {
    title: "Product",
    links: [
      { label: "Pricing", href: "/pricing" },
      { label: "Docs", href: "/dashboard/settings/docs" },
    ],
    desktopLinks: [
      { label: "Pricing", href: "/pricing" },
      { label: "Docs", href: "/dashboard/settings/docs" },
      { label: "API", href: "/dashboard/settings/api" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Blog", href: "#" },
    ],
    desktopLinks: [
      { label: "About", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Changelog", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
    ],
    desktopLinks: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border px-5 py-8 md:px-12 md:py-12 flex flex-col gap-8 md:gap-12">
      <div className="flex flex-col md:flex-row md:justify-between gap-8 md:gap-0">
        {/* Brand */}
        <div className="flex items-center gap-2.5 md:flex-col md:items-start md:gap-3 md:w-[300px]">
          <div className="flex items-center gap-2.5 md:gap-3">
            <div className="w-[18px] h-[18px] md:w-5 md:h-5 bg-brand" />
            <span className="font-heading text-base md:text-lg font-semibold text-dark">
              Bouncer
            </span>
          </div>
          <p className="hidden md:block text-[13px] text-gray">
            Real-time multi-signal lead validation
          </p>
        </div>

        {/* Columns */}
        <div className="flex gap-8 md:gap-20">
          {footerColumns.map((col) => (
            <div key={col.title} className="flex flex-col gap-2.5 md:gap-3 flex-1 md:flex-none">
              <span className="font-heading text-xs md:text-[13px] font-semibold text-dark">
                {col.title}
              </span>
              {/* Mobile links */}
              {col.links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="md:hidden text-xs text-gray hover:text-dark transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              {/* Desktop links */}
              {col.desktopLinks.map((link) => (
                <Link
                  key={`d-${link.label}`}
                  href={link.href}
                  className="hidden md:block text-[13px] text-gray hover:text-dark transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border pt-3 md:pt-4 flex justify-center">
        <span className="text-[11px] md:text-[13px] text-light-gray">
          © 2026 Bouncer
          <span className="hidden md:inline">. All rights reserved</span>.
        </span>
      </div>
    </footer>
  );
}
