"use client";

const chartData = [
  { day: "Mon", passed: 150, borderline: 35, rejected: 20 },
  { day: "Tue", passed: 180, borderline: 30, rejected: 18 },
  { day: "Wed", passed: 120, borderline: 45, rejected: 35 },
  { day: "Thu", passed: 200, borderline: 25, rejected: 15 },
  { day: "Fri", passed: 170, borderline: 40, rejected: 28 },
  { day: "Sat", passed: 100, borderline: 20, rejected: 12 },
  { day: "Sun", passed: 75, borderline: 15, rejected: 10 },
];

const maxTotal = Math.max(
  ...chartData.map((d) => d.passed + d.borderline + d.rejected)
);

const rejectionReasons = [
  { label: "Invalid email format", pct: 34, fill: 110 },
  { label: "Disposable domain", pct: 28, fill: 90 },
  { label: "Suspicious IP", pct: 19, fill: 62 },
  { label: "Phone mismatch", pct: 12, fill: 40 },
  { label: "Blacklisted domain", pct: 7, fill: 23 },
];

export default function AnalyticsPage() {
  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-[28px] font-bold tracking-tight leading-tight">
            Analytics
          </h1>
          <p className="text-sm text-gray">
            Detailed validation performance insights
          </p>
        </div>

        <div className="flex items-center">
          <button className="bg-dark text-white font-heading text-[13px] font-medium px-4 py-2 cursor-pointer">
            Last 30 days
          </button>
          <button className="border border-border font-heading text-[13px] font-medium px-4 py-2 text-dark cursor-pointer bg-white">
            Last 7 days
          </button>
          <button className="border border-border border-l-0 font-heading text-[13px] font-medium px-4 py-2 text-dark cursor-pointer bg-white">
            Custom
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        {/* Total validated */}
        <div className="border border-border p-5">
          <span className="text-[11px] text-[#999999] uppercase tracking-wider">
            Total validated
          </span>
          <div className="font-heading text-2xl font-bold mt-2 text-dark">
            48,291
          </div>
          <span className="text-[11px] text-green">+12.4% vs prev. period</span>
        </div>

        {/* Passed */}
        <div className="border border-border p-5">
          <span className="text-[11px] text-[#999999] uppercase tracking-wider">
            Passed
          </span>
          <div className="font-heading text-2xl font-bold mt-2 text-green">
            38,633
          </div>
          <span className="text-[11px] text-gray">80.0% pass rate</span>
        </div>

        {/* Borderline */}
        <div className="border border-border p-5">
          <span className="text-[11px] text-[#999999] uppercase tracking-wider">
            Borderline
          </span>
          <div className="font-heading text-2xl font-bold mt-2 text-[#F59E0B]">
            5,795
          </div>
          <span className="text-[11px] text-gray">12.0% of total</span>
        </div>

        {/* Rejected */}
        <div className="border border-border p-5">
          <span className="text-[11px] text-[#999999] uppercase tracking-wider">
            Rejected
          </span>
          <div className="font-heading text-2xl font-bold mt-2 text-brand">
            3,863
          </div>
          <span className="text-[11px] text-gray">8.0% of total</span>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="flex gap-6 flex-1 min-h-0">
        {/* Volume Chart */}
        <div className="flex-1 border border-border p-7 flex flex-col">
          {/* Chart Header */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-heading text-lg font-semibold">
              Validation Volume
            </h2>
            <div className="flex items-center gap-4">
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
              const total = bar.passed + bar.borderline + bar.rejected;
              const heightPct = (total / maxTotal) * 100;
              const passedPct = (bar.passed / total) * 100;
              const borderlinePct = (bar.borderline / total) * 100;
              const rejectedPct = (bar.rejected / total) * 100;

              return (
                <div
                  key={bar.day}
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
        <div className="w-[380px] border border-border p-7 flex flex-col">
          <h2 className="font-heading text-base font-semibold mb-6">
            Rejection Reasons
          </h2>

          <div className="flex flex-col gap-4">
            {rejectionReasons.map((item) => (
              <div key={item.label} className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-dark">{item.label}</span>
                  <span className="font-heading text-[13px] font-semibold text-brand">
                    {item.pct}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#F0F0F0] rounded-sm">
                  <div
                    className="h-full bg-brand rounded-sm"
                    style={{ width: `${item.fill}px` }}
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
