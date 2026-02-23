"use client";

import { useState } from "react";
import Link from "next/link";

const thresholds = [
  {
    label: "Passed",
    range: "70 — 100",
    color: "#22C55E",
    widthPercent: 30,
  },
  {
    label: "Borderline",
    range: "40 — 69",
    color: "#F59E0B",
    widthPercent: 30,
  },
  {
    label: "Rejected",
    range: "0 — 39",
    color: "#E42313",
    widthPercent: 40,
  },
];

export default function SetThresholdsPage() {
  const [blockRejected, setBlockRejected] = useState(true);

  return (
    <div>
      <h1 className="font-heading text-[28px] md:text-[32px] font-bold text-dark">
        Set scoring thresholds
      </h1>
      <p className="text-sm text-gray mt-2">
        Define what qualifies as a Passed, Borderline, or Rejected lead.
      </p>

      {/* Score ranges */}
      <div className="mt-8 flex flex-col gap-6">
        {thresholds.map((threshold) => (
          <div key={threshold.label}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: threshold.color }}
                />
                <span className="font-heading text-sm font-medium text-dark">
                  {threshold.label}
                </span>
              </div>
              <span className="font-heading text-sm text-gray">
                {threshold.range}
              </span>
            </div>
            <div className="w-full bg-border rounded-full h-2.5">
              <div
                className="h-2.5 rounded-full"
                style={{
                  backgroundColor: threshold.color,
                  width: `${threshold.widthPercent}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Block rejected leads toggle */}
      <div className="mt-8 flex justify-between items-center">
        <div>
          <p className="font-heading text-sm font-medium text-dark">
            Block rejected leads
          </p>
          <p className="text-[13px] text-gray mt-0.5">
            Automatically prevent rejected leads from entering your CRM.
          </p>
        </div>
        <button
          onClick={() => setBlockRejected(!blockRejected)}
          className={`w-[44px] h-[24px] rounded-full relative transition-colors shrink-0 ml-4 ${
            blockRejected ? "bg-dark" : "bg-[#D0D0D0]"
          }`}
        >
          <div
            className={`w-[18px] h-[18px] rounded-full bg-white absolute top-[3px] transition-transform ${
              blockRejected ? "translate-x-[23px]" : "translate-x-[3px]"
            }`}
          />
        </button>
      </div>

      {/* Finish setup button */}
      <Link
        href="/dashboard"
        className="mt-8 w-full bg-dark text-white font-heading text-[13px] font-medium py-2.5 text-center block"
      >
        Finish setup
      </Link>
    </div>
  );
}
