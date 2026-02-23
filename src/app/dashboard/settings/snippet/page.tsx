"use client";

import { useState } from "react";
import { Copy, Check, CheckCircle } from "lucide-react";

const snippets: Record<string, string> = {
  HTML: `<script
  src="https://cdn.bouncer.io/snippet.js"
  data-token="bnc_sk_abc0ef"
  data-config="auto_validate"
  async>
</script>`,
  React: `import { useEffect } from 'react';

useEffect(() => {
  const script = document.createElement('script');
  script.src = 'https://cdn.bouncer.io/snippet.js';
  script.dataset.token = 'bnc_sk_abc0ef';
  script.async = true;
  document.head.appendChild(script);
  return () => { document.head.removeChild(script); };
}, []);`,
  "Next.js": `import Script from 'next/script';

<Script
  src="https://cdn.bouncer.io/snippet.js"
  data-token="bnc_sk_abc0ef"
  strategy="afterInteractive"
/>`,
};

const platformGuides: Record<string, string[]> = {
  HTML: [
    "Copy the snippet code above",
    "Paste it before the closing </head> tag in your HTML file",
    'Click "Test my installation" above to verify the snippet is working',
  ],
  React: [
    "Copy the React hook code above",
    "Add it to your root App component or the page with your form",
    'Click "Test my installation" above to verify',
  ],
  WordPress: [
    "Go to Appearance → Theme Editor → header.php",
    "Paste the HTML snippet before the closing </head> tag",
    "Save changes and verify the installation",
  ],
  Webflow: [
    'Go to Project Settings → Custom Code → "Head Code"',
    "Paste the HTML snippet in the head code section",
    "Publish your site and verify the installation",
  ],
  Framer: [
    "Go to Site Settings → Custom Code → Head",
    "Paste the HTML snippet",
    "Publish and verify the installation",
  ],
};

export default function SnippetPage() {
  const [codeTab, setCodeTab] = useState("HTML");
  const [guideTab, setGuideTab] = useState("HTML");
  const [copied, setCopied] = useState(false);
  const [verified, setVerified] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(snippets[codeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-[28px] font-bold text-dark">
          Install Snippet
        </h1>
        <p className="text-sm text-gray">
          Add the Bouncer JavaScript snippet to your website to start validating leads in real time.
        </p>
      </div>

      {/* Snippet Code */}
      <div className="flex flex-col gap-0">
        <h3 className="font-heading text-[15px] font-semibold text-dark mb-4">
          Your snippet code
        </h3>

        {/* Code Tabs */}
        <div className="flex border-b border-border">
          {Object.keys(snippets).map((tab) => (
            <button
              key={tab}
              onClick={() => setCodeTab(tab)}
              className={`px-4 py-2.5 text-[13px] font-heading font-medium cursor-pointer relative ${
                codeTab === tab ? "text-dark" : "text-gray hover:text-dark"
              }`}
            >
              {tab}
              {codeTab === tab && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand" />
              )}
            </button>
          ))}
        </div>

        {/* Code Block */}
        <div className="bg-dark p-5 relative">
          <pre className="text-[13px] font-mono text-[#4ADE80] overflow-x-auto whitespace-pre">
            {snippets[codeTab]}
          </pre>
          <button
            onClick={handleCopy}
            className="absolute top-3 right-3 text-white/60 hover:text-white cursor-pointer flex items-center gap-1.5"
          >
            {copied ? (
              <>
                <Check size={14} />
                <span className="text-xs">Copied</span>
              </>
            ) : (
              <Copy size={14} />
            )}
          </button>
        </div>
      </div>

      {/* Verification */}
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <button
          onClick={() => setVerified(true)}
          className={`flex items-center justify-center gap-2 font-heading text-[13px] font-medium px-5 py-2.5 cursor-pointer transition-colors ${
            verified
              ? "text-green"
              : "border border-border text-dark hover:bg-surface"
          }`}
        >
          <CheckCircle size={16} />
          {verified ? "Snippet detected on acme.com" : "Test my installation"}
        </button>
      </div>

      {/* Platform Guides */}
      <div className="flex flex-col gap-4">
        <h3 className="font-heading text-[15px] font-semibold text-dark">
          Platform guides
        </h3>

        {/* Guide Tabs */}
        <div className="flex border-b border-border overflow-x-auto">
          {Object.keys(platformGuides).map((tab) => (
            <button
              key={tab}
              onClick={() => setGuideTab(tab)}
              className={`px-4 py-2.5 text-[13px] font-heading font-medium cursor-pointer relative whitespace-nowrap ${
                guideTab === tab ? "text-dark" : "text-gray hover:text-dark"
              }`}
            >
              {tab}
              {guideTab === tab && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand" />
              )}
            </button>
          ))}
        </div>

        {/* Steps */}
        <div className="flex flex-col gap-4 mt-2">
          {platformGuides[guideTab].map((step, i) => (
            <div key={i} className="flex gap-3">
              <span className="font-heading text-[13px] font-semibold text-dark shrink-0 w-5">
                {i + 1}.
              </span>
              <p className="text-[13px] text-gray leading-relaxed">{step}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
