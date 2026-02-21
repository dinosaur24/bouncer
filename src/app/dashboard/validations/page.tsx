"use client";

import { useState } from "react";
import { Search } from "lucide-react";

const dateRanges = ["Last 30 days", "Last 7 days", "Custom"] as const;
type DateRange = (typeof dateRanges)[number];

type Status = "Passed" | "Borderline" | "Rejected";

interface Validation {
  email: string;
  status: Status;
  score: number;
  signals: string;
  source: string;
  time: string;
}

const validations: Validation[] = [
  {
    email: "sarah@techcorp.io",
    status: "Passed",
    score: 92,
    signals: "Email \u00B7 Phone",
    source: "Contact Form",
    time: "2 min ago",
  },
  {
    email: "j.miller@startup.co",
    status: "Borderline",
    score: 54,
    signals: "Email",
    source: "API",
    time: "5 min ago",
  },
  {
    email: "test123@mailinator.com",
    status: "Rejected",
    score: 18,
    signals: "Email \u00B7 Phone \u00B7 IP \u00B7 Domain",
    source: "Newsletter",
    time: "8 min ago",
  },
  {
    email: "anna.chen@enterprise.com",
    status: "Passed",
    score: 87,
    signals: "Email \u00B7 IP",
    source: "Demo Request",
    time: "12 min ago",
  },
  {
    email: "mark@agency.io",
    status: "Passed",
    score: 78,
    signals: "Phone \u00B7 Domain",
    source: "Contact Form",
    time: "15 min ago",
  },
  {
    email: "info@spambot.xyz",
    status: "Rejected",
    score: 8,
    signals: "Email \u00B7 IP \u00B7 Domain",
    source: "API",
    time: "22 min ago",
  },
  {
    email: "hello@designstudio.com",
    status: "Passed",
    score: 91,
    signals: "Email \u00B7 Phone \u00B7 Domain",
    source: "Webinar",
    time: "34 min ago",
  },
];

const statusStyles: Record<
  Status,
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

export default function ValidationsPage() {
  const [activeDateRange, setActiveDateRange] =
    useState<DateRange>("Last 30 days");
  const [activePage, setActivePage] = useState(1);

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
              className="text-xs text-dark placeholder:text-gray outline-none bg-transparent w-full"
            />
          </div>

          {/* Filters button */}
          <button className="border border-border px-4 py-2.5 text-xs font-medium text-dark cursor-pointer hover:bg-surface transition-colors">
            Filters
          </button>

          {/* Export button */}
          <button className="border border-border px-4 py-2.5 text-xs font-medium text-dark cursor-pointer hover:bg-surface transition-colors">
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
        {validations.map((row) => {
          const style = statusStyles[row.status];
          return (
            <div
              key={row.email}
              className="flex items-center px-5 py-3.5 border-b border-border"
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
                <span className="text-xs text-gray">{row.signals}</span>
              </div>

              {/* Source */}
              <div className="w-[140px]">
                <span className="text-xs text-gray">{row.source}</span>
              </div>

              {/* Time */}
              <div className="flex-1">
                <span className="text-xs text-[#999999]">{row.time}</span>
              </div>
            </div>
          );
        })}

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3">
          <span className="text-xs text-[#999999]">
            Showing 1&ndash;7 of 1,247 results
          </span>

          <div className="flex items-center gap-1">
            {[1, 2, 3].map((page) => (
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
    </>
  );
}
