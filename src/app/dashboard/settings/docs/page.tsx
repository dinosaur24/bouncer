"use client";

import { useState } from "react";
import { Search, ChevronRight, ChevronDown } from "lucide-react";

const docSections = [
  {
    title: "Getting Started",
    items: [
      { id: "quick-start", label: "Quick Start Guide" },
      { id: "install-snippet", label: "Install Snippet" },
      { id: "connect-crm", label: "Connect Your CRM" },
    ],
  },
  {
    title: "API Reference",
    items: [
      { id: "authentication", label: "Authentication" },
      { id: "validate-endpoint", label: "Validate Endpoint" },
      { id: "webhooks", label: "Webhooks" },
    ],
  },
  {
    title: "Scoring",
    items: [
      { id: "how-scoring-works", label: "How Scoring Works" },
      { id: "custom-thresholds", label: "Custom Thresholds" },
    ],
  },
];

const articles: Record<string, { title: string; content: React.ReactNode }> = {
  "install-snippet": {
    title: "Install Snippet",
    content: (
      <div className="flex flex-col gap-6">
        <p className="text-[13px] text-gray leading-relaxed">
          Add Bouncer&apos;s JavaScript snippet to your website to start validating
          leads in real time. The snippet runs asynchronously and won&apos;t affect
          page load performance.
        </p>

        <div className="flex flex-col gap-3">
          <h3 className="font-heading text-[15px] font-semibold text-dark">
            1. Copy the snippet code
          </h3>
          <p className="text-[13px] text-gray leading-relaxed">
            Go to Settings → Snippet Install to copy the full snippet tag with
            your unique data-token. This token identifies your Bouncer account.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="font-heading text-[15px] font-semibold text-dark">
            2. Paste before the closing &lt;/head&gt; tag
          </h3>
          <p className="text-[13px] text-gray leading-relaxed">
            Open your website&apos;s HTML and locate the closing &lt;/head&gt; tag.
            Paste the snippet just before it. If you use a CMS like WordPress,
            add it via the theme editor or a custom code plugin.
          </p>
          <div className="bg-dark p-4 overflow-x-auto">
            <pre className="text-[13px] font-mono text-[#4ADE80]">
{`<script
  src="https://cdn.bouncer.io/snippet.js"
  data-token="bnc_sk_abc0ef"
  data-config="auto_validate"
  async>
</script>`}
            </pre>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="font-heading text-[15px] font-semibold text-dark">
            3. Verify the installation
          </h3>
          <p className="text-[13px] text-gray leading-relaxed">
            After adding the snippet, visit your website and submit a test form.
            Then check your Bouncer dashboard to confirm the validation appeared.
            You can also use the &quot;Test my installation&quot; button on the Snippet
            Install settings page.
          </p>
        </div>

        <div className="bg-[#FEF3C7] p-4">
          <p className="text-[13px] text-[#92400E]">
            <strong>Tip:</strong> The snippet is detected within 60 seconds. If
            detection fails, clear your browser cache and try again. Ensure no
            ad blocker is interfering with the script.
          </p>
        </div>
      </div>
    ),
  },
  "quick-start": {
    title: "Quick Start Guide",
    content: (
      <div className="flex flex-col gap-4">
        <p className="text-[13px] text-gray leading-relaxed">
          Get up and running with Bouncer in under 5 minutes. This guide walks
          you through the essential setup steps.
        </p>
        <ol className="flex flex-col gap-3 list-decimal list-inside text-[13px] text-gray leading-relaxed">
          <li>Create your Bouncer account and complete onboarding</li>
          <li>Install the JavaScript snippet on your website</li>
          <li>Connect your CRM (HubSpot, Salesforce, or Pipedrive)</li>
          <li>Configure your scoring thresholds</li>
          <li>Submit a test lead and verify it appears in your dashboard</li>
        </ol>
      </div>
    ),
  },
};

export default function DocsPage() {
  const [selectedArticle, setSelectedArticle] = useState("install-snippet");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSections, setExpandedSections] = useState<string[]>(
    docSections.map((s) => s.title)
  );

  const toggleSection = (title: string) => {
    setExpandedSections((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  const filteredSections = docSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((section) => section.items.length > 0);

  const article = articles[selectedArticle] || articles["install-snippet"];

  return (
    <>
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-[28px] font-bold text-dark">
          Documentation
        </h1>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search docs..."
          className="w-full border border-border pl-9 pr-4 py-2.5 text-[13px] text-dark font-heading bg-white focus:outline-none focus:border-dark transition-colors placeholder:text-light-gray"
        />
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar / Mobile nav */}
        <nav className="md:w-[200px] md:shrink-0">
          {filteredSections.map((section) => (
            <div key={section.title} className="mb-4">
              <button
                onClick={() => toggleSection(section.title)}
                className="flex items-center justify-between w-full py-1.5 cursor-pointer"
              >
                <span className="font-heading text-xs font-semibold text-dark uppercase tracking-wide">
                  {section.title}
                </span>
                <ChevronDown
                  size={14}
                  className={`text-gray transition-transform ${
                    expandedSections.includes(section.title)
                      ? ""
                      : "-rotate-90"
                  }`}
                />
              </button>
              {expandedSections.includes(section.title) && (
                <div className="flex flex-col mt-1">
                  {section.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSelectedArticle(item.id)}
                      className={`flex items-center justify-between py-2 pl-2 text-[13px] cursor-pointer border-b border-border md:border-0 ${
                        selectedArticle === item.id
                          ? "font-heading font-medium text-dark"
                          : "text-gray hover:text-dark"
                      }`}
                    >
                      {item.label}
                      <ChevronRight
                        size={14}
                        className="text-gray md:hidden"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Article content */}
        <div className="flex-1 min-w-0">
          <h2 className="font-heading text-[20px] font-bold text-dark mb-6">
            {article.title}
          </h2>
          {article.content}
        </div>
      </div>
    </>
  );
}
