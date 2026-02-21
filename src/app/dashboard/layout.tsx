"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HelpCircle } from "lucide-react";

const navItems = [
  { label: "Overview", href: "/dashboard" },
  { label: "Validations", href: "/dashboard/validations" },
  { label: "Analytics", href: "/dashboard/analytics" },
  { label: "Sources", href: "/dashboard/sources" },
  { label: "Integrations", href: "/dashboard/integrations" },
  { label: "Settings", href: "/dashboard/settings" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-white max-w-[1440px] mx-auto">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 border-r border-border flex flex-col justify-between p-8">
        {/* Top */}
        <div className="flex flex-col gap-12">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-brand" />
            <span className="font-heading text-lg font-semibold text-dark">
              Bouncer
            </span>
          </div>

          {/* Nav */}
          <nav className="flex flex-col">
            {navItems.map((item) => {
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 py-3"
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-none ${isActive ? "bg-brand" : "opacity-0"}`}
                  />
                  <span
                    className={`font-heading text-sm ${
                      isActive
                        ? "font-medium text-dark"
                        : "font-normal text-gray"
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom */}
        <div className="flex flex-col gap-6">
          {/* Upgrade box */}
          <div className="bg-surface p-5 flex flex-col gap-4">
            <span className="font-heading text-[13px] font-semibold text-dark">
              Upgrade to Growth
            </span>
            <p className="text-xs text-gray leading-relaxed">
              Unlock unlimited CRM integrations and 15K validations.
            </p>
            <button className="bg-brand text-white font-heading text-xs font-medium px-4 py-2.5 cursor-pointer hover:bg-brand/90 transition-colors w-full">
              Upgrade
            </button>
          </div>

          {/* User */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-dark flex items-center justify-center">
                <span className="text-white font-heading text-[13px] font-medium">
                  SM
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-heading text-[13px] font-medium text-dark">
                  Sara Martinez
                </span>
                <span className="text-xs text-gray">Starter Plan</span>
              </div>
            </div>
            <HelpCircle size={18} className="text-[#CCCCCC]" />
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-10 flex flex-col gap-12">
        {children}
      </main>
    </div>
  );
}
