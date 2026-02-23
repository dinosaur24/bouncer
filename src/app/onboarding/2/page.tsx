"use client";

import { useState } from "react";
import Link from "next/link";
import { Copy, CheckCircle } from "lucide-react";

const snippets = {
  html: `<script
  src="https://cdn.bouncer.io/snippet.js"
  data-token="bnc_sk_abc0ef"
  data-config="auto_validate"
  async>
</script>`,
  react: `import { useEffect } from "react";

function App() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.bouncer.io/snippet.js";
    script.dataset.token = "bnc_sk_abc0ef";
    script.dataset.config = "auto_validate";
    script.async = true;
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, []);
}`,
  nextjs: `// app/layout.tsx
import Script from "next/script";

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <Script
          src="https://cdn.bouncer.io/snippet.js"
          data-token="bnc_sk_abc0ef"
          data-config="auto_validate"
          strategy="afterInteractive"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}`,
};

type Tab = "html" | "react" | "nextjs";

export default function InstallSnippetPage() {
  const [activeTab, setActiveTab] = useState<Tab>("html");
  const [copied, setCopied] = useState(false);
  const [tested, setTested] = useState(false);

  const tabs: { key: Tab; label: string }[] = [
    { key: "html", label: "HTML" },
    { key: "react", label: "React" },
    { key: "nextjs", label: "Next.js" },
  ];

  const handleCopy = async () => {
    await navigator.clipboard.writeText(snippets[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTest = () => {
    setTested(true);
  };

  return (
    <div>
      <h1 className="font-heading text-[28px] md:text-[32px] font-bold text-dark">
        Install the snippet
      </h1>
      <p className="text-sm text-gray mt-2">
        Add this code to your website before the closing &lt;/head&gt; tag.
      </p>

      {/* Tab bar */}
      <div className="flex border-b border-border mt-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-[13px] font-heading font-medium transition-colors ${
              activeTab === tab.key
                ? "text-dark border-b-2 border-brand"
                : "text-gray"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Code block */}
      <div className="mt-4 bg-dark p-5 relative overflow-x-auto rounded">
        <pre>
          <code className="text-[13px] font-mono text-[#4ADE80]">
            {snippets[activeTab]}
          </code>
        </pre>
        <button
          onClick={handleCopy}
          className="absolute top-3 right-3 flex items-center gap-1.5 text-[12px] font-heading text-[#4ADE80] hover:text-white transition-colors"
        >
          {copied ? (
            <>
              <CheckCircle className="w-3.5 h-3.5" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              Copy
            </>
          )}
        </button>
      </div>

      {/* Test installation button */}
      <button
        onClick={handleTest}
        className={`mt-4 w-full border font-heading text-[13px] font-medium py-2.5 flex items-center justify-center gap-2 transition-colors ${
          tested
            ? "border-green text-green"
            : "border-border text-dark hover:border-dark"
        }`}
      >
        <CheckCircle className="w-4 h-4" />
        {tested
          ? "Snippet detected on your site"
          : "Test my installation"}
      </button>

      {/* Continue button */}
      <Link
        href="/onboarding/3"
        className="mt-6 w-full bg-dark text-white font-heading text-[13px] font-medium py-2.5 text-center block"
      >
        Continue
      </Link>
    </div>
  );
}
