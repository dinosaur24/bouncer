"use client";

const invoices = [
  { date: "Feb 15, 2026", amount: "$149.00", status: "Paid" },
  { date: "Jan 15, 2026", amount: "$149.00", status: "Paid" },
  { date: "Dec 15, 2025", amount: "$149.00", status: "Paid" },
];

export default function BillingPage() {
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
                Growth Plan
              </h3>
              <span className="bg-green/10 text-green text-xs font-medium px-2 py-0.5">
                Active
              </span>
            </div>
            <p className="font-heading text-[24px] font-bold text-dark">
              $149
              <span className="text-[13px] font-normal text-gray">/month</span>
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 text-[13px] text-gray">
          <span>Feb 1 – Feb 28, 2026</span>
          <span className="hidden md:inline">·</span>
          <span>Next billing: Mar 1, 2026</span>
          <span className="hidden md:inline">·</span>
          <span>Payment: Visa ending 4242</span>
        </div>

        <div className="flex gap-4">
          <button className="text-[13px] text-dark font-heading font-medium hover:underline cursor-pointer">
            Change plan
          </button>
          <button className="text-[13px] text-brand font-heading font-medium hover:underline cursor-pointer">
            Cancel subscription
          </button>
        </div>
      </div>

      {/* Usage */}
      <div className="flex flex-col gap-4">
        <h3 className="font-heading text-[15px] font-semibold text-dark">
          Usage this period
        </h3>
        <div className="flex items-baseline gap-1">
          <span className="font-heading text-[32px] font-bold text-dark">
            8,432
          </span>
          <span className="text-sm text-gray">/ 15,000</span>
        </div>
        <div className="w-full h-2 bg-surface overflow-hidden">
          <div
            className="h-full bg-brand"
            style={{ width: "56.2%" }}
          />
        </div>
        <p className="text-xs text-gray">
          56% used · Resets Mar 1, 2026
        </p>
      </div>

      {/* Invoices */}
      <div className="flex flex-col gap-4">
        <h3 className="font-heading text-[15px] font-semibold text-dark">
          Recent invoices
        </h3>

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
              key={inv.date}
              className="grid grid-cols-4 py-3 border-b border-border items-center"
            >
              <span className="text-[13px] text-dark font-heading">
                {inv.date}
              </span>
              <span className="text-[13px] text-dark font-heading">
                {inv.amount}
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
              key={inv.date}
              className="border border-border p-4 flex justify-between items-center"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-[13px] font-heading text-dark">
                  {inv.date}
                </span>
                <span className="text-xs text-gray">{inv.amount}</span>
              </div>
              <span className="text-xs text-green font-medium">
                {inv.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Change plan button */}
      <div>
        <button className="border border-border text-dark font-heading text-[13px] font-medium px-5 py-2.5 hover:bg-surface cursor-pointer w-full md:w-auto">
          Change plan
        </button>
      </div>
    </>
  );
}
