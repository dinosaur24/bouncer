"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HelpCircle,
  LayoutGrid,
  FileText,
  BarChart3,
  Layers,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { ToastProvider } from "@/components/Toast";
import { ValidationProvider } from "@/contexts/ValidationContext";
import { BillingProvider } from "@/contexts/BillingContext";
import { IntegrationProvider } from "@/contexts/IntegrationContext";
import { TeamProvider } from "@/contexts/TeamContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { SourcesProvider } from "@/contexts/SourcesContext";
import { useAuth } from "@/contexts/AuthContext";
import { useBilling } from "@/contexts/BillingContext";

const navItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutGrid },
  { label: "Validations", href: "/dashboard/validations", icon: FileText },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "Sources", href: "/dashboard/sources", icon: Layers },
  { label: "Integrations", href: "/dashboard/integrations", icon: Layers },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

const mobileBottomNav = [
  { label: "Overview", href: "/dashboard", icon: LayoutGrid },
  { label: "Log", href: "/dashboard/validations", icon: FileText },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "Sources", href: "/dashboard/sources", icon: Layers },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dismissedBanner, setDismissedBanner] = useState(false);
  const { user } = useAuth();
  const { usage, currentPlan, isNearLimit } = useBilling();

  const isNavActive = (href: string) =>
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(href);

  const displayName = user?.full_name || user?.email || 'User';
  const initials = user?.full_name
    ? user.full_name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()
    : user?.email ? user.email[0].toUpperCase() : 'U';
  const planLabel = user?.plan ? user.plan.charAt(0).toUpperCase() + user.plan.slice(1) + ' Plan' : 'Free Plan';

  const isOnScalePlan = user?.plan === 'scale';
  const nextTierLabel = user?.plan === 'free' ? 'Starter' : user?.plan === 'starter' ? 'Growth' : user?.plan === 'growth' ? 'Scale' : null;

  return (
    <div className="flex flex-col md:flex-row h-screen bg-white">
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between px-5 py-3 border-b border-border">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="cursor-pointer"
        >
          {mobileMenuOpen ? (
            <X size={22} className="text-dark" />
          ) : (
            <Menu size={22} className="text-dark" />
          )}
        </button>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-brand rounded-md" />
          <span className="font-heading text-base font-semibold text-dark">
            Bouncer
          </span>
        </div>
        <div className="w-8 h-8 bg-dark rounded-lg flex items-center justify-center">
          <span className="text-white font-heading text-[11px] font-medium">
            {initials}
          </span>
        </div>
      </div>

      {/* Mobile slide-out menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border px-5 py-4 flex flex-col gap-1 bg-white">
          {navItems.map((item) => {
            const active = isNavActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 py-2.5 px-2 ${
                  active ? "text-dark font-medium" : "text-gray"
                }`}
              >
                <item.icon size={18} />
                <span className="font-heading text-sm">{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-60 shrink-0 border-r border-border flex-col justify-between p-8">
        {/* Top */}
        <div className="flex flex-col gap-12">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-brand rounded-md" />
            <span className="font-heading text-lg font-semibold text-dark">
              Bouncer
            </span>
          </div>

          {/* Nav */}
          <nav className="flex flex-col">
            {navItems.map((item) => {
              const isActive = isNavActive(item.href);

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
          <div className="bg-surface p-5 flex flex-col gap-4 rounded-lg">
            {/* Usage indicator */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-gray font-heading">
                  Validations used
                </span>
                <span className="text-[11px] text-gray font-heading">
                  {usage.percentage}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-white/60 overflow-hidden">
                <div
                  className={`h-full ${usage.percentage > 90 ? "bg-brand" : "bg-dark"}`}
                  style={{ width: `${Math.min(usage.percentage, 100)}%` }}
                />
              </div>
              <span className="text-[10px] text-gray">
                {usage.used.toLocaleString()} / {usage.limit >= 999999 ? "Unlimited" : usage.limit.toLocaleString()}
              </span>
            </div>

            {nextTierLabel && (
              <>
                <span className="font-heading text-[13px] font-semibold text-dark">
                  Upgrade to {nextTierLabel}
                </span>
                <p className="text-xs text-gray leading-relaxed">
                  {user?.plan === 'free'
                    ? 'Get 2,500 validations and all 4 signals.'
                    : user?.plan === 'starter'
                      ? 'Unlock unlimited CRM integrations and 15K validations.'
                      : 'Get unlimited validations and API access.'}
                </p>
                <Link
                  href="/dashboard/settings/billing"
                  className="bg-brand text-white font-heading text-xs font-medium px-4 py-2.5 cursor-pointer hover:bg-brand/90 transition-colors w-full text-center rounded-lg"
                >
                  Upgrade
                </Link>
              </>
            )}

            {isOnScalePlan && (
              <span className="font-heading text-[13px] font-semibold text-dark">
                Scale Plan — Unlimited
              </span>
            )}
          </div>

          {/* User */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-dark rounded-lg flex items-center justify-center">
                <span className="text-white font-heading text-[13px] font-medium">
                  {initials}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-heading text-[13px] font-medium text-dark">
                  {displayName}
                </span>
                <span className="text-xs text-gray">{planLabel}</span>
              </div>
            </div>
            <HelpCircle size={18} className="text-[#CCCCCC]" />
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto flex flex-col pb-20 md:pb-0">
        {isNearLimit && !dismissedBanner && (
          <div className="mx-4 mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between">
            <p className="text-sm text-amber-800">
              You&apos;ve used {usage.used.toLocaleString()} of {usage.limit.toLocaleString()} validations this month.
            </p>
            <div className="flex items-center gap-2">
              <Link href="/dashboard/settings/billing" className="text-sm font-medium text-brand hover:underline">Upgrade</Link>
              <button onClick={() => setDismissedBanner(true)} className="text-amber-400 hover:text-amber-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
        <div className="flex-1 p-5 md:p-10 flex flex-col gap-8 md:gap-12">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border flex items-center justify-around py-2.5 pb-5 z-50">
        {mobileBottomNav.map((item) => {
          const active = isNavActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-3 ${
                active ? "text-brand" : "text-gray"
              }`}
            >
              <item.icon size={20} />
              <span className="text-[10px] font-heading font-medium">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <BillingProvider>
      <IntegrationProvider>
        <TeamProvider>
          <SettingsProvider>
            <SourcesProvider>
              <ValidationProvider>
                <ToastProvider>
                  <DashboardLayoutInner>{children}</DashboardLayoutInner>
                </ToastProvider>
              </ValidationProvider>
            </SourcesProvider>
          </SettingsProvider>
        </TeamProvider>
      </IntegrationProvider>
    </BillingProvider>
  );
}
