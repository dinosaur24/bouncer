"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Mail, Phone, Globe, Building2, Download, Filter } from "lucide-react";
import { useToast } from "@/components/Toast";
import { ValidationDrawer, type ValidationDetail } from "@/components/ValidationDrawer";
import { useValidations } from "@/contexts/ValidationContext";
import type { Validation, SignalResult, ValidationStatus } from "@/lib/types";

const dateRanges = ["Last 30 days", "Last 7 days", "Custom"] as const;
type DateRange = (typeof dateRanges)[number];

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

function getSignalsSummary(signals: SignalResult[]): string {
  return signals.map(s => {
    switch (s.type) {
      case 'email': return 'Email';
      case 'phone': return 'Phone';
      case 'ip': return 'IP';
      case 'company': return 'Domain';
      default: return s.name;
    }
  }).join(' \u00B7 ');
}

const statusStyles: Record<
  ValidationStatus,
  { bg: string; text: string; scoreColor: string }
> = {
  Passed: {
    bg: "bg-[#F0FDF4]",
    text: "text-[#22C55E]",
    scoreColor: "text-[#22C55E]",
  },
  Borderline: {
    bg: "bg-[#FFFBEB]",
    text: "text-[#F59E0B]",
    scoreColor: "text-[#F59E0B]",
  },
  Rejected: {
    bg: "bg-[#FEF2F2]",
    text: "text-[#E42313]",
    scoreColor: "text-[#E42313]",
  },
};

const columns = [
  { label: "Email", width: "w-[260px]" },
  { label: "Status", width: "w-[140px]" },
  { label: "Score", width: "w-[80px]" },
  { label: "Signals", width: "w-[180px]" },
  { label: "Source", width: "w-[140px]" },
  { label: "Time", width: "flex-1" },
];

const statusOptions: (ValidationStatus | "All")[] = ["All", "Passed", "Borderline", "Rejected"];

const ITEMS_PER_PAGE = 10;

