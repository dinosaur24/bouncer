"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Loader2 } from "lucide-react";
import { useOnboarding } from "@/contexts/OnboardingContext";

export default function CompanyProfilePage() {
  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [crm, setCrm] = useState("");

  const { saveCompanyProfile, isLoading } = useOnboarding();
  const router = useRouter();

  const handleContinue = async () => {
    if (!companyName.trim() || !website.trim()) return;
    await saveCompanyProfile({ companyName, website, teamSize, crm });
    router.push("/onboarding/2");
  };

  const isValid = companyName.trim() !== "" && website.trim() !== "";

  const inputClasses =
    "w-full border border-border rounded-lg px-4 py-2.5 text-[13px] text-dark font-heading bg-white focus:outline-none focus:border-dark transition-colors";

  return (
    <div>
      <h1 className="font-heading text-[28px] md:text-[32px] font-bold text-dark">
        Tell us about your company
      </h1>
      <p className="text-sm text-gray mt-2">
        This helps us tailor Bouncer to your needs.
      </p>

      <form className="mt-8 flex flex-col gap-5" onSubmit={(e) => { e.preventDefault(); handleContinue(); }}>
        {/* Company name */}
        <div>
          <label className="block text-[13px] font-heading font-medium text-dark mb-1.5">
            Company name
          </label>
          <input
            type="text"
            placeholder="Acme Corp."
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className={inputClasses}
          />
        </div>

        {/* Company website */}
        <div>
          <label className="block text-[13px] font-heading font-medium text-dark mb-1.5">
            Company website
          </label>
          <input
            type="text"
            placeholder="https://acme.com"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className={inputClasses}
          />
        </div>

        {/* Two side-by-side selects */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Team size */}
          <div>
            <label className="block text-[13px] font-heading font-medium text-dark mb-1.5">
              Team size
            </label>
            <div className="relative">
              <select
                value={teamSize}
                onChange={(e) => setTeamSize(e.target.value)}
                className={`${inputClasses} appearance-none pr-10`}
              >
                <option value="">Select size</option>
                <option value="1-10">1–10</option>
                <option value="11-50">11–50</option>
                <option value="51-200">51–200</option>
                <option value="200+">200+</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray pointer-events-none" />
            </div>
          </div>

          {/* Primary CRM */}
          <div>
            <label className="block text-[13px] font-heading font-medium text-dark mb-1.5">
              Primary CRM
            </label>
            <div className="relative">
              <select
                value={crm}
                onChange={(e) => setCrm(e.target.value)}
                className={`${inputClasses} appearance-none pr-10`}
              >
                <option value="">Select CRM</option>
                <option value="hubspot">HubSpot</option>
                <option value="salesforce">Salesforce</option>
                <option value="pipedrive">Pipedrive</option>
                <option value="other">Other</option>
                <option value="none">None</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Continue button */}
        <button
          type="submit"
          disabled={!isValid || isLoading}
          className="mt-6 w-full bg-dark text-white font-heading text-[13px] font-medium py-2.5 text-center block disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 rounded-lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Continue"
          )}
        </button>
      </form>
    </div>
  );
}
