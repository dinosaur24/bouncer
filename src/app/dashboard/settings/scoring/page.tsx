"use client";

import { useState, useEffect, useMemo } from "react";
import { useToast } from "@/components/Toast";
import { useSettings } from "@/contexts/SettingsContext";

export default function ScoringPage() {
  const { addToast } = useToast();
  const { scoring, updateScoring, isLoading } = useSettings();

  const [passedMin, setPassedMin] = useState(scoring.passedMin);
  const [borderlineMin, setBorderlineMin] = useState(scoring.borderlineMin);
  const [blockRejected, setBlockRejected] = useState(scoring.blockRejected);
  const [rejectionMessage, setRejectionMessage] = useState(scoring.rejectionMessage);

  const [scores, setScores] = useState<number[]>([]);

  useEffect(() => {
    fetch("/api/validations/scores")
      .then((r) => r.ok ? r.json() : [])
      .then(setScores)
      .catch(() => {});
  }, []);

  const preview = useMemo(() => {
    const total = scores.length;
    if (total === 0) {
      return [
        { label: "Passed", value: "—", color: "#22C55E", bg: "bg-green/5" },
        { label: "Borderline", value: "—", color: "#F59E0B", bg: "bg-[#FEF3C7]" },
        { label: "Rejected", value: "—", color: "#E42313", bg: "bg-[#FEE2E2]" },
      ];
    }
    const passed = scores.filter((s) => s >= passedMin).length;
    const borderline = scores.filter((s) => s >= borderlineMin && s < passedMin).length;
    const rejected = total - passed - borderline;
    return [
      { label: "Passed", value: `${Math.round((passed / total) * 100)}`, color: "#22C55E", bg: "bg-green/5" },
      { label: "Borderline", value: `${Math.round((borderline / total) * 100)}`, color: "#F59E0B", bg: "bg-[#FEF3C7]" },
      { label: "Rejected", value: `${Math.round((rejected / total) * 100)}`, color: "#E42313", bg: "bg-[#FEE2E2]" },
    ];
  }, [scores, passedMin, borderlineMin]);

  const sliderBg = (color: string, value: number, min: number, max: number) => {
    const pct = ((value - min) / (max - min)) * 100;
    return `linear-gradient(to right, ${color} ${pct}%, #E5E5E5 ${pct}%)`;
  };

  const handleSave = async () => {
    try {
      await updateScoring({ passedMin, borderlineMin, blockRejected, rejectionMessage });
      addToast("Scoring thresholds updated");
    } catch {
      addToast("Failed to update thresholds", "error");
    }
  };

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
        {/* Passed */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" />
              <span className="font-heading text-sm font-medium text-dark">Passed</span>
            </div>
            <span className="text-[13px] text-gray tabular-nums">{passedMin} — 100</span>
          </div>
          <input
            type="range"
            min={borderlineMin + 1}
            max={99}
            value={passedMin}
            onChange={(e) => setPassedMin(Number(e.target.value))}
            className="threshold-slider threshold-slider--green w-full"
            style={{ background: sliderBg("#22C55E", passedMin, borderlineMin + 1, 99) }}
          />
        </div>

        {/* Borderline */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
              <span className="font-heading text-sm font-medium text-dark">Borderline</span>
            </div>
            <span className="text-[13px] text-gray tabular-nums">{borderlineMin} — {passedMin - 1}</span>
          </div>
          <input
            type="range"
            min={1}
            max={passedMin - 1}
            value={borderlineMin}
            onChange={(e) => setBorderlineMin(Number(e.target.value))}
            className="threshold-slider threshold-slider--amber w-full"
            style={{ background: sliderBg("#F59E0B", borderlineMin, 1, passedMin - 1) }}
          />
        </div>

        {/* Rejected */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#E42313]" />
              <span className="font-heading text-sm font-medium text-dark">Rejected</span>
            </div>
            <span className="text-[13px] text-gray tabular-nums">0 — {borderlineMin - 1}</span>
          </div>
          <div className="w-full h-2.5 bg-[#E5E5E5] rounded-full">
            <div
              className="h-2.5 rounded-full bg-[#E42313] transition-all"
              style={{ width: `${borderlineMin}%` }}
            />
          </div>
        </div>
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
          Live preview — Last {scores.length || 100} validations
        </h3>
        <div className="grid grid-cols-3 gap-3 md:gap-4">
          {preview.map((p) => (
            <div
              key={p.label}
              className={`${p.bg} p-4 md:p-5 flex flex-col items-center gap-1 rounded-lg`}
            >
              <span
                className="font-heading text-[24px] md:text-[28px] font-bold"
                style={{ color: p.color }}
              >
                {p.value === "—" ? "—" : `${p.value}%`}
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
          className="w-full border border-border rounded-lg px-4 py-2.5 text-[13px] text-dark font-heading bg-white focus:outline-none focus:border-dark transition-colors resize-none"
        />
      </div>

      {/* Save */}
      <div>
        <button
          onClick={handleSave}
          disabled={isLoading}
          className={`bg-dark text-white font-heading text-[13px] font-medium px-5 py-2.5 hover:bg-dark/90 cursor-pointer rounded-lg ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isLoading ? "Saving..." : "Save changes"}
        </button>
      </div>
    </>
  );
}
