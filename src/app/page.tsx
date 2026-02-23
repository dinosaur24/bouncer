"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Check,
  ChevronDown,
  ArrowRight,
  Mail,
  Phone,
  Globe,
  Building2,
} from "lucide-react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

/* ─── Reusable Buttons ─── */

function ButtonPrimary({
  children,
  className = "",
  href,
}: {
  children: React.ReactNode;
  className?: string;
  href?: string;
}) {
  const classes = `bg-dark text-white font-heading text-[13px] font-medium px-5 py-2.5 rounded-lg cursor-pointer hover:bg-dark/90 transition-colors inline-block text-center ${className}`;
  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <button className={classes}>
      {children}
    </button>
  );
}

function ButtonSecondary({
  children,
  className = "",
  onClick,
  href,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  href?: string;
}) {
  const classes = `border border-border rounded-lg font-heading text-[13px] font-medium text-dark px-5 py-2.5 cursor-pointer hover:bg-surface transition-colors inline-block text-center ${className}`;
  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <button
      onClick={onClick}
      className={classes}
    >
      {children}
    </button>
  );
}

function ButtonCTA({
  children,
  className = "",
  href,
}: {
  children: React.ReactNode;
  className?: string;
  href?: string;
}) {
  const classes = `bg-brand text-white font-heading text-[13px] font-medium px-5 py-2.5 rounded-lg cursor-pointer hover:bg-brand/90 transition-colors inline-block text-center ${className}`;
  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <button className={classes}>
      {children}
    </button>
  );
}

/* ─── Icon Box ─── */

