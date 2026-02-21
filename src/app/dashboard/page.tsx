"use client";

import { useState } from "react";
import Link from "next/link";
import { TrendingUp, Mail, Phone, Globe, Building2, Download } from "lucide-react";
import { useToast } from "@/components/Toast";
import {
  ValidationDrawer,
  type ValidationDetail,
} from "@/components/ValidationDrawer";

const metrics = [
  {
    label: "Validations today",
    value: "1,247",
    change: "+12.5% vs yesterday",
  },
  {
    label: "This month",
    value: "18,432",
    change: "+8.2% vs last month",
  },
  {
    label: "Pass rate",
    value: "84.6%",
    change: "+2.1% improvement",
  },
  {
    label: "Avg score",
    value: "72.3",
    change: "+3.4 vs last week",
  },
];

const chartData = [
  { day: "Mon", passed: 120, borderline: 30, rejected: 20 },
  { day: "Tue", passed: 150, borderline: 25, rejected: 15 },
  { day: "Wed", passed: 100, borderline: 40, rejected: 30 },
  { day: "Thu", passed: 170, borderline: 20, rejected: 10 },
  { day: "Fri", passed: 140, borderline: 35, rejected: 25 },
  { day: "Sat", passed: 80, borderline: 15, rejected: 10 },
  { day: "Sun", passed: 60, borderline: 10, rejected: 8 },
];

const maxTotal = Math.max(
  ...chartData.map((d) => d.passed + d.borderline + d.rejected)
);

const recentValidations = [
  {
    color: "#22C55E",
    email: "sarah@techcorp.io",
    meta: "2 min ago · Email + Phone",
    score: 92,
    scoreBg: "#F0FDF4",
    scoreColor: "#22C55E",
  },
  {
    color: "#F59E0B",
    email: "j.miller@startup.co",
    meta: "5 min ago · Email only",
    score: 54,
    scoreBg: "#FFFBEB",
    scoreColor: "#F59E0B",
  },
  {
    color: "#E42313",
    email: "test123@mailinator.com",
    meta: "8 min ago · All signals",
    score: 18,
    scoreBg: "#FEF2F2",
    scoreColor: "#E42313",
  },
  {
    color: "#22C55E",
    email: "anna.chen@enterprise.com",
    meta: "12 min ago · Email + IP",
    score: 87,
    scoreBg: "#F0FDF4",
    scoreColor: "#22C55E",
  },
  {
    color: "#22C55E",
    email: "mark@agency.io",
    meta: "15 min ago · Phone + Domain",
    score: 78,
    scoreBg: "#F0FDF4",
    scoreColor: "#22C55E",
  },
];

