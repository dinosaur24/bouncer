"use client";

import { useState } from "react";

const ranges = [
  { label: "Passed", color: "#22C55E", range: "70 — 100", width: "30%" },
  { label: "Borderline", color: "#F59E0B", range: "40 — 69", width: "30%" },
  { label: "Rejected", color: "#E42313", range: "0 — 39", width: "40%" },
];

const preview = [
  { label: "Passed", value: "62", color: "#22C55E", bg: "bg-green/5" },
  { label: "Borderline", value: "24", color: "#F59E0B", bg: "bg-[#FEF3C7]" },
  { label: "Rejected", value: "14", color: "#E42313", bg: "bg-[#FEE2E2]" },
];

export default function ScoringPage() {
  const [blockRejected, setBlockRejected] = useState(true);
  const [rejectionMessage, setRejectionMessage] = useState(
    "This lead did not meet the minimum validation score. Please submit manually or contact support."
  );

  return (
    <>
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-[28px] font-bold text-dark">
          Scoring Thresholds
        </h1>
        <p className="text-sm text-gray">
          Configure how leads are categorized based on their validation score
        </p>
      </div>

      {/* Description */}
      <p className="text-[13px] text-gray leading-relaxed">
        Define the score ranges that determine whether a lead is Passed, Borderline, or Rejected. These thresholds apply to all incoming submissions.
      </p>

      {/* Score Ranges */}
      <div className="flex flex-col gap-6">
        {ranges.map((r) => (
          <div key={r.label} className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: r.color }}
                />
                <span className="font-heading text-sm font-medium text-dark">
                  {r.label}
                </span>
              </div>
              <span className="text-[13px] text-gray">{r.range}</span>
            </div>
            <div className="w-full h-2.5 bg-surface overflow-hidden">
              <div
                className="h-full"
                style={{ backgroundColor: r.color, width: r.width }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Block Toggle */}
      <div className="flex justify-between items-center py-2">
        <div className="flex flex-col gap-1">
          <span className="font-heading text-sm font-medium text-dark">
            Block rejected leads
          </span>
          <span className="text-xs text-gray">
            Automatically prevent leads scoring below the rejection threshold from entering your CRM.
          </span>
        </div>
        <button
          onClick={() => setBlockRejected(!blockRejected)}
          className={`w-[44px] h-[24px] rounded-full relative transition-colors cursor-pointer shrink-0 ml-4 ${
            blockRejected ? "bg-dark" : "bg-[#D0D0D0]"
          }`}
        >
          <div
            className={`w-[20px] h-[20px] rounded-full bg-white absolute top-[2px] transition-all ${
              blockRejected ? "left-[22px]" : "left-[2px]"
            }`}
          />
        </button>
      </div>

      {/* Live Preview */}
      <div className="flex flex-col gap-4">
        <h3 className="font-heading text-[15px] font-semibold text-dark">
          Live preview — Last 100 validations
        </h3>
        <div className="grid grid-cols-3 gap-3 md:gap-4">
          {preview.map((p) => (
            <div
              key={p.label}
              className={`${p.bg} p-4 md:p-5 flex flex-col items-center gap-1`}
            >
              <span
                className="font-heading text-[24px] md:text-[28px] font-bold"
                style={{ color: p.color }}
              >
                {p.value}%
              </span>
              <span className="text-xs text-gray">{p.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Rejection Message */}
      <div className="flex flex-col gap-3">
        <label className="font-heading text-[15px] font-semibold text-dark">
          Custom rejection message
        </label>
        <textarea
          value={rejectionMessage}
          onChange={(e) => setRejectionMessage(e.target.value)}
          rows={3}
          className="w-full border border-border px-4 py-2.5 text-[13px] text-dark font-heading bg-white focus:outline-none focus:border-dark transition-colors resize-none"
        />
      </div>

      {/* Save */}
      <div>
        <button className="bg-dark text-white font-heading text-[13px] font-medium px-5 py-2.5 hover:bg-dark/90 cursor-pointer">
          Save thresholds
        </button>
      </div>
    </>
  );
}