function IconBox({ icon: Icon }: { icon: React.ElementType }) {
  return (
    <div className="w-11 h-11 border border-border rounded-lg flex items-center justify-center">
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

/* ─── Hero ─── */

function Hero() {
  return (
    <section className="flex flex-col md:flex-row md:items-center gap-8 md:gap-16 px-5 py-12 md:px-12 md:py-20">
      {/* Left */}
      <div className="flex-1 flex flex-col gap-8">
        <h1 className="font-heading text-4xl md:text-[56px] font-medium leading-[1.1] tracking-tight text-dark">
          Stop junk leads
          <br />
          before they hit
          <br />
          your CRM
        </h1>
        <p className="text-base md:text-lg text-gray leading-relaxed">
          Real-time multi-signal lead validation via JavaScript snippet.
          {" "}
          <span className="hidden md:inline"><br /></span>
          Catch fake emails, invalid phones, risky IPs, and ghost
          {" "}
          <span className="hidden md:inline"><br /></span>
          companies
          <span className="hidden md:inline"> — all in under 800ms</span>.
        </p>
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <ButtonCTA href="/signup" className="w-full md:w-auto">Start for free</ButtonCTA>
          <ButtonSecondary
            className="w-full md:w-auto"
            onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
          >
            See how it works
          </ButtonSecondary>
        </div>
        <p className="text-xs md:text-[13px] text-light-gray">
          250 validations/mo free · No credit card
          <span className="hidden md:inline"> required</span>
        </p>
      </div>

      {/* Right — Form Mockup + Score Panel */}
      <div className="w-full md:w-[480px] flex flex-col">
        {/* Form */}
        <div className="bg-white border border-border rounded-t-lg p-5 md:p-6 flex flex-col gap-3.5 md:gap-4">
          <h3 className="font-heading text-base md:text-lg font-semibold text-dark">
            Contact Us
          </h3>
          {[
            { label: "Email", placeholder: "jane@acmecorp.com", desktopPlaceholder: "jane@acme.co" },
            { label: "Phone", placeholder: "+1 (555) 012-3456", desktopPlaceholder: "+1 (555) 234-5678" },
          ].map((field) => (
            <div key={field.label} className="flex flex-col gap-1">
              <label className="text-xs md:text-[13px] text-gray">
                {field.label}
              </label>
              <div className="h-9 md:h-10 border border-border rounded-lg px-2.5 md:px-3 flex items-center">
                <span className="text-[13px] text-dark md:text-light-gray">
                  <span className="md:hidden">{field.placeholder}</span>
                  <span className="hidden md:inline">{field.desktopPlaceholder}</span>
                </span>
              </div>
            </div>
          ))}
          {/* Company field — desktop only */}
          <div className="hidden md:flex flex-col gap-1.5">
            <label className="text-[13px] text-gray">Company</label>
            <div className="h-10 border border-border rounded-lg px-3 flex items-center">
              <span className="text-[13px] text-light-gray">Acme Inc.</span>
            </div>
          </div>
          <ButtonPrimary className="w-full">Submit</ButtonPrimary>
        </div>

        {/* Score Panel */}
        <div className="bg-surface border-x border-b border-border rounded-b-lg p-5 md:p-6 flex flex-col gap-3.5 md:gap-5">
          <div className="flex items-center justify-between">
            <span className="font-heading text-[13px] md:text-sm font-medium text-dark">
              Lead Quality Score
            </span>
            <span className="font-heading text-base md:text-lg font-semibold text-dark">
              94/100
            </span>
          </div>
          <div className="w-full h-1.5 md:h-2 bg-border rounded-lg">
            <div className="h-full bg-brand rounded-lg" style={{ width: "94%" }} />
          </div>
          <div className="flex flex-col gap-2">
            {[
              { mobile: "Email valid", desktop: "Email valid — deliverable address" },
              { mobile: "Phone valid", desktop: "Phone valid — real mobile number" },
              { mobile: "IP clean", desktop: "IP clean — no VPN or proxy detected" },
              { mobile: "Domain verified", desktop: "Domain verified — active company" },
            ].map((item) => (
              <div key={item.desktop} className="flex items-center gap-2">
                <Check size={12} className="text-green shrink-0 md:w-3.5 md:h-3.5" />
                <span className="text-xs md:text-[13px] text-gray">
                  <span className="md:hidden">{item.mobile}</span>
                  <span className="hidden md:inline">{item.desktop}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Dashboard Showcase (desktop only) ─── */

function DashboardShowcase() {
  return (
    <section
      className="hidden md:block px-20 pb-20"
      style={{
        background:
          "linear-gradient(to bottom, #FFFFFF 0%, #F0F0F0 30%, #E8E8E8 100%)",
      }}
    >
      <div className="flex items-center justify-center">
        <div
          className="w-[1280px] max-w-full h-[800px] border border-[#D0D0D0] bg-white overflow-hidden rounded-lg"
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
    <section id="how-it-works" className="px-5 py-12 md:px-12 md:py-20 flex flex-col gap-8 md:gap-12">
      <div className="flex flex-col gap-2">
        <h2 className="font-heading text-[28px] md:text-[40px] font-medium tracking-tight text-dark">
          How it works
        </h2>
        <p className="text-[13px] md:text-sm text-gray">
          Three steps to cleaner CRM data
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {steps.map((step) => (
          <div
            key={step.num}
            className="border border-border rounded-lg p-5 md:p-7 flex flex-col gap-3.5 md:gap-5"
          >
            <span className="font-heading text-[28px] md:text-4xl font-semibold text-brand">
              {step.num}
            </span>
            <h3 className="font-heading text-base md:text-lg font-semibold text-dark">
              {step.title}
            </h3>
            <p className="text-[13px] md:text-sm text-gray leading-relaxed">
              {step.desc}
            </p>
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
    mobileDesc: "Catches disposable addresses, typos, and undeliverable mailboxes.",
    desktopDesc:
      "Catches disposable addresses, typos, and undeliverable mailboxes before they pollute your CRM.",
    weight: "Weight: 40%",
  },
  {
    icon: Phone,
    title: "Phone Validation",
    mobileDesc: "Detects invalid numbers, VoIP lines, and disconnected phones.",
    desktopDesc:
      "Detects invalid numbers, VoIP lines, and disconnected phones. Ensures your SDRs can actually connect.",
    weight: "Weight: 25%",
  },
  {
    icon: Globe,
    title: "IP Intelligence",
    mobileDesc: "Flags VPNs, data centers, TOR exit nodes, and high-risk geolocations.",
    desktopDesc:
      "Flags VPNs, data centers, TOR exit nodes, and high-risk geolocations that indicate bot or fraudulent traffic.",
    weight: "Weight: 20%",
  },
  {
    icon: Building2,
    title: "Company Domain",
    mobileDesc: "Verifies the company exists and matches the email domain.",
    desktopDesc:
      "Verifies the company exists, has an active website, and the email domain matches. Filters out ghost companies.",
    weight: "Weight: 15%",
  },
];

function SignalBreakdown() {
  return (
    <section className="bg-surface px-5 py-12 md:px-12 md:py-20 flex flex-col gap-8 md:gap-12">
      <div className="flex flex-col gap-2">
        <h2 className="font-heading text-[28px] md:text-[40px] font-medium tracking-tight leading-[1.1] text-dark">
          Four signals.
          <br className="md:hidden" /> One score.
        </h2>
        <p className="text-[13px] md:text-sm text-gray">
          Every lead validated simultaneously
          <span className="hidden md:inline">
            {" "}across email, phone, IP, and company domain
          </span>
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {signals.map((signal) => (
          <div
            key={signal.title}
            className="bg-white border border-border rounded-lg p-5 md:p-7 flex flex-col gap-3 md:gap-4"
          >
            <IconBox icon={signal.icon} />
            <h3 className="font-heading text-base md:text-lg font-semibold text-dark">
              {signal.title}
            </h3>
            <p className="text-[13px] md:text-sm text-gray leading-relaxed">
              <span className="md:hidden">{signal.mobileDesc}</span>
              <span className="hidden md:inline">{signal.desktopDesc}</span>
            </p>
            <span className="text-xs md:text-[13px] font-medium text-brand">
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
    mobileFeatures: ["250 validations/mo", "Email validation only"],
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
    mobileFeatures: ["2,500 validations/mo", "All 4 signals, 2 CRMs"],
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
    mobileFeatures: [
      "15,000 validations/mo",
      "All 4 signals",
      "Unlimited CRMs",
    ],
    featured: true,
    featureStyle: "normal" as const,
    btnLabel: "Get started",
  },
];

function Pricing() {
  return (
    <section id="pricing" className="px-5 py-12 md:px-12 md:py-20 flex flex-col items-center gap-8 md:gap-12">
      <div className="flex flex-col items-center gap-2">
        <h2 className="font-heading text-[28px] md:text-[40px] font-medium tracking-tight leading-[1.1] text-dark text-center">
          Simple, transparent
          <br className="md:hidden" /> pricing
        </h2>
        <p className="text-[13px] md:text-sm text-gray">
          Start free. Upgrade when you need more.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 w-full md:h-[420px]">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={`p-5 md:p-7 flex flex-col gap-5 md:gap-6 md:justify-between md:h-full ${
              tier.featured
                ? "border-t-[3px] border-t-brand border-x border-b border-border rounded-lg"
                : "border border-border rounded-lg"
            }`}
          >
            <div className="flex flex-col gap-5 md:gap-6">
              {/* POPULAR badge — mobile: above name, desktop: inline */}
              {tier.featured && (
                <span className="md:hidden bg-brand text-white text-[10px] font-semibold px-2 py-0.5 self-start flex items-center justify-center rounded-lg">
                  POPULAR
                </span>
              )}
              <div className="flex flex-col gap-1.5 md:gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="font-heading text-base md:text-lg font-semibold text-dark">
                    {tier.name}
                  </span>
                  {tier.featured && (
                    <span className="hidden md:flex bg-brand text-white text-[10px] font-semibold px-1.5 py-0.5 items-center justify-center rounded-lg">
                      POPULAR
                    </span>
                  )}
                </div>
                <span className="font-heading text-[28px] md:text-4xl font-semibold text-dark tracking-tight">
                  {tier.price}
                  <span className="text-base font-normal text-gray">/mo</span>
                </span>
                <span className="hidden md:block text-[13px] text-gray">
                  {tier.sub}
                </span>
              </div>
              <div className="flex flex-col gap-2.5 md:gap-3">
                {/* Mobile features */}
                {tier.mobileFeatures.map((feat) => (
                  <div
                    key={feat}
                    className="md:hidden flex items-center gap-2"
                  >
                    <Check
                      size={12}
                      className={
                        tier.featureStyle === "muted"
                          ? "text-light-gray"
                          : "text-dark"
                      }
                    />
                    <span
                      className={`text-[13px] ${
                        tier.featureStyle === "muted"
                          ? "text-gray"
                          : "text-dark"
                      }`}
                    >
                      {feat}
                    </span>
                  </div>
                ))}
                {/* Desktop features */}
                {tier.features.map((feat) => (
                  <div
                    key={feat}
                    className="hidden md:flex items-center gap-2"
                  >
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
              <ButtonCTA href="/signup" className="w-full">{tier.btnLabel}</ButtonCTA>
            ) : (
              <ButtonSecondary href="/signup" className="w-full">
                {tier.btnLabel}
              </ButtonSecondary>
            )}
          </div>
        ))}
      </div>
      <div className="hidden md:flex items-center gap-1.5 cursor-pointer group">
        <span className="font-heading text-[13px] font-medium text-gray group-hover:text-dark transition-colors">
          Need more? Contact us for Scale plan
        </span>
        <ArrowRight
          size={14}
          className="text-gray group-hover:text-dark transition-colors"
        />
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
];

const desktopOnlyFaq = "Can I use Bouncer on multiple forms?";

function FAQ() {
  return (
    <section className="px-5 py-12 md:px-12 md:py-20 flex flex-col items-center gap-8 md:gap-12">
      <h2 className="font-heading text-[28px] md:text-[40px] font-medium tracking-tight leading-[1.1] text-dark text-center">
        Frequently asked
        <br className="md:hidden" /> questions
      </h2>
      <div className="w-full md:w-[720px] flex flex-col">
        {faqQuestions.map((q) => (
          <FAQItem key={q} question={q} />
        ))}
        <div className="hidden md:block">
          <FAQItem question={desktopOnlyFaq} />
        </div>
      </div>
    </section>
  );
}

/* ─── Final CTA ─── */

function FinalCTA() {
  return (
    <section className="bg-dark px-5 py-12 md:px-12 md:py-20 flex flex-col items-center gap-5 md:gap-6">
      <h2 className="font-heading text-[28px] md:text-[40px] font-medium tracking-tight leading-[1.1] text-white text-center">
        Stop wasting budget
        <br className="md:hidden" /> on junk leads
      </h2>
      <p className="text-[13px] md:text-sm text-light-gray">
        Start validating in under 5 minutes
        <span className="hidden md:inline">. Free</span>.
      </p>
      <ButtonCTA href="/signup" className="w-full md:w-auto">Start for free</ButtonCTA>
      <p className="text-xs md:text-[13px] text-gray">
        No credit card required
        <span className="hidden md:inline"> · 250 free validations/mo</span>
      </p>
    </section>
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
