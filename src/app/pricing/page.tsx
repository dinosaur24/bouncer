"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ChevronDown } from "lucide-react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const plans = [
  {
    name: "Free",
    monthlyPrice: 0,
    popular: false,
    features: [
      "250 validations/mo",
      "Email signal only",
      "1 form source",
      "Community support",
    ],
    cta: "Start free",
    ctaHref: "/signup",
    ctaStyle: "border" as const,
  },
  {
    name: "Starter",
    monthlyPrice: 49,
    popular: false,
    features: [
      "5,000 validations/mo",
      "All 4 signals",
      "3 form sources",
      "Email support",
    ],
    cta: "Get started",
    ctaHref: "/signup",
    ctaStyle: "border" as const,
  },
  {
    name: "Growth",
    monthlyPrice: 149,
    popular: true,
    features: [
      "15,000 validations/mo",
      "All 4 signals",
      "Unlimited CRM integrations",
      "Priority support",
      "Custom score weights",
    ],
    cta: "Get started",
    ctaHref: "/signup",
    ctaStyle: "brand" as const,
  },
  {
    name: "Scale",
    monthlyPrice: 349,
    popular: false,
    features: [
      "50,000 validations/mo",
      "Everything in Growth",
      "Dedicated account manager",
      "Priority phone support",
    ],
    cta: "Contact sales",
    ctaHref: "/signup",
    ctaStyle: "border" as const,
  },
];

const comparisonRows: { feature: string; values: string[] }[] = [
  { feature: "Validations/mo", values: ["250", "5K", "15K", "50K"] },
  { feature: "Email validation", values: ["\u2713", "\u2713", "\u2713", "\u2713"] },
  { feature: "Phone validation", values: ["\u2014", "\u2713", "\u2713", "\u2713"] },
  { feature: "IP intelligence", values: ["\u2014", "\u2713", "\u2713", "\u2713"] },
  { feature: "Company domain", values: ["\u2014", "\u2713", "\u2713", "\u2713"] },
  { feature: "Form sources", values: ["1", "3", "Unlimited", "Unlimited"] },
  { feature: "CRM integrations", values: ["\u2014", "1", "Unlimited", "Unlimited"] },
  { feature: "Custom score weights", values: ["\u2014", "\u2014", "\u2713", "\u2713"] },
  { feature: "API access", values: ["\u2014", "\u2014", "\u2713", "\u2713"] },
  { feature: "Support", values: ["Community", "Email", "Priority", "Dedicated"] },
];

