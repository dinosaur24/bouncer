"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function APIPage() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [webhookUrl, setWebhookUrl] = useState("https://api.acme.com/webhooks");
  const [events, setEvents] = useState({
    "validation.completed": true,
    "validation.failed": true,
    "lead.scored": false,
    "lead.blocked": false,
  });

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const toggleEvent = (event: string) => {
    setEvents((prev) => ({ ...prev, [event]: !prev[event as keyof typeof prev] }));
  };

  return (
    <>
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-[28px] font-bold text-dark">
          API & Webhooks
        </h1>
        <p className="text-sm text-gray">
          Manage API keys and configure webhooks
        </p>
      </div>

      {/* API Keys */}
      <div className="flex flex-col gap-5">
        <h3 className="font-heading text-[15px] font-semibold text-dark">
          API Keys
        </h3>

        <div className="flex flex-col gap-4">
          {/* Live Key */}
          <div>
            <label className="text-[13px] text-gray mb-2 block">
              Live API Key
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value="sk_live_••••••••••••••••"
                readOnly
                className="flex-1 border border-border px-4 py-2.5 text-[13px] text-dark font-heading bg-surface focus:outline-none"
              />
              <button
                onClick={() => copyToClipboard("sk_live_a8f3k2m9x4p7q1w6", "live")}
                className="border border-border px-3 py-2.5 hover:bg-surface cursor-pointer flex items-center"
              >
                {copiedKey === "live" ? (
                  <Check size={14} className="text-green" />
                ) : (
                  <Copy size={14} className="text-gray" />
                )}
              </button>
            </div>
          </div>

          {/* Test Key */}
          <div>
            <label className="text-[13px] text-gray mb-2 block">
              Test API Key
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value="sk_test_cJRz5s4e9fg7a9f7"
                readOnly
                className="flex-1 border border-border px-4 py-2.5 text-[13px] text-dark font-heading bg-white focus:outline-none"
              />
              <button
                onClick={() => copyToClipboard("sk_test_cJRz5s4e9fg7a9f7", "test")}
                className="border border-border px-3 py-2.5 hover:bg-surface cursor-pointer flex items-center"
              >
                {copiedKey === "test" ? (
                  <Check size={14} className="text-green" />
                ) : (
                  <Copy size={14} className="text-gray" />
                )}
              </button>
            </div>
          </div>

          <button className="text-[13px] text-brand font-heading font-medium hover:underline cursor-pointer self-start">
            Regenerate keys
          </button>
        </div>
      </div>

      {/* Webhooks */}
      <div className="flex flex-col gap-5 mt-2">
        <div className="flex flex-col gap-1">
          <h3 className="font-heading text-[15px] font-semibold text-dark">
            Webhooks
          </h3>
          <p className="text-[13px] text-gray">
            Receive real-time notifications when validation events occur.
          </p>
        </div>

        <div>
          <label className="text-[13px] text-gray mb-2 block">
            Endpoint URL
          </label>
          <input
            type="text"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="https://api.acme.com/webhooks"
            className="w-full border border-border px-4 py-2.5 text-[13px] text-dark font-heading bg-white focus:outline-none focus:border-dark transition-colors placeholder:text-light-gray"
          />
        </div>

        <div>
          <label className="text-[13px] text-gray mb-3 block">
            Events to subscribe
          </label>
          <div className="flex flex-col gap-2.5">
            {Object.entries(events).map(([event, checked]) => (
              <label
                key={event}
                className="flex items-center gap-3 cursor-pointer"
              >
                <button
                  onClick={() => toggleEvent(event)}
                  className={`w-4 h-4 border flex items-center justify-center shrink-0 ${
                    checked ? "bg-brand border-brand" : "border-border"
                  }`}
                >
                  {checked && <Check size={10} className="text-white" />}
                </button>
                <span className="text-[13px] text-dark font-heading">
                  {event}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button className="bg-dark text-white font-heading text-[13px] font-medium px-5 py-2.5 hover:bg-dark/90 cursor-pointer">
            Save webhook
          </button>
          <button className="border border-border text-dark font-heading text-[13px] font-medium px-5 py-2.5 hover:bg-surface cursor-pointer">
            Send test event
          </button>
        </div>
      </div>
    </>
  );
}
