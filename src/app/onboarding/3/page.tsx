"use client";

import { useState } from "react";
import Link from "next/link";

const crms = [
  {
    id: "hubspot",
    name: "HubSpot",
    description: "Connect to your HubSpot account",
    color: "#FF7A59",
    letter: "H",
    recommended: true,
  },
  {
    id: "salesforce",
    name: "Salesforce",
    description: "Connect to your Salesforce account",
    color: "#0176D3",
    letter: "S",
    recommended: false,
  },
  {
    id: "pipedrive",
    name: "Pipedrive",
    description: "Connect to your Pipedrive account",
    color: "#0D0D0D",
    letter: "P",
    recommended: false,
  },
];

export default function ConnectCRMPage() {
  const [selectedCRM, setSelectedCRM] = useState("hubspot");

  return (
    <div>
      <h1 className="font-heading text-[28px] md:text-[32px] font-bold text-dark">
        Connect your CRM
      </h1>
      <p className="text-sm text-gray mt-2">
        Bouncer will push validated leads directly to your CRM.
      </p>

      {/* CRM cards */}
      <div className="mt-8 flex flex-col gap-3">
        {crms.map((crm) => (
          <button
            key={crm.id}
            onClick={() => setSelectedCRM(crm.id)}
            className={`border p-4 flex items-center gap-4 cursor-pointer transition-colors text-left ${
              selectedCRM === crm.id
                ? "border-brand border-2"
                : "border-border"
            }`}
          >
            {/* Icon */}
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-heading font-bold text-base shrink-0"
              style={{ backgroundColor: crm.color }}
            >
              {crm.letter}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-heading text-sm font-semibold text-dark">
                  {crm.name}
                </span>
                {crm.recommended && (
                  <span className="bg-brand/10 text-brand text-xs font-heading font-medium px-2 py-0.5 rounded">
                    Recommended
                  </span>
                )}
              </div>
              <p className="text-[13px] text-gray mt-0.5">
                {crm.description}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Connect & continue button */}
      <Link
        href="/onboarding/4"
        className="mt-8 w-full bg-dark text-white font-heading text-[13px] font-medium py-2.5 text-center block"
      >
        Connect & continue
      </Link>

      {/* Skip for now */}
      <Link
        href="/onboarding/4"
        className="mt-3 block text-center text-sm text-gray hover:text-dark transition-colors"
      >
        Skip for now
      </Link>
    </div>
  );
}