const faqs = [
  {
    question: "Can I switch plans anytime?",
    answer:
      "Yes. You can upgrade or downgrade your plan at any time from your dashboard. Changes take effect immediately and your billing is prorated automatically.",
  },
  {
    question: "What happens when I hit my validation limit?",
    answer:
      "When you reach your monthly validation limit, new form submissions will pass through without validation. You\u2019ll receive an email notification at 80% and 100% usage so you can upgrade before that happens.",
  },
  {
    question: "Do you offer annual billing?",
    answer:
      "Yes. Annual billing gives you a 17% discount compared to monthly pricing. You can switch to annual billing at any time from the billing section in your dashboard.",
  },
  {
    question: "Is there a free trial?",
    answer:
      "Every account starts on our Free plan with 250 validations per month \u2014 no credit card required. You can upgrade to a paid plan whenever you\u2019re ready.",
  },
  {
    question: "Do you support custom enterprise plans?",
    answer:
      "Absolutely. If you need more than 50,000 validations per month, custom SLAs, or dedicated infrastructure, reach out to our sales team and we\u2019ll put together a plan that fits.",
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function PricingPage() {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  function price(monthly: number) {
    if (monthly === 0) return 0;
    return billing === "annual" ? monthly * 10 : monthly;
  }

  function priceLabel(monthly: number) {
    if (monthly === 0) return "$0";
    if (billing === "annual") return `$${(monthly * 10).toLocaleString()}`;
    return `$${monthly}`;
  }

  function priceSuffix(monthly: number) {
    if (monthly === 0) return "/mo";
    return billing === "annual" ? "/yr" : "/mo";
  }

  return (
    <div className="max-w-[1440px] mx-auto bg-white">
      {/* ---- Nav ---- */}
      <Nav />

      {/* ---- Header ---- */}
      <section className="px-5 py-12 md:px-12 md:py-20 flex flex-col items-center gap-6">
        <h1 className="font-heading text-[28px] md:text-[40px] font-medium tracking-tight text-dark text-center">
          Simple, transparent pricing
        </h1>

        <div className="flex items-center gap-3">
          <div className="border border-border inline-flex">
            <button
              onClick={() => setBilling("monthly")}
              className={`font-heading text-[13px] font-medium px-4 py-2 cursor-pointer transition-colors ${
                billing === "monthly"
                  ? "bg-dark text-white"
                  : "text-gray hover:text-dark"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling("annual")}
              className={`font-heading text-[13px] font-medium px-4 py-2 cursor-pointer transition-colors ${
                billing === "annual"
                  ? "bg-dark text-white"
                  : "text-gray hover:text-dark"
              }`}
            >
              Annual
            </button>
          </div>

          {billing === "annual" && (
            <span className="bg-brand text-white text-[11px] font-heading font-medium px-2 py-0.5">
              Save 17%
            </span>
          )}
        </div>
      </section>

      {/* ---- Pricing Cards ---- */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 px-5 md:px-12">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`border border-border p-5 md:p-7 flex flex-col gap-5 ${
              plan.popular ? "border-t-[3px] border-t-brand" : ""
            }`}
          >
            {/* Name + badge */}
            <div className="flex items-center gap-2">
              <span className="font-heading text-lg font-semibold text-dark">
                {plan.name}
              </span>
              {plan.popular && (
                <span className="bg-brand text-white text-[10px] font-heading font-medium px-1.5 py-0.5 uppercase tracking-wide">
                  Popular
                </span>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-1">
              <span className="font-heading text-4xl font-semibold text-dark">
                {priceLabel(plan.monthlyPrice)}
              </span>
              <span className="text-gray text-sm">
                {priceSuffix(plan.monthlyPrice)}
              </span>
            </div>

            {/* Features */}
            <ul className="flex flex-col gap-2.5 flex-1">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <Check
                    size={16}
                    className="text-dark mt-0.5 shrink-0"
                  />
                  <span className="text-[13px] text-gray">{feature}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            {plan.ctaStyle === "brand" ? (
              <Link
                href={plan.ctaHref}
                className="bg-brand text-white font-heading text-[13px] font-medium px-5 py-2.5 text-center hover:bg-brand/90 transition-colors"
              >
                {plan.cta}
              </Link>
            ) : (
              <Link
                href={plan.ctaHref}
                className="border border-border text-dark font-heading text-[13px] font-medium px-5 py-2.5 text-center hover:bg-surface transition-colors"
              >
                {plan.cta}
              </Link>
            )}
          </div>
        ))}
      </section>

      {/* ---- Feature Comparison Table ---- */}
      <section className="px-5 md:px-12 mt-12">
        <h2 className="font-heading text-[22px] md:text-[28px] font-medium tracking-tight text-dark mb-6">
          Compare all features
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-[13px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 pr-4 font-heading font-semibold text-dark">
                  Feature
                </th>
                {plans.map((plan) => (
                  <th
                    key={plan.name}
                    className="text-left py-3 pr-4 font-heading font-semibold text-dark"
                  >
                    {plan.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row) => (
                <tr key={row.feature} className="border-b border-border">
                  <td className="py-3 pr-4 text-gray">{row.feature}</td>
                  {row.values.map((val, i) => (
                    <td key={i} className="py-3 pr-4 text-dark">
                      {val}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ---- FAQ ---- */}
      <section className="px-5 py-12 md:px-12 md:py-20 flex flex-col items-center">
        <h2 className="font-heading text-[22px] md:text-[28px] font-medium tracking-tight text-dark text-center mb-8">
          Frequently asked questions
        </h2>

        <div className="w-full md:w-[720px]">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b border-border">
              <button
                onClick={() =>
                  setOpenFaq(openFaq === index ? null : index)
                }
                className="w-full flex items-center justify-between py-5 cursor-pointer text-left"
              >
                <span className="font-heading text-[15px] font-medium text-dark pr-4">
                  {faq.question}
                </span>
                <ChevronDown
                  size={18}
                  className={`text-gray shrink-0 transition-transform ${
                    openFaq === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openFaq === index && (
                <p className="text-[13px] text-gray pb-5 leading-relaxed">
                  {faq.answer}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ---- CTA Banner ---- */}
      <section className="bg-dark px-5 py-12 md:px-12 md:py-20 flex flex-col items-center gap-4 text-center">
        <h2 className="font-heading text-[28px] md:text-[40px] font-medium tracking-tight text-white">
          Ready to clean up your leads?
        </h2>
        <p className="text-light-gray text-[15px] max-w-md">
          Start validating leads in under five minutes. No credit card required
          on the free plan.
        </p>
        <Link
          href="/signup"
          className="bg-brand text-white font-heading text-[13px] font-medium px-6 py-3 mt-2 hover:bg-brand/90 transition-colors inline-block"
        >
          Start for free
        </Link>
      </section>

      {/* ---- Footer ---- */}
      <Footer />
    </div>
  );
}
