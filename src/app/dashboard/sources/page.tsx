"use client";

const sources = [
  {
    title: "Contact Form",
    status: "Active" as const,
    description:
      "Main website contact form with name, email, phone, and company fields",
    submissions: "3,847",
    passRate: "86%",
    avgScore: "74",
    lastSubmission: "2m ago",
  },
  {
    title: "Newsletter Signup",
    status: "Active" as const,
    description: "Email-only signup form on blog and resource pages",
    submissions: "12,453",
    passRate: "91%",
    avgScore: "81",
    lastSubmission: "5m ago",
  },
  {
    title: "Demo Request",
    status: "Active" as const,
    description:
      "Enterprise demo booking form with detailed qualification fields",
    submissions: "892",
    passRate: "78%",
    avgScore: "68",
    lastSubmission: "18m ago",
  },
  {
    title: "Webinar Registration",
    status: "Paused" as const,
    description: "Event registration form for monthly webinar series",
    submissions: "2,156",
    passRate: "83%",
    avgScore: "71",
    lastSubmission: "2h ago",
  },
  {
    title: "API Endpoint",
    status: "Active" as const,
    description:
      "/api/v1/validate direct integration for custom forms",
    submissions: "8,721",
    passRate: "88%",
    avgScore: "76",
    lastSubmission: "30s ago",
  },
];

export default function SourcesPage() {
  return (
    <>
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-[28px] font-bold text-dark">
            Sources
          </h1>
          <p className="text-sm text-gray">
            Manage your form and API validation sources
          </p>
        </div>

        <button className="bg-dark text-white font-heading text-[13px] font-medium px-5 py-2.5 cursor-pointer hover:bg-dark/90 transition-colors">
          Add Source
        </button>
      </div>

      {/* Sources Grid */}
      <div className="grid grid-cols-3 gap-6">
        {sources.map((source) => (
          <div
            key={source.title}
            className="border border-border p-6 flex flex-col gap-4"
          >
            {/* Top Row */}
            <div className="flex justify-between items-start">
              <span className="font-heading text-[15px] font-semibold text-dark">
                {source.title}
              </span>
              <span
                className={`text-[11px] font-medium px-2.5 py-0.5 ${
                  source.status === "Active"
                    ? "bg-[#F0FDF4] text-[#22C55E]"
                    : "bg-[#FFFBEB] text-[#F59E0B]"
                }`}
              >
                {source.status}
              </span>
            </div>

            {/* Description */}
            <p className="text-[13px] text-gray leading-relaxed">
              {source.description}
            </p>

            {/* Stats Row */}
            <div className="flex gap-8">
              <div className="flex flex-col gap-1">
                <span className="text-[11px] text-[#999999] uppercase tracking-wide">
                  Submissions
                </span>
                <span className="font-heading text-lg font-semibold text-dark">
                  {source.submissions}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] text-[#999999] uppercase tracking-wide">
                  Pass rate
                </span>
                <span className="font-heading text-lg font-semibold text-dark">
                  {source.passRate}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] text-[#999999] uppercase tracking-wide">
                  Avg score
                </span>
                <span className="font-heading text-lg font-semibold text-dark">
                  {source.avgScore}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-border pt-4 mt-auto flex justify-between items-center">
              <span className="text-[11px] text-[#999999]">
                Last submission {source.lastSubmission}
              </span>
              <span className="text-brand text-[13px] font-medium cursor-pointer hover:underline">
                Edit &rarr;
              </span>
            </div>
          </div>
        ))}

        {/* Add New Source Card */}
        <div className="border border-dashed border-[#D0D0D0] p-6 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-gray transition-colors">
          <div className="w-10 h-10 border border-border flex items-center justify-center">
            <span className="text-gray text-xl">+</span>
          </div>
          <span className="text-[13px] text-gray font-medium">
            Add new source
          </span>
        </div>
      </div>
    </>
  );
}
