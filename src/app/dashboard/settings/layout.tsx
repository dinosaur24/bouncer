"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  Users,
  CreditCard,
  Code,
  Sliders,
  Terminal,
  BookOpen,
} from "lucide-react";

const settingsNav = [
  { label: "Profile", href: "/dashboard/settings", icon: User },
  { label: "Team", href: "/dashboard/settings/team", icon: Users },
  { label: "Billing", href: "/dashboard/settings/billing", icon: CreditCard },
  { label: "API & Webhooks", href: "/dashboard/settings/api", icon: Code },
  { label: "Scoring Thresholds", href: "/dashboard/settings/scoring", icon: Sliders },
  { label: "Snippet Install", href: "/dashboard/settings/snippet", icon: Terminal },
  { label: "Documentation", href: "/dashboard/settings/docs", icon: BookOpen },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col md:flex-row gap-0 md:gap-12">
      {/* Settings sub-nav — mobile: horizontal scroll */}
      <nav className="md:hidden flex items-center gap-1 overflow-x-auto pb-4 -mx-5 px-5 border-b border-border mb-6">
        {settingsNav.map((item) => {
          const isActive =
            item.href === "/dashboard/settings"
              ? pathname === "/dashboard/settings"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-heading whitespace-nowrap rounded-lg transition-colors ${
                isActive
                  ? "bg-dark text-white font-medium"
                  : "text-gray hover:bg-surface"
              }`}
            >
              <item.icon size={14} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Settings sub-nav — desktop: vertical sidebar */}
      <nav className="hidden md:flex flex-col w-[200px] shrink-0">
        {settingsNav.map((item) => {
          const isActive =
            item.href === "/dashboard/settings"
              ? pathname === "/dashboard/settings"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 py-2.5 text-[13px] font-heading transition-colors ${
                isActive
                  ? "font-medium text-dark"
                  : "font-normal text-gray hover:text-dark"
              }`}
            >
              <item.icon size={16} className={isActive ? "text-dark" : "text-gray"} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col gap-8 md:gap-12">
        {children}
      </div>
    </div>
  );
}
