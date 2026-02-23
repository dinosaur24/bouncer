"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { TrendingUp, Mail, Phone, Globe, Building2, Download } from "lucide-react";
import { useToast } from "@/components/Toast";
import {
  ValidationDrawer,
  type ValidationDetail,
} from "@/components/ValidationDrawer";
import { useValidations } from "@/contexts/ValidationContext";
import type { Validation, SignalResult } from "@/lib/types";

const signalIconMap: Record<string, typeof Mail> = {
  email: Mail,
  phone: Phone,
  ip: Globe,
  company: Building2,
};

function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function mapSignalsToDrawer(signals: SignalResult[]) {
  return signals.map(s => ({
    name: s.name,
    icon: signalIconMap[s.type] || Mail,
    status: s.status,
    label: s.label,
    detail: s.detail,
  }));
}

function mapValidationToDetail(v: Validation): ValidationDetail {
  return {
    email: v.email,
    status: v.status,
    score: v.score,
    source: v.source,
    time: formatTimeAgo(v.timestamp),
    ip: v.ip,
    phone: v.phone,
    company: v.company,
    signals: mapSignalsToDrawer(v.signals),
    overridden: v.overridden,
  };
}

const statusColors: Record<string, { dot: string; scoreBg: string; scoreColor: string }> = {
  Passed: { dot: "#22C55E", scoreBg: "#F0FDF4", scoreColor: "#22C55E" },
  Borderline: { dot: "#EAB308", scoreBg: "#FFFBEB", scoreColor: "#F59E0B" },
  Rejected: { dot: "#EF4444", scoreBg: "#FEF2F2", scoreColor: "#E42313" },
};

export default function DashboardPage() {
  const { stats, chartData, validations, isLoading, overrideValidation, exportCSV } = useValidations();
  const { addToast } = useToast();
  const [activeDateRange, setActiveDateRange] = useState("Last 30 days");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedValidation, setSelectedValidation] =
    useState<ValidationDetail | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Track the newest validation ID for slide-in animation
  const [newestId, setNewestId] = useState<string | null>(null);
  const prevFirstIdRef = useRef<string | null>(null);

  const recentValidations = validations.slice(0, 5);

  // Detect when a new validation arrives at the top of the list
  useEffect(() => {
    if (recentValidations.length > 0) {
      const currentFirstId = recentValidations[0].id;
      if (prevFirstIdRef.current !== null && prevFirstIdRef.current !== currentFirstId) {
        setNewestId(currentFirstId);
        // Clear animation class after animation completes
        const timeout = setTimeout(() => setNewestId(null), 500);
        return () => clearTimeout(timeout);
      }
      prevFirstIdRef.current = currentFirstId;
    }
  }, [recentValidations]);

  const metrics = [
    { label: 'Validations today', value: stats.validationsToday.toLocaleString(), change: `${stats.todayChange > 0 ? '+' : ''}${stats.todayChange}%` },
    { label: 'This month', value: stats.validationsMonth.toLocaleString(), change: `${stats.monthChange > 0 ? '+' : ''}${stats.monthChange}%` },
    { label: 'Pass rate', value: `${stats.passRate}%`, change: `${stats.passRateChange > 0 ? '+' : ''}${stats.passRateChange}%` },
    { label: 'Avg. score', value: stats.avgScore.toString(), change: `${stats.avgScoreChange > 0 ? '+' : ''}${stats.avgScoreChange}%` },
  ];

  const maxTotal = Math.max(
    ...chartData.map((d) => d.passed + d.borderline + d.rejected),
    1
  );

  const dateRanges = ["Last 30 days", "Last 7 days", "Custom"];

  const handleOverride = async (email: string) => {
    if (selectedId) {
      await overrideValidation(selectedId);
      addToast("Lead override accepted — syncing to CRM");
      setDrawerOpen(false);
    }
  };

  const handleExport = () => {
    exportCSV();
    addToast("Validation data exported");
  };

  const handleRowClick = (v: Validation) => {
    setSelectedId(v.id);
    setSelectedValidation(mapValidationToDetail(v));
    setDrawerOpen(true);
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
      {isLoading ? (
        <div className="grid grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="border border-border p-7 animate-pulse">
              <div className="h-3 w-24 bg-gray-200 rounded mb-3" />
              <div className="h-7 w-16 bg-gray-200 rounded mt-2" />
              <div className="h-3 w-12 bg-gray-200 rounded mt-3" />
            </div>
          ))}
        </div>
      ) : (
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
      )}

      {/* Bottom Row */}
      <div className="flex gap-6 flex-1 min-h-0">
        {/* Chart Section */}
        {isLoading ? (
          <div className="flex-1 border border-border p-7 flex flex-col animate-pulse">
            <div className="flex items-center justify-between mb-8">
              <div className="h-5 w-40 bg-gray-200 rounded" />
              <div className="h-3 w-48 bg-gray-200 rounded" />
            </div>
            <div className="flex-1 flex items-end gap-6 justify-between">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-3">
                  <div
                    className="w-full bg-gray-200 rounded-sm"
                    style={{ height: `${40 + Math.random() * 80}px` }}
                  />
                  <div className="h-3 w-6 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          </div>
        ) : (
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
                const passedPct = total > 0 ? (bar.passed / total) * 100 : 0;
                const borderlinePct = total > 0 ? (bar.borderline / total) * 100 : 0;
                const rejectedPct = total > 0 ? (bar.rejected / total) * 100 : 0;

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
        )}

        {/* Recent Validations */}
        {isLoading ? (
          <div className="w-[420px] border border-border p-6 flex flex-col animate-pulse">
            <div className="flex items-center justify-between mb-6">
              <div className="h-5 w-36 bg-gray-200 rounded" />
              <div className="h-3 w-16 bg-gray-200 rounded" />
            </div>
            <div className="flex flex-col gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-2">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-gray-200" />
                    <div className="flex flex-col gap-1">
                      <div className="h-3.5 w-36 bg-gray-200 rounded" />
                      <div className="h-2.5 w-24 bg-gray-200 rounded" />
                    </div>
                  </div>
                  <div className="h-6 w-10 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          </div>
        ) : (
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
              {recentValidations.map((item) => {
                const colors = statusColors[item.status] || statusColors.Passed;
                const isNew = item.id === newestId;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleRowClick(item)}
                    className={`flex items-center justify-between cursor-pointer hover:bg-surface transition-colors p-2 -mx-2 rounded-sm ${
                      isNew ? "animate-[slideIn_0.3s_ease-out]" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: colors.dot }}
                      />
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium text-dark">
                          {item.email}
                        </span>
                        <span className="text-[12px] text-gray">
                          {formatTimeAgo(item.timestamp)} · {item.source}
                        </span>
                      </div>
                    </div>
                    <span
                      className="text-[13px] font-semibold px-3 py-1 rounded-sm"
                      style={{
                        backgroundColor: colors.scoreBg,
                        color: colors.scoreColor,
                      }}
                    >
                      {item.score}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
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
