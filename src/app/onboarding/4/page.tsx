"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useOnboarding } from "@/contexts/OnboardingContext";

function sliderBg(color: string, value: number, min: number, max: number) {
  const pct = ((value - min) / (max - min)) * 100;
  return `linear-gradient(to right, ${color} ${pct}%, #E5E5E5 ${pct}%)`;
}

export default function SetThresholdsPage() {
  const [passedMin, setPassedMin] = useState(70);
  const [borderlineMin, setBorderlineMin] = useState(40);
  const [blockRejected, setBlockRejected] = useState(true);

  const { saveThresholds, completeOnboarding, isLoading } = useOnboarding();
  const router = useRouter();

  const handleFinish = async () => {
    await saveThresholds({
      passedMin,
      borderlineMin,
      blockRejected,
      rejectionMessage: "",
    });
    await completeOnboarding();
    router.push("/dashboard");
  };

  return (
    <div>
      <h1 className="font-heading text-[28px] md:text-[32px] font-bold text-dark">
        Set scoring thresholds
      </h1>
      <p className="text-sm text-gray mt-2">
        Define what qualifies as a Passed, Borderline, or Rejected lead.
      </p>

      <div className="mt-8 flex flex-col gap-6">
        {/* Passed */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" />
              <span className="font-heading text-sm font-medium text-dark">Passed</span>
            </div>
            <span className="font-heading text-sm text-gray tabular-nums">
              {passedMin} &mdash; 100
            </span>
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
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
              <span className="font-heading text-sm font-medium text-dark">Borderline</span>
            </div>
            <span className="font-heading text-sm text-gray tabular-nums">
              {borderlineMin} &mdash; {passedMin - 1}
            </span>
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
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#E42313]" />
              <span className="font-heading text-sm font-medium text-dark">Rejected</span>
            </div>
            <span className="font-heading text-sm text-gray tabular-nums">
              0 &mdash; {borderlineMin - 1}
            </span>
          </div>
          <div className="w-full bg-[#E5E5E5] rounded-full h-2.5">
            <div
              className="h-2.5 rounded-full bg-[#E42313] transition-all"
              style={{ width: `${borderlineMin}%` }}
            />
          </div>
        </div>
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
          className={`w-[44px] h-[24px] rounded-full relative transition-colors shrink-0 ml-4 cursor-pointer ${
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

      <button
        onClick={handleFinish}
        disabled={isLoading}
        className="mt-8 w-full bg-dark text-white font-heading text-[13px] font-medium py-2.5 text-center disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer rounded-lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Setting up...
          </>
        ) : (
          "Finish setup"
        )}
      </button>
    </div>
  );
}