export default function ValidationsPage() {
  const [activeDateRange, setActiveDateRange] =
    useState<DateRange>("Last 30 days");
  const [activePage, setActivePage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ValidationStatus | "All">("All");
  const [showFilters, setShowFilters] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedValidation, setSelectedValidation] =
    useState<ValidationDetail | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { addToast } = useToast();
  const filterRef = useRef<HTMLDivElement>(null);
  const { validations, isLoading, overrideValidation, exportCSV } = useValidations();

  // Close filter dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setShowFilters(false);
      }
    }
    if (showFilters) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showFilters]);

  const filtered = validations
    .filter(
      (v) =>
        v.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.source.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((v) => statusFilter === "All" || v.status === statusFilter);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginatedItems = filtered.slice(
    (activePage - 1) * ITEMS_PER_PAGE,
    activePage * ITEMS_PER_PAGE
  );

  const handleRowClick = (v: Validation) => {
    setSelectedId(v.id);
    setSelectedValidation(mapValidationToDetail(v));
    setDrawerOpen(true);
  };

  const handleOverride = async (email: string) => {
    if (selectedId) {
      await overrideValidation(selectedId);
      addToast("Validation overridden to Passed", "success");
      setDrawerOpen(false);
      setSelectedValidation(null);
      setSelectedId(null);
    }
  };

  const handleExport = () => {
    exportCSV();
    addToast("Validation data exported", "success");
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between">
        {/* Left */}
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-[28px] font-bold text-dark">
            Validations
          </h1>
          <p className="text-sm text-gray">
            Review all lead validation results
          </p>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          {/* Date picker */}
          <div className="flex border border-border">
            {dateRanges.map((range) => (
              <button
                key={range}
                onClick={() => setActiveDateRange(range)}
                className={`px-4 py-2.5 text-xs font-medium cursor-pointer transition-colors ${
                  activeDateRange === range
                    ? "bg-dark text-white"
                    : "bg-white text-gray hover:bg-surface"
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative flex items-center border border-border px-4 py-2.5 w-[260px]">
            <Search size={14} className="text-gray mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search by email, domain..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setActivePage(1);
              }}
              className="text-xs text-dark placeholder:text-gray outline-none bg-transparent w-full"
            />
          </div>

          {/* Filters button */}
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 border border-border px-4 py-2.5 text-xs font-medium cursor-pointer transition-colors ${
                statusFilter !== "All"
                  ? "bg-dark text-white"
                  : "text-dark hover:bg-surface"
              }`}
            >
              <Filter size={12} />
              Filters
              {statusFilter !== "All" && (
                <span className="bg-white/20 px-1.5 py-0.5 text-[10px] rounded-sm">
                  {statusFilter}
                </span>
              )}
            </button>
            {showFilters && (
              <div className="absolute top-full right-0 mt-1 bg-white border border-border shadow-lg z-40 min-w-[160px]">
                {statusOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setStatusFilter(option);
                      setShowFilters(false);
                      setActivePage(1);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-xs font-medium cursor-pointer transition-colors ${
                      statusFilter === option
                        ? "bg-dark text-white"
                        : "text-dark hover:bg-surface"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Export button */}
          <button
            onClick={handleExport}
            className="flex items-center gap-2 border border-border px-4 py-2.5 text-xs font-medium text-dark cursor-pointer hover:bg-surface transition-colors"
          >
            <Download size={12} />
            Export
          </button>
        </div>
      </div>

      {/* Validation Table */}
      <div className="border border-border w-full">
        {/* Table Header */}
        <div className="flex items-center bg-surface px-5 py-3 border-b border-border">
          {columns.map((col) => (
            <div key={col.label} className={col.width}>
              <span className="text-xs text-gray font-medium uppercase tracking-wide">
                {col.label}
              </span>
            </div>
          ))}
        </div>

        {/* Table Rows */}
        {paginatedItems.map((row) => {
          const style = statusStyles[row.status];
          return (
            <div
              key={row.id}
              onClick={() => handleRowClick(row)}
              className="flex items-center px-5 py-3.5 border-b border-border cursor-pointer hover:bg-surface transition-colors"
            >
              {/* Email */}
              <div className="w-[260px]">
                <span className="text-[13px] font-medium text-dark">
                  {row.email}
                </span>
              </div>

              {/* Status */}
              <div className="w-[140px]">
                <span
                  className={`inline-block rounded-none px-2.5 py-0.5 text-xs font-medium ${style.bg} ${style.text}`}
                >
                  {row.status}
                </span>
              </div>

              {/* Score */}
              <div className="w-[80px]">
                <span
                  className={`font-heading text-[13px] font-semibold ${style.scoreColor}`}
                >
                  {row.score}
                </span>
              </div>

              {/* Signals */}
              <div className="w-[180px]">
                <span className="text-xs text-gray">{getSignalsSummary(row.signals)}</span>
              </div>

              {/* Source */}
              <div className="w-[140px]">
                <span className="text-xs text-gray">{row.source}</span>
              </div>

              {/* Time */}
              <div className="flex-1">
                <span className="text-xs text-[#999999]">{formatTimeAgo(row.timestamp)}</span>
              </div>
            </div>
          );
        })}

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="flex items-center justify-center px-5 py-12">
            <span className="text-sm text-gray">
              No validations match your filters
            </span>
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3">
          <span className="text-xs text-[#999999]">
            Showing {filtered.length === 0 ? 0 : (activePage - 1) * ITEMS_PER_PAGE + 1}&ndash;{Math.min(activePage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} results
          </span>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setActivePage(page)}
                className={`px-2.5 py-1 text-xs font-medium cursor-pointer transition-colors ${
                  activePage === page
                    ? "bg-dark text-white"
                    : "border border-border text-dark hover:bg-surface"
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Validation Detail Drawer */}
      <ValidationDrawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedValidation(null);
          setSelectedId(null);
        }}
        validation={selectedValidation}
        onOverride={handleOverride}
      />
    </>
  );
}
