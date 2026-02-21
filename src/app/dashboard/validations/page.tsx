"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Mail, Phone, Globe, Building2, Download, Filter } from "lucide-react";
import { useToast } from "@/components/Toast";
import { ValidationDrawer, type ValidationDetail } from "@/components/ValidationDrawer";

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

const validationDetails: Record<string, ValidationDetail> = {
  "sarah@techcorp.io": {
    email: "sarah@techcorp.io",
    status: "Passed",
    score: 92,
    source: "Contact Form",
    time: "2 min ago",
    ip: "192.168.1.42",
    phone: "+1 555-234-5678",
    company: "TechCorp Inc",
    signals: [
      {
        name: "Email Verification",
        icon: Mail,
        status: "pass",
        label: "Valid corporate email",
        detail: "MX records verified, mailbox exists on techcorp.io",
      },
      {
        name: "Phone Verification",
        icon: Phone,
        status: "pass",
        label: "Valid phone number",
        detail: "US mobile number, carrier verified",
      },
    ],
  },
  "j.miller@startup.co": {
    email: "j.miller@startup.co",
    status: "Borderline",
    score: 54,
    source: "API",
    time: "5 min ago",
    ip: "10.0.0.88",
    phone: "+1 555-876-5432",
    company: "Startup Co",
    signals: [
      {
        name: "Email Verification",
        icon: Mail,
        status: "warn",
        label: "New domain detected",
        detail: "Domain startup.co registered 3 months ago, limited history",
      },
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
      {
        name: "Email Verification",
        icon: Mail,
        status: "fail",
        label: "Disposable email provider",
        detail: "mailinator.com is a known disposable email service",
      },
      {
        name: "Phone Verification",
        icon: Phone,
        status: "fail",
        label: "Invalid phone number",
        detail: "Number format invalid, does not match any known carrier",
      },
      {
        name: "IP Analysis",
        icon: Globe,
        status: "fail",
        label: "Spam IP detected",
        detail: "IP 203.0.113.42 found on 3 blacklists",
      },
      {
        name: "Domain Check",
        icon: Building2,
        status: "fail",
        label: "Blacklisted domain",
        detail: "mailinator.com is on the global disposable domain blacklist",
      },
    ],
  },
  "anna.chen@enterprise.com": {
    email: "anna.chen@enterprise.com",
    status: "Passed",
    score: 87,
    source: "Demo Request",
    time: "12 min ago",
    ip: "172.16.0.5",
    phone: "+1 555-345-6789",
    company: "Enterprise Inc",
    signals: [
      {
        name: "Email Verification",
        icon: Mail,
        status: "pass",
        label: "Valid corporate email",
        detail: "MX records verified, mailbox exists on enterprise.com",
      },
      {
        name: "IP Analysis",
        icon: Globe,
        status: "pass",
        label: "Clean IP address",
        detail: "IP 172.16.0.5 has no blacklist entries, corporate range",
      },
    ],
  },
  "mark@agency.io": {
    email: "mark@agency.io",
    status: "Passed",
    score: 78,
    source: "Contact Form",
    time: "15 min ago",
    ip: "192.168.2.10",
    phone: "+1 555-987-6543",
    company: "Agency.io",
    signals: [
      {
        name: "Phone Verification",
        icon: Phone,
        status: "pass",
        label: "Valid phone number",
        detail: "US mobile number, carrier verified",
      },
      {
        name: "Domain Check",
        icon: Building2,
        status: "pass",
        label: "Established domain",
        detail: "agency.io registered 4 years ago, good reputation",
      },
    ],
  },
  "info@spambot.xyz": {
    email: "info@spambot.xyz",
    status: "Rejected",
    score: 8,
    source: "API",
    time: "22 min ago",
    ip: "45.33.32.156",
    phone: "N/A",
    company: "SpamBot Ltd",
    signals: [
      {
        name: "Email Verification",
        icon: Mail,
        status: "fail",
        label: "Suspicious email pattern",
        detail: "Generic info@ address on known spam domain",
      },
      {
        name: "IP Analysis",
        icon: Globe,
        status: "fail",
        label: "Malicious IP detected",
        detail: "IP 45.33.32.156 flagged on 7 blacklists, known bot traffic",
      },
      {
        name: "Domain Check",
        icon: Building2,
        status: "fail",
        label: "Spam domain",
        detail: "spambot.xyz flagged as spam, .xyz TLD with no legitimate history",
      },
    ],
  },
  "hello@designstudio.com": {
    email: "hello@designstudio.com",
    status: "Passed",
    score: 91,
    source: "Webinar",
    time: "34 min ago",
    ip: "192.168.5.20",
    phone: "+1 555-111-2222",
    company: "Design Studio",
    signals: [
      {
        name: "Email Verification",
        icon: Mail,
        status: "pass",
        label: "Valid corporate email",
        detail: "MX records verified, mailbox exists on designstudio.com",
      },
      {
        name: "Phone Verification",
        icon: Phone,
        status: "pass",
        label: "Valid phone number",
        detail: "US landline number, business line verified",
      },
      {
        name: "Domain Check",
        icon: Building2,
        status: "pass",
        label: "Established domain",
        detail: "designstudio.com registered 8 years ago, excellent reputation",
      },
    ],
  },
};

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

const statusOptions: (Status | "All")[] = ["All", "Passed", "Borderline", "Rejected"];

export default function ValidationsPage() {
  const [activeDateRange, setActiveDateRange] =
    useState<DateRange>("Last 30 days");
  const [activePage, setActivePage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "All">("All");
  const [showFilters, setShowFilters] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedValidation, setSelectedValidation] =
    useState<ValidationDetail | null>(null);
  const { addToast } = useToast();
  const filterRef = useRef<HTMLDivElement>(null);

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
        v.source.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((v) => statusFilter === "All" || v.status === statusFilter);

  const handleRowClick = (email: string) => {
    const detail = validationDetails[email];
    if (detail) {
      setSelectedValidation(detail);
      setDrawerOpen(true);
    }
  };

  const handleOverride = (email: string) => {
    addToast("Lead override accepted \u2014 syncing to CRM", "success");
    setDrawerOpen(false);
    setSelectedValidation(null);
  };

  const handleExport = () => {
    const headers = ["Email", "Status", "Score", "Signals", "Source", "Time"];
    const csvRows = [
      headers.join(","),
      ...validations.map((v) =>
        [
          `"${v.email}"`,
          v.status,
          v.score,
          `"${v.signals}"`,
          `"${v.source}"`,
          `"${v.time}"`,
        ].join(",")
      ),
    ];
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "validations.csv";
    link.click();
    URL.revokeObjectURL(url);
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
              onChange={(e) => setSearchQuery(e.target.value)}
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
        {filtered.map((row) => {
          const style = statusStyles[row.status];
          return (
            <div
              key={row.email}
              onClick={() => handleRowClick(row.email)}
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
            Showing 1&ndash;{filtered.length} of {filtered.length} results
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

      {/* Validation Detail Drawer */}
      <ValidationDrawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedValidation(null);
        }}
        validation={selectedValidation}
        onOverride={handleOverride}
      />
    </>
  );
}