const validationDetails: Record<string, ValidationDetail> = {
  "sarah@techcorp.io": {
    email: "sarah@techcorp.io",
    status: "Passed",
    score: 92,
    source: "Contact Form",
    time: "2 min ago",
    ip: "192.168.1.42",
    phone: "+1 (555) 234-5678",
    company: "TechCorp Inc.",
    signals: [
      { name: "Email", icon: Mail, status: "pass", label: "Valid business email", detail: "Corporate domain verified" },
      { name: "Phone", icon: Phone, status: "pass", label: "Valid US mobile", detail: "Number format confirmed" },
      { name: "IP", icon: Globe, status: "pass", label: "Clean residential IP", detail: "No suspicious activity" },
      { name: "Domain", icon: Building2, status: "pass", label: "Established company domain", detail: "Domain registered 8+ years" },
    ],
  },
  "j.miller@startup.co": {
    email: "j.miller@startup.co",
    status: "Borderline",
    score: 54,
    source: "API",
    time: "5 min ago",
    ip: "10.0.0.88",
    phone: "+1 (555) 876-5432",
    company: "Startup Co.",
    signals: [
      { name: "Email", icon: Mail, status: "warn", label: "Recently registered domain", detail: "Domain created within last year" },
      { name: "Phone", icon: Phone, status: "pass", label: "Valid number", detail: "Number format confirmed" },
      { name: "IP", icon: Globe, status: "warn", label: "VPN detected", detail: "Connection routed through VPN" },
      { name: "Domain", icon: Building2, status: "warn", label: "Domain age < 6 months", detail: "New domain registration" },
    ],
  },
  "test123@mailinator.com": {
    email: "test123@mailinator.com",
    status: "Rejected",
    score: 18,
    source: "Newsletter",
    time: "8 min ago",
    ip: "203.0.113.42",
    phone: "+44 000 000",
    company: "Unknown",
    signals: [
      { name: "Email", icon: Mail, status: "fail", label: "Disposable email provider", detail: "Known throwaway domain" },
      { name: "Phone", icon: Phone, status: "fail", label: "Invalid number format", detail: "Number does not match any region" },
      { name: "IP", icon: Globe, status: "fail", label: "Known spam IP", detail: "Listed on multiple blocklists" },
      { name: "Domain", icon: Building2, status: "fail", label: "Blacklisted domain", detail: "Domain flagged for abuse" },
    ],
  },
  "anna.chen@enterprise.com": {
    email: "anna.chen@enterprise.com",
    status: "Passed",
    score: 87,
    source: "Demo Request",
    time: "12 min ago",
    ip: "172.16.0.5",
    phone: "+1 (555) 345-6789",
    company: "Enterprise Inc.",
    signals: [
      { name: "Email", icon: Mail, status: "pass", label: "Valid corporate email", detail: "Enterprise email domain" },
      { name: "Phone", icon: Phone, status: "pass", label: "Valid number", detail: "Number format confirmed" },
      { name: "IP", icon: Globe, status: "pass", label: "Enterprise IP range", detail: "Corporate network detected" },
      { name: "Domain", icon: Building2, status: "pass", label: "Fortune 500 company", detail: "Top-tier enterprise domain" },
    ],
  },
  "mark@agency.io": {
    email: "mark@agency.io",
    status: "Passed",
    score: 78,
    source: "Contact Form",
    time: "15 min ago",
    ip: "192.168.2.10",
    phone: "+1 (555) 987-6543",
    company: "Agency.io",
    signals: [
      { name: "Email", icon: Mail, status: "pass", label: "Valid email", detail: "Email format verified" },
      { name: "Phone", icon: Phone, status: "pass", label: "Valid mobile", detail: "Mobile number confirmed" },
      { name: "IP", icon: Globe, status: "warn", label: "Shared office IP", detail: "Multiple users on same IP" },
      { name: "Domain", icon: Building2, status: "pass", label: "Verified agency", detail: "Established agency domain" },
    ],
  },
};

