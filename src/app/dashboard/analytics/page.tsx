"use client";

import { useValidations } from "@/contexts/ValidationContext";
import { DateFilter } from "@/components/DateFilter";

export default function AnalyticsPage() {
  const { stats, chartData, rejectionReasons, validations } = useValidations();

  const totalValidated = stats.totalValidations;
  const passed = validations.filter(v => v.status === 'Passed').length;
  const borderline = validations.filter(v => v.status === 'Borderline').length;
  const rejected = validations.filter(v => v.status === 'Rejected').length;
  const total = validations.length || 1;

  const passedPctOfTotal = Math.round((passed / total) * 100);
  const borderlinePctOfTotal = Math.round((borderline / total) * 100);
  const rejectedPctOfTotal = Math.round((rejected / total) * 100);

  const maxTotal = Math.max(
    ...chartData.map((d) => d.passed + d.borderline + d.rejected),
    1
  );

  return (
    <>
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-[28px] font-bold tracking-tight leading-tight">
            Analytics
          </h1>
          <p className="text-sm text-gray">
            Detailed validation performance insights
          </p>
        </div>

        <DateFilter />
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total validated */}
        <div className="border border-border rounded-lg p-5">
          <span className="text-[11px] text-[#999999] uppercase tracking-wider">
            Total validated
          </span>
          <div className="font-heading text-2xl font-bold mt-2 text-dark">
            {totalValidated.toLocaleString()}
          </div>
          <span className="text-[11px] text-green">+{stats.totalChange}% vs prev. period</span>
        </div>

        {/* Passed */}
        <div className="border border-border rounded-lg p-5">
          <span className="text-[11px] text-[#999999] uppercase tracking-wider">
            Passed
          </span>
          <div className="font-heading text-2xl font-bold mt-2 text-green">
            {passed.toLocaleString()}
          </div>
          <span className="text-[11px] text-gray">{passedPctOfTotal}% pass rate</span>
        </div>

        {/* Borderline */}
        <div className="border border-border rounded-lg p-5">
          <span className="text-[11px] text-[#999999] uppercase tracking-wider">
            Borderline
          </span>
          <div className="font-heading text-2xl font-bold mt-2 text-[#F59E0B]">
            {borderline.toLocaleString()}
          </div>
          <span className="text-[11px] text-gray">{borderlinePctOfTotal}% of total</span>
        </div>

        {/* Rejected */}
        <div className="border border-border rounded-lg p-5">
          <span className="text-[11px] text-[#999999] uppercase tracking-wider">
            Rejected
          </span>
          <div className="font-heading text-2xl font-bold mt-2 text-brand">
            {rejected.toLocaleString()}
          </div>
          <span className="text-[11px] text-gray">{rejectedPctOfTotal}% of total</span>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="flex flex-col md:flex-row gap-6 flex-1 min-h-0">
        {/* Volume Chart */}
        <div className="flex-1 border border-border rounded-lg p-5 md:p-7 flex flex-col">
          {/* Chart Header */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-8">
            <h2 className="font-heading text-lg font-semibold">
              Validation Volume
            </h2>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: "#22C55E" }}
                />
                <span className="text-[13px] text-gray">Passed</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: "#F59E0B" }}
                />
                <span className="text-[13px] text-gray">Borderline</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: "#E42313" }}
                />
                <span className="text-[13px] text-gray">Rejected</span>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="flex-1 flex items-end gap-6 justify-between">
            {chartData.map((bar) => {
              const barTotal = bar.passed + bar.borderline + bar.rejected;
              const heightPct = (barTotal / maxTotal) * 100;
              const passedPct = barTotal > 0 ? (bar.passed / barTotal) * 100 : 0;
              const borderlinePct = barTotal > 0 ? (bar.borderline / barTotal) * 100 : 0;
              const rejectedPct = barTotal > 0 ? (bar.rejected / barTotal) * 100 : 0;

              return (
                <div
                  key={bar.date}
                  className="flex-1 flex flex-col items-center gap-3"
                >
                  <div
                    className="w-full flex flex-col rounded-sm overflow-hidden"
                    style={{ height: `${heightPct * 2.8}px` }}
                  >
                    <div
                      style={{
                        backgroundColor: "#22C55E",
                        height: `${passedPct}%`,
                      }}
                    />
                    <div
                      style={{
                        backgroundColor: "#F59E0B",
                        height: `${borderlinePct}%`,
                      }}
                    />
                    <div
                      style={{
                        backgroundColor: "#E42313",
                        height: `${rejectedPct}%`,
                      }}
                    />
                  </div>
                  <span className="text-[13px] text-gray">{bar.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rejection Reasons */}
        <div className="w-full md:w-[380px] border border-border rounded-lg p-5 md:p-7 flex flex-col">
          <h2 className="font-heading text-base font-semibold mb-6">
            Rejection Reasons
          </h2>

          <div className="flex flex-col gap-4">
            {rejectionReasons.map((item) => (
              <div key={item.label} className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-dark">{item.label}</span>
                  <span className="font-heading text-[13px] font-semibold text-brand">
                    {item.percentage}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#F0F0F0] rounded-sm">
                  <div
                    className="h-full bg-brand rounded-sm"
                    style={{ width: `${item.percentage * 3.2}px` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
