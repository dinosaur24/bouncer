"use client";

import { useState } from "react";
import { Modal } from "@/components/Modal";
import { useBilling } from "@/contexts/BillingContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/Toast";
import { PLANS } from "@/lib/mock-data";
import type { PlanTier } from "@/lib/types";

const PLAN_ORDER: PlanTier[] = ["free", "starter", "growth", "scale"];

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const { upgradePlan } = useBilling();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [loadingTier, setLoadingTier] = useState<PlanTier | null>(null);

  const currentPlan = user?.plan ?? "free";
  const currentIndex = PLAN_ORDER.indexOf(currentPlan);

  const handleSelectPlan = async (tier: PlanTier) => {
    if (tier === currentPlan) return;
    setLoadingTier(tier);
    try {
      await upgradePlan(tier);
      addToast(`Upgraded to ${PLANS[tier].name}!`, "success");
      onClose();
    } catch {
      addToast("Failed to change plan. Please try again.", "error");
    } finally {
      setLoadingTier(null);
    }
  };

  const tierIndex = (tier: PlanTier) => PLAN_ORDER.indexOf(tier);

  return (
    <Modal open={isOpen} onClose={onClose} title="Change Plan" width="max-w-3xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {PLAN_ORDER.map((tier) => {
          const plan = PLANS[tier];
          const isCurrent = tier === currentPlan;
          const isUpgrade = tierIndex(tier) > currentIndex;
          const isDowngrade = tierIndex(tier) < currentIndex;

          return (
            <div
              key={tier}
              className={`border p-5 flex flex-col gap-3 rounded-lg ${
                isCurrent ? "border-brand bg-brand/5" : "border-border"
              }`}
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-heading text-[15px] font-semibold text-dark">
                    {plan.name}
                  </span>
                  {isCurrent && (
                    <span className="bg-brand/10 text-brand text-[10px] font-medium px-1.5 py-0.5">
                      Current Plan
                    </span>
                  )}
                </div>
                <p className="font-heading text-[22px] font-bold text-dark">
                  {plan.price === 0 ? "Free" : `$${plan.price}`}
                  {plan.price > 0 && (
                    <span className="text-[12px] font-normal text-gray">/mo</span>
                  )}
                </p>
              </div>

              <ul className="flex flex-col gap-1.5 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="text-[11px] text-gray leading-relaxed">
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSelectPlan(tier)}
                disabled={isCurrent || loadingTier !== null}
                className={`font-heading text-[13px] font-medium px-4 py-2.5 cursor-pointer transition-colors w-full ${
                  isCurrent
                    ? "bg-surface text-gray cursor-not-allowed"
                    : isUpgrade
                      ? "bg-brand text-white hover:bg-brand/90"
                      : "border border-border text-dark bg-white hover:bg-surface"
                } disabled:opacity-60`}
              >
                {loadingTier === tier ? (
                  <span className="animate-pulse">Processing...</span>
                ) : isCurrent ? (
                  "Current Plan"
                ) : isUpgrade ? (
                  "Upgrade"
                ) : isDowngrade ? (
                  "Downgrade"
                ) : (
                  "Select"
                )}
              </button>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}
