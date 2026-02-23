"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check } from "lucide-react";
import { useOnboarding } from "@/contexts/OnboardingContext";

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
  const [connectingProvider, setConnectingProvider] = useState<string | null>(null);

  const { connectCRM, skipCRM, state, isLoading } = useOnboarding();
  const router = useRouter();

  const handleConnect = async (provider: string) => {
    setConnectingProvider(provider);
    await connectCRM(provider);
    router.push("/onboarding/4");
  };

  const handleSkip = () => {
    skipCRM();
    router.push("/onboarding/4");
  };

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
            disabled={isLoading}
            className={`border p-4 flex items-center gap-4 cursor-pointer transition-colors text-left ${
              selectedCRM === crm.id
                ? "border-brand border-2"
                : "border-border"
            } ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
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
                {state.crmConnected === crm.id && (
                  <span className="bg-green/10 text-green text-xs font-heading font-medium px-2 py-0.5 rounded flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Connected
                  </span>
                )}
              </div>
              <p className="text-[13px] text-gray mt-0.5">
                {crm.description}
              </p>
            </div>

            {/* Loading spinner for the connecting card */}
            {connectingProvider === crm.id && isLoading && (
              <Loader2 className="w-5 h-5 animate-spin text-gray shrink-0" />
            )}
          </button>
        ))}
      </div>

      {/* Connect & continue button */}
      <button
        onClick={() => handleConnect(selectedCRM)}
        disabled={isLoading}
        className="mt-8 w-full bg-dark text-white font-heading text-[13px] font-medium py-2.5 text-center block disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Connecting...
          </>
        ) : (
          "Connect & continue"
        )}
      </button>

      {/* Skip for now */}
      <button
        onClick={handleSkip}
        disabled={isLoading}
        className="mt-3 block w-full text-center text-sm text-gray hover:text-dark transition-colors disabled:opacity-50"
      >
        Skip for now
      </button>
    </div>
  );
}
