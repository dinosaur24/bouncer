"use client";

import { useState } from "react";
import {
  Check,
  ChevronDown,
  ArrowRight,
  Mail,
  Phone,
  Globe,
  Building2,
} from "lucide-react";

/* ─── Reusable Buttons ─── */

function ButtonPrimary({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      className={`bg-dark text-white font-heading text-[13px] font-medium px-5 py-2.5 cursor-pointer hover:bg-dark/90 transition-colors ${className}`}
    >
      {children}
    </button>
  );
}

function ButtonSecondary({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      className={`border border-border font-heading text-[13px] font-medium text-dark px-5 py-2.5 cursor-pointer hover:bg-surface transition-colors ${className}`}
    >
      {children}
    </button>
  );
}

function ButtonCTA({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      className={`bg-brand text-white font-heading text-[13px] font-medium px-5 py-2.5 cursor-pointer hover:bg-brand/90 transition-colors ${className}`}
    >
      {children}
    </button>
  );
}

/* ─── Icon Box ─── */

function IconBox({ icon: Icon }: { icon: React.ElementType }) {
  return (
    <div className="w-11 h-11 border border-border flex items-center justify-center">
      <Icon size={18} className="text-gray" />
    </div>
  );
}

/* ─── FAQ Item ─── */

function FAQItem({ question }: { question: string }) {
  const [open, setOpen] = useState(false);

  return (
    <button
      onClick={() => setOpen(!open)}
      className="flex items-center justify-between w-full py-5 border-b border-border text-left cursor-pointer"
    >
      <span className="font-heading text-sm font-medium text-dark">
        {question}
      </span>
      <ChevronDown
        size={16}
        className={`text-gray shrink-0 ml-4 transition-transform ${open ? "rotate-180" : ""}`}
      />
    </button>
  );
}

/* ─── Nav ─── */

function Nav() {
  return (
    <nav className="flex items-center justify-between px-12 py-4 border-b border-border">
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 bg-brand" />
        <span className="font-heading text-lg font-semibold text-dark">
          Bouncer
        </span>
      </div>
      <div className="flex items-center gap-8">
        {["How it works", "Pricing", "Docs", "Blog"].map((link) => (
          <a
            key={link}
            href="#"
            className="font-heading text-sm text-gray hover:text-dark transition-colors"
          >
            {link}
          </a>
        ))}
      </div>
      <div className="flex items-center gap-4">
        <a
          href="#"
          className="font-heading text-sm text-gray hover:text-dark transition-colors"
        >
          Login
        </a>
        <ButtonPrimary>Start for free</ButtonPrimary>
      </div>
    </nav>
  );
}

/* ─── Hero ─── */

