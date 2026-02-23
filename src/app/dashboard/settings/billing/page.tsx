"use client";

import { useState } from "react";
import { useBilling } from "@/contexts/BillingContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/Toast";
import { UpgradeModal } from "@/components/UpgradeModal";
import { Modal } from "@/components/Modal";

export default function BillingPage() {
  const { currentPlan, usage, invoices, isLoading, cancelPlan } = useBilling();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const plan = user?.plan ?? "free";

  const handleCancel = async () => {
    try {
      await cancelPlan();
      addToast("Subscription cancelled. You are now on the Free plan.", "success");
      setShowCancelConfirm(false);
    } catch {
      addToast("Failed to cancel subscription. Please try again.", "error");
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const formatAmount = (amount: number) => {
    return amount === 0 ? "$0.00" : `$${amount.toFixed(2)}`;
  };

  return (
    <>
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-[28px] font-bold text-dark">
          Billing
        </h1>
        <p className="text-sm text-gray">
          Manage your plan and payments
        </p>
      </div>

      {/* Current Plan */}
      <div className="border border-border p-5 md:p-6 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2.5">
              <h3 className="font-heading text-[15px] font-semibold text-dark">
                {currentPlan.name} Plan
              </h3>
              <span className="bg-green/10 text-green text-xs font-medium px-2 py-0.5">
                Active
              </span>
            </div>
            <p className="font-heading text-[24px] font-bold text-dark">
              {currentPlan.price === 0 ? "Free" : `$${currentPlan.price}`}
              {currentPlan.price > 0 && (
                <span className="text-[13px] font-normal text-gray">/month</span>
              )}
            </p>
          </div>
        </div>

        {currentPlan.price > 0 && (
          <div className="flex flex-col md:flex-row gap-4 text-[13px] text-gray">
            <span>Feb 1 – Feb 28, 2026</span>
            <span className="hidden md:inline">&middot;</span>
            <span>Next billing: Mar 1, 2026</span>
            <span className="hidden md:inline">&middot;</span>
            <span>Payment: Visa ending 4242</span>
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={() => setShowUpgrade(true)}
            className="text-[13px] text-dark font-heading font-medium hover:underline cursor-pointer"
          >
            Change plan
          </button>
          {plan !== "free" && (
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="text-[13px] text-brand font-heading font-medium hover:underline cursor-pointer"
            >
              Cancel subscription
            </button>
          )}
        </div>
      </div>

      {/* Usage */}
      <div className="flex flex-col gap-4">
        <h3 className="font-heading text-[15px] font-semibold text-dark">
          Usage this period
        </h3>
        <div className="flex items-baseline gap-1">
          <span className="font-heading text-[32px] font-bold text-dark">
            {usage.used.toLocaleString()}
          </span>
          <span className="text-sm text-gray">
            / {usage.limit >= 999999 ? "Unlimited" : usage.limit.toLocaleString()}
          </span>
        </div>
        <div className="w-full h-2 bg-surface overflow-hidden">
          <div
            className="h-full bg-brand"
            style={{ width: `${Math.min(usage.percentage, 100)}%` }}
          />
        </div>
        <p className="text-xs text-gray">
          {usage.percentage}% used &middot; Resets Mar 1, 2026
        </p>
      </div>

      {/* Invoices */}
      <div className="flex flex-col gap-4">
        <h3 className="font-heading text-[15px] font-semibold text-dark">
          Recent invoices
        </h3>

        {invoices.length === 0 ? (
          <p className="text-[13px] text-gray">No invoices yet.</p>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block">
              <div className="grid grid-cols-4 py-2.5 border-b border-border text-xs text-gray font-heading">
                <span>Date</span>
                <span>Amount</span>
                <span>Status</span>
                <span></span>
              </div>
              {invoices.map((inv) => (
                <div
                  key={inv.id}
                  className="grid grid-cols-4 py-3 border-b border-border items-center"
                >
                  <span className="text-[13px] text-dark font-heading">
                    {formatDate(inv.date)}
                  </span>
                  <span className="text-[13px] text-dark font-heading">
                    {formatAmount(inv.amount)}
                  </span>
                  <span className="text-xs text-green font-medium">
                    {inv.status}
                  </span>
                  <button className="text-[13px] text-brand font-heading font-medium hover:underline cursor-pointer text-left">
                    Download
                  </button>
                </div>
              ))}
            </div>

            {/* Mobile cards */}
            <div className="md:hidden flex flex-col gap-3">
              {invoices.map((inv) => (
                <div
                  key={inv.id}
                  className="border border-border p-4 flex justify-between items-center"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[13px] font-heading text-dark">
                      {formatDate(inv.date)}
                    </span>
                    <span className="text-xs text-gray">{formatAmount(inv.amount)}</span>
                  </div>
                  <span className="text-xs text-green font-medium">
                    {inv.status}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Change plan button */}
      <div>
        <button
          onClick={() => setShowUpgrade(true)}
          className="border border-border text-dark font-heading text-[13px] font-medium px-5 py-2.5 hover:bg-surface cursor-pointer w-full md:w-auto"
        >
          Change plan
        </button>
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} />

      {/* Cancel Confirmation Modal */}
      <Modal
        open={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        title="Cancel Subscription"
      >
        <div className="flex flex-col gap-6">
          <p className="text-[13px] text-gray leading-relaxed">
            Are you sure you want to cancel your {currentPlan.name} plan? You will be
            downgraded to the Free plan with a limit of 250 validations per month.
          </p>
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => setShowCancelConfirm(false)}
              className="border border-border text-dark font-heading text-[13px] font-medium px-5 py-2.5 cursor-pointer bg-white hover:bg-surface transition-colors"
            >
              Keep plan
            </button>
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="bg-brand text-white font-heading text-[13px] font-medium px-5 py-2.5 cursor-pointer hover:bg-brand/90 transition-colors border-none disabled:opacity-60"
            >
              {isLoading ? (
                <span className="animate-pulse">Cancelling...</span>
              ) : (
                "Cancel subscription"
              )}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
