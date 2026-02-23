"use client";

import { usePathname } from "next/navigation";
import { Check } from "lucide-react";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const currentStep = parseInt(pathname.split("/").pop() || "1", 10);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Top bar */}
      <div className="p-6 md:p-8">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-brand rounded-[4px]" />
          <span className="font-heading text-base font-semibold text-dark">
            Bouncer
          </span>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-0 my-8 md:my-12">
        {[1, 2, 3, 4].map((step, index) => (
          <div key={step} className="flex items-center">
            {/* Step circle */}
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-heading font-medium ${
                step < currentStep
                  ? "bg-green text-white"
                  : step === currentStep
                    ? "bg-dark text-white"
                    : "bg-border text-gray"
              }`}
            >
              {step < currentStep ? (
                <Check className="w-3.5 h-3.5" strokeWidth={3} />
              ) : (
                step
              )}
            </div>

            {/* Connecting line */}
            {index < 3 && (
              <div
                className={`w-8 md:w-12 h-0.5 ${
                  step < currentStep ? "bg-green" : "bg-border"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Content area */}
      <div className="max-w-[480px] w-full mx-auto px-5 md:px-0 flex-1">
        {children}
      </div>
    </div>
  );
}
