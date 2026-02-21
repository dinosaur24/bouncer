"use client";

import { TrendingUp } from "lucide-react";

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

export default function DashboardPage() {
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
            <button className="bg-dark text-white font-heading text-[13px] font-medium px-4 py-2.5 cursor-pointer">
              Last 30 days
            </button>
            <button className="border border-border font-heading text-[13px] font-medium px-4 py-2.5 text-dark cursor-pointer bg-white">
              Last 7 days
            </button>
            <button className="border border-border border-l-0 font-heading text-[13px] font-medium px-4 py-2.5 text-dark cursor-pointer bg-white">
              Custom
            </button>
          </div>

          {/* Export button */}
          <button className="border border-border font-heading text-[13px] font-medium px-4 py-2.5 text-dark cursor-pointer bg-white hover:bg-surface transition-colors">
            Export
          </button>

          {/* Add source button */}
          <button className="bg-dark text-white font-heading text-[13px] font-medium px-4 py-2.5 cursor-pointer hover:bg-dark/90 transition-colors">
            Add source
          </button>
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
            <a
              href="#"
              className="text-[13px] font-medium text-brand hover:underline"
            >
              View All &rarr;
            </a>
          </div>

          {/* Validation rows */}
          <div className="flex flex-col gap-4">
            {recentValidations.map((item) => (
              <div
                key={item.email}
                className="flex items-center justify-between"
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
    </>
  );
}
