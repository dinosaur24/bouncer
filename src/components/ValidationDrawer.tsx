"use client";

import { useEffect } from "react";
import { X, Mail, Phone, Globe, Building2 } from "lucide-react";

interface SignalDetail {
  name: string;
  icon: typeof Mail;
  status: "pass" | "warn" | "fail";
  label: string;
  detail: string;
}

export interface ValidationDetail {
  email: string;
  status: "Passed" | "Borderline" | "Rejected";
  score: number;
  source: string;
  time: string;
  ip: string;
  phone: string;
  company: string;
  signals: SignalDetail[];
}

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  validation: ValidationDetail | null;
  onOverride?: (email: string) => void;
}

const statusColors = {
  Passed: { bg: "bg-[#F0FDF4]", text: "text-[#22C55E]", border: "border-[#22C55E]/20" },
  Borderline: { bg: "bg-[#FFFBEB]", text: "text-[#F59E0B]", border: "border-[#F59E0B]/20" },
  Rejected: { bg: "bg-[#FEF2F2]", text: "text-[#E42313]", border: "border-[#E42313]/20" },
};

const signalStatusColors = {
  pass: { bg: "bg-[#F0FDF4]", text: "text-[#22C55E]", label: "Pass" },
  warn: { bg: "bg-[#FFFBEB]", text: "text-[#F59E0B]", label: "Warning" },
  fail: { bg: "bg-[#FEF2F2]", text: "text-[#E42313]", label: "Fail" },
};

export function ValidationDrawer({
  open,
  onClose,
  validation,
  onOverride,
}: DrawerProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  if (!open || !validation) return null;

  const colors = statusColors[validation.status];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/40 animate-[fadeIn_0.15s_ease-out]"
        onClick={onClose}
      />
      <div className="relative w-[480px] bg-white border-l border-border h-full overflow-y-auto animate-[slideRight_0.2s_ease-out] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="font-heading text-lg font-semibold text-dark">
            Validation Detail
          </h2>
          <button
            onClick={onClose}
            className="text-gray hover:text-dark cursor-pointer transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 flex flex-col gap-6">
          {/* Email & Score */}
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="font-heading text-[15px] font-semibold text-dark">
                {validation.email}
              </span>
              <span className="text-xs text-gray">{validation.time}</span>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`px-2.5 py-0.5 text-xs font-medium ${colors.bg} ${colors.text}`}
              >
                {validation.status}
              </span>
              <span
                className={`font-heading text-2xl font-bold ${colors.text}`}
              >
                {validation.score}
              </span>
            </div>
          </div>

          {/* Meta info */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-surface">
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] text-[#999999] uppercase tracking-wide">
                Source
              </span>
              <span className="text-[13px] text-dark font-medium">
                {validation.source}
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] text-[#999999] uppercase tracking-wide">
                IP Address
              </span>
              <span className="text-[13px] text-dark font-medium">
                {validation.ip}
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] text-[#999999] uppercase tracking-wide">
                Phone
              </span>
              <span className="text-[13px] text-dark font-medium">
                {validation.phone}
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] text-[#999999] uppercase tracking-wide">
                Company
              </span>
              <span className="text-[13px] text-dark font-medium">
                {validation.company}
              </span>
            </div>
          </div>

          {/* Signal Breakdown */}
          <div className="flex flex-col gap-3">
            <h3 className="font-heading text-[13px] font-semibold text-dark uppercase tracking-wide">
              Signal Breakdown
            </h3>
            {validation.signals.map((signal) => {
              const sc = signalStatusColors[signal.status];
              const Icon = signal.icon;
              return (
                <div
                  key={signal.name}
                  className="border border-border p-4 flex items-start gap-4"
                >
                  <div className="w-9 h-9 bg-surface flex items-center justify-center shrink-0">
                    <Icon size={16} className="text-dark" />
                  </div>
                  <div className="flex-1 flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="font-heading text-[13px] font-semibold text-dark">
                        {signal.name}
                      </span>
                      <span
                        className={`text-[11px] font-medium px-2 py-0.5 ${sc.bg} ${sc.text}`}
                      >
                        {sc.label}
                      </span>
                    </div>
                    <span className="text-[13px] text-dark">{signal.label}</span>
                    <span className="text-xs text-gray">{signal.detail}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-6 border-t border-border flex gap-3">
          {validation.status === "Borderline" && onOverride && (
            <button
              onClick={() => onOverride(validation.email)}
              className="bg-dark text-white font-heading text-[13px] font-medium px-5 py-2.5 cursor-pointer hover:bg-dark/90 transition-colors"
            >
              Override: Accept
            </button>
          )}
          <button
            onClick={onClose}
            className="border border-border text-dark font-heading text-[13px] font-medium px-5 py-2.5 cursor-pointer hover:bg-surface transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