export default function DashboardPage() {
  const { addToast } = useToast();
  const [activeDateRange, setActiveDateRange] = useState("Last 30 days");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedValidation, setSelectedValidation] =
    useState<ValidationDetail | null>(null);

  const dateRanges = ["Last 30 days", "Last 7 days", "Custom"];

  const handleOverride = (email: string) => {
    addToast("Lead override accepted — syncing to CRM");
    setDrawerOpen(false);
  };

  const handleExport = () => {
    const headers = ["Email", "Score", "Meta"];
    const rows = recentValidations.map((v) =>
      [v.email, v.score, v.meta].join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "validations.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast("Validation data exported");
  };

  return (
    <>
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-[40px] font-medium tracking-tight leading-tight">
            Overview
          </h1>
          <p className="text-sm text-gray">
            Track your lead validation performance
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Date picker */}
          <div className="flex items-center">
            {dateRanges.map((range) => (
              <button
                key={range}
                onClick={() => setActiveDateRange(range)}
                className={`font-heading text-[13px] font-medium px-4 py-2.5 cursor-pointer ${
                  activeDateRange === range
                    ? "bg-dark text-white"
                    : "border border-border text-dark bg-white"
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          {/* Export button */}
          <button
            onClick={handleExport}
            className="border border-border font-heading text-[13px] font-medium px-4 py-2.5 text-dark cursor-pointer bg-white hover:bg-surface transition-colors flex items-center gap-2"
          >
            <Download size={14} />
            Export
          </button>

          {/* Add source button */}
          <Link
            href="/dashboard/sources"
            className="bg-dark text-white font-heading text-[13px] font-medium px-4 py-2.5 cursor-pointer hover:bg-dark/90 transition-colors"
          >
            Add source
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <div key={metric.label} className="border border-border p-7">
            <span className="text-[13px] text-gray">{metric.label}</span>
            <div className="font-heading text-4xl font-semibold tracking-tight mt-2">
              {metric.value}
            </div>
            <div className="flex items-center gap-1.5 mt-3 text-green">
              <TrendingUp size={14} />
              <span className="text-[13px]">{metric.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Row */}
      <div className="flex gap-6 flex-1 min-h-0">
        {/* Chart Section */}
        <div className="flex-1 border border-border p-7 flex flex-col">
          {/* Chart Header */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-heading text-lg font-semibold">
              Validation Volume
            </h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-dark" />
                <span className="text-[13px] text-gray">Daily</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: "#22C55E" }}
                />
                <span className="text-[13px] text-gray">Passed</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: "#F59E0B" }}
                />
                <span className="text-[13px] text-gray">Borderline</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: "#E42313" }}
                />
                <span className="text-[13px] text-gray">Rejected</span>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="flex-1 flex items-end gap-6 justify-between">
            {chartData.map((bar) => {
              const total = bar.passed + bar.borderline + bar.rejected;
              const heightPct = (total / maxTotal) * 100;
              const passedPct = (bar.passed / total) * 100;
              const borderlinePct = (bar.borderline / total) * 100;
              const rejectedPct = (bar.rejected / total) * 100;

              return (
                <div
                  key={bar.day}
                  className="flex-1 flex flex-col items-center gap-3"
                >
                  <div
                    className="w-full flex flex-col rounded-sm overflow-hidden"
                    style={{ height: `${heightPct * 2}px` }}
                  >
                    <div
                      style={{
                        backgroundColor: "#22C55E",
                        height: `${passedPct}%`,
                      }}
                    />
                    <div
                      style={{
                        backgroundColor: "#F59E0B",
                        height: `${borderlinePct}%`,
                      }}
                    />
                    <div
                      style={{
                        backgroundColor: "#E42313",
                        height: `${rejectedPct}%`,
                      }}
                    />
                  </div>
                  <span className="text-[13px] text-gray">{bar.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Validations */}
        <div className="w-[420px] border border-border p-6 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading text-lg font-semibold">
              Recent Validations
            </h2>
            <Link
              href="/dashboard/validations"
              className="text-[13px] font-medium text-brand hover:underline"
            >
              View All &rarr;
            </Link>
          </div>

          {/* Validation rows */}
          <div className="flex flex-col gap-4">
            {recentValidations.map((item) => (
              <div
                key={item.email}
                onClick={() => {
                  setSelectedValidation(validationDetails[item.email]);
                  setDrawerOpen(true);
                }}
                className="flex items-center justify-between cursor-pointer hover:bg-surface transition-colors p-2 -mx-2 rounded-sm"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-dark">
                      {item.email}
                    </span>
                    <span className="text-[12px] text-gray">{item.meta}</span>
                  </div>
                </div>
                <span
                  className="text-[13px] font-semibold px-3 py-1 rounded-sm"
                  style={{
                    backgroundColor: item.scoreBg,
                    color: item.scoreColor,
                  }}
                >
                  {item.score}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ValidationDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        validation={selectedValidation}
        onOverride={handleOverride}
      />
    </>
  );
}