function Hero() {
  return (
    <section className="flex items-center gap-16 px-12 py-20">
      {/* Left */}
      <div className="flex-1 flex flex-col gap-8">
        <h1 className="font-heading text-[56px] font-medium leading-[1.1] tracking-tight text-dark">
          Stop junk leads
          <br />
          before they hit
          <br />
          your CRM
        </h1>
        <p className="text-lg text-gray leading-relaxed">
          Real-time multi-signal lead validation via JavaScript snippet.
          <br />
          Catch fake emails, invalid phones, risky IPs, and ghost
          <br />
          companies — all in under 800ms.
        </p>
        <div className="flex items-center gap-3">
          <ButtonCTA>Start for free</ButtonCTA>
          <ButtonSecondary>See how it works</ButtonSecondary>
        </div>
        <p className="text-[13px] text-light-gray">
          250 validations/mo free · No credit card required
        </p>
      </div>

      {/* Right — Form Mockup + Score Panel */}
      <div className="w-[480px] flex flex-col">
        {/* Form */}
        <div className="bg-white border border-border p-6 flex flex-col gap-4">
          <h3 className="font-heading text-lg font-semibold text-dark">
            Contact Us
          </h3>
          {["Email", "Phone", "Company"].map((label) => (
            <div key={label} className="flex flex-col gap-1.5">
              <label className="text-[13px] text-gray">{label}</label>
              <div className="h-10 border border-border px-3 flex items-center">
                <span className="text-[13px] text-light-gray">
                  {label === "Email"
                    ? "jane@acme.co"
                    : label === "Phone"
                      ? "+1 (555) 234-5678"
                      : "Acme Inc."}
                </span>
              </div>
            </div>
          ))}
          <ButtonPrimary className="w-full">Submit</ButtonPrimary>
        </div>

        {/* Score Panel */}
        <div className="bg-surface border-x border-b border-border p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <span className="font-heading text-sm font-medium text-dark">
              Lead Quality Score
            </span>
            <span className="font-heading text-lg font-semibold text-dark">
              94/100
            </span>
          </div>
          <div className="w-full h-2 bg-border">
            <div className="h-full bg-brand" style={{ width: "94%" }} />
          </div>
          <div className="flex flex-col gap-2.5">
            {[
              "Email valid — deliverable address",
              "Phone valid — real mobile number",
              "IP clean — no VPN or proxy detected",
              "Domain verified — active company",
            ].map((text) => (
              <div key={text} className="flex items-center gap-2.5">
                <Check size={14} className="text-green shrink-0" />
                <span className="text-[13px] text-gray">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Dashboard Showcase ─── */

function DashboardShowcase() {
  return (
    <section
      className="px-20 pb-20"
      style={{
        background:
          "linear-gradient(to bottom, #FFFFFF 0%, #F0F0F0 30%, #E8E8E8 100%)",
      }}
    >
      <div className="flex items-center justify-center">
        <div
          className="w-[1280px] max-w-full h-[800px] border border-[#D0D0D0] bg-white overflow-hidden"
          style={{
            boxShadow:
              "0 24px 64px -4px rgba(0,0,0,0.2), 0 8px 24px -2px rgba(0,0,0,0.125)",
          }}
        >
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="font-heading text-2xl font-semibold text-dark mb-2">
                Dashboard Preview
              </div>
              <p className="text-sm text-gray">
                Replace with your dashboard screenshot
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── How It Works ─── */

const steps = [
  {
    num: "01",
    title: "Install snippet",
    desc: "Paste one <script> tag before </body> on your form page. Works with any framework.",
  },
  {
    num: "02",
    title: "Leads get scored",
    desc: "Every form submission is validated across 4 signals in real time. Results in under 800ms.",
  },
  {
    num: "03",
    title: "Clean data flows to CRM",
    desc: "Verified contacts sync automatically to HubSpot, Salesforce, or Pipedrive.",
  },
];

function HowItWorks() {
  return (
    <section className="px-12 py-20 flex flex-col gap-12">
      <div className="flex flex-col gap-2">
        <h2 className="font-heading text-[40px] font-medium tracking-tight text-dark">
          How it works
        </h2>
        <p className="text-sm text-gray">Three steps to cleaner CRM data</p>
      </div>
      <div className="grid grid-cols-3 gap-6">
        {steps.map((step) => (
          <div
            key={step.num}
            className="border border-border p-7 flex flex-col gap-5"
          >
            <span className="font-heading text-4xl font-semibold text-brand">
              {step.num}
            </span>
            <h3 className="font-heading text-lg font-semibold text-dark">
              {step.title}
            </h3>
            <p className="text-sm text-gray leading-relaxed">{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── Signal Breakdown ─── */

const signals = [
  {
    icon: Mail,
    title: "Email Validation",
    desc: "Catches disposable addresses, typos, and undeliverable mailboxes before they pollute your CRM.",
    weight: "Weight: 40%",
  },
  {
    icon: Phone,
    title: "Phone Validation",
    desc: "Detects invalid numbers, VoIP lines, and disconnected phones. Ensures your SDRs can actually connect.",
    weight: "Weight: 25%",
  },
  {
    icon: Globe,
    title: "IP Intelligence",
    desc: "Flags VPNs, data centers, TOR exit nodes, and high-risk geolocations that indicate bot or fraudulent traffic.",
    weight: "Weight: 20%",
  },
  {
    icon: Building2,
    title: "Company Domain",
    desc: "Verifies the company exists, has an active website, and the email domain matches. Filters out ghost companies.",
    weight: "Weight: 15%",
  },
];

function SignalBreakdown() {
  return (
    <section className="bg-surface px-12 py-20 flex flex-col gap-12">
      <div className="flex flex-col gap-2">
        <h2 className="font-heading text-[40px] font-medium tracking-tight text-dark">
          Four signals. One score.
        </h2>
        <p className="text-sm text-gray">
          Every lead validated simultaneously across email, phone, IP, and
          company domain
        </p>
      </div>
      <div className="grid grid-cols-2 gap-6">
        {signals.map((signal) => (
          <div
            key={signal.title}
            className="bg-white border border-border p-7 flex flex-col gap-4"
          >
            <IconBox icon={signal.icon} />
            <h3 className="font-heading text-lg font-semibold text-dark">
              {signal.title}
            </h3>
            <p className="text-sm text-gray leading-relaxed">{signal.desc}</p>
            <span className="text-[13px] font-medium text-brand">
              {signal.weight}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── Pricing ─── */

const tiers = [
  {
    name: "Free",
    price: "$0",
    sub: "For testing and small projects",
    features: [
      "250 validations/mo",
      "Email validation only",
      "1 CRM (webhook only)",
      "Community support",
    ],
    featured: false,
    featureStyle: "muted" as const,
    btnLabel: "Start for free",
  },
  {
    name: "Starter",
    price: "$49",
    sub: "For growing teams",
    features: [
      "2,500 validations/mo",
      "All 4 validation signals",
      "2 CRM integrations",
      "Email support",
    ],
    featured: false,
    featureStyle: "normal" as const,
    btnLabel: "Get started",
  },
  {
    name: "Growth",
    price: "$149",
    sub: "For scaling operations",
    features: [
      "15,000 validations/mo",
      "All 4 validation signals",
      "Unlimited CRM integrations",
      "Priority email support",
    ],
    featured: true,
    featureStyle: "normal" as const,
    btnLabel: "Get started",
  },
];

function Pricing() {
  return (
    <section className="px-12 py-20 flex flex-col items-center gap-12">
      <div className="flex flex-col items-center gap-2">
        <h2 className="font-heading text-[40px] font-medium tracking-tight text-dark">
          Simple, transparent pricing
        </h2>
        <p className="text-sm text-gray">
          Start free. Upgrade when you need more.
        </p>
      </div>
      <div className="grid grid-cols-3 gap-6 w-full h-[420px]">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={`p-7 flex flex-col justify-between h-full ${
              tier.featured
                ? "border-t-[3px] border-t-brand border-x border-b border-border"
                : "border border-border"
            }`}
          >
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="font-heading text-lg font-semibold text-dark">
                    {tier.name}
                  </span>
                  {tier.featured && (
                    <span className="bg-brand text-white text-[10px] font-semibold px-1.5 py-0.5 flex items-center justify-center">
                      POPULAR
                    </span>
                  )}
                </div>
                <span className="font-heading text-4xl font-semibold text-dark tracking-tight">
                  {tier.price}
                  <span className="text-base font-normal text-gray">/mo</span>
                </span>
                <span className="text-[13px] text-gray">{tier.sub}</span>
              </div>
              <div className="flex flex-col gap-3">
                {tier.features.map((feat) => (
                  <div key={feat} className="flex items-center gap-2">
                    <Check
                      size={14}
                      className={
                        tier.featureStyle === "muted"
                          ? "text-light-gray"
                          : "text-dark"
                      }
                    />
                    <span
                      className={`text-sm ${
                        tier.featureStyle === "muted"
                          ? "text-gray"
                          : "text-dark"
                      }`}
                    >
                      {feat}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            {tier.featured ? (
              <ButtonCTA className="w-full">{tier.btnLabel}</ButtonCTA>
            ) : (
              <ButtonSecondary className="w-full">
                {tier.btnLabel}
              </ButtonSecondary>
            )}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1.5 cursor-pointer group">
        <span className="font-heading text-[13px] font-medium text-gray group-hover:text-dark transition-colors">
          Need more? Contact us for Scale plan
        </span>
        <ArrowRight size={14} className="text-gray group-hover:text-dark transition-colors" />
      </div>
    </section>
  );
}

/* ─── FAQ ─── */

const faqQuestions = [
  "Is Bouncer GDPR compliant?",
  "How long does installation take?",
  "What about false positives?",
  "Does it slow down my forms?",
  "Which CRMs do you support?",
  "Can I use Bouncer on multiple forms?",
];

function FAQ() {
  return (
    <section className="px-12 py-20 flex flex-col items-center gap-12">
      <h2 className="font-heading text-[40px] font-medium tracking-tight text-dark">
        Frequently asked questions
      </h2>
      <div className="w-[720px] flex flex-col">
        {faqQuestions.map((q) => (
          <FAQItem key={q} question={q} />
        ))}
      </div>
    </section>
  );
}

/* ─── Final CTA ─── */

function FinalCTA() {
  return (
    <section className="bg-dark px-12 py-20 flex flex-col items-center gap-6">
      <h2 className="font-heading text-[40px] font-medium tracking-tight text-white text-center">
        Stop wasting budget on junk leads
      </h2>
      <p className="text-sm text-light-gray">
        Start validating in under 5 minutes. Free.
      </p>
      <ButtonCTA>Start for free</ButtonCTA>
      <p className="text-[13px] text-gray">
        No credit card required · 250 free validations/mo
      </p>
    </section>
  );
}

/* ─── Footer ─── */

function Footer() {
  return (
    <footer className="border-t border-border px-12 py-12 flex flex-col gap-12">
      <div className="flex justify-between">
        <div className="w-[300px] flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-brand" />
            <span className="font-heading text-lg font-semibold text-dark">
              Bouncer
            </span>
          </div>
          <p className="text-[13px] text-gray">
            Real-time multi-signal lead validation
          </p>
        </div>
        <div className="flex gap-20">
          {[
            { title: "Product", links: ["Pricing", "Docs", "API"] },
            { title: "Company", links: ["About", "Blog", "Changelog"] },
            { title: "Legal", links: ["Privacy", "Terms"] },
          ].map((col) => (
            <div key={col.title} className="flex flex-col gap-3">
              <span className="font-heading text-[13px] font-semibold text-dark">
                {col.title}
              </span>
              {col.links.map((link) => (
                <a
                  key={link}
                  href="#"
                  className="text-[13px] text-gray hover:text-dark transition-colors"
                >
                  {link}
                </a>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-border pt-4 flex justify-center">
        <span className="text-[13px] text-light-gray">
          © 2026 Bouncer. All rights reserved.
        </span>
      </div>
    </footer>
  );
}

/* ─── Page ─── */

export default function Home() {
  return (
    <main className="max-w-[1440px] mx-auto bg-white">
      <Nav />
      <Hero />
      <DashboardShowcase />
      <HowItWorks />
      <SignalBreakdown />
      <Pricing />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  );
}
