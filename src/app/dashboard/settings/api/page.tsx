"use client";

import { useState, useEffect } from "react";
import { Copy, Check } from "lucide-react";
import { useToast } from "@/components/Toast";
import { useSettings } from "@/contexts/SettingsContext";
import { Modal } from "@/components/Modal";

export default function APIPage() {
  const { addToast } = useToast();
  const { apiKeys, webhook, regenerateApiKey, saveWebhook, testWebhook, isLoading } = useSettings();

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [webhookUrl, setWebhookUrl] = useState(webhook.url);
  const [events, setEvents] = useState<Record<string, boolean>>({
    "validation.completed": true,
    "validation.failed": true,
    "lead.scored": false,
    "lead.blocked": false,
  });
  const [regenModalOpen, setRegenModalOpen] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSavingWebhook, setIsSavingWebhook] = useState(false);

  // Sync webhook state from context
  useEffect(() => {
    setWebhookUrl(webhook.url);
    if (webhook.events.length > 0) {
      const eventMap: Record<string, boolean> = {
        "validation.completed": false,
        "validation.failed": false,
        "lead.scored": false,
        "lead.blocked": false,
      };
      webhook.events.forEach(e => {
        if (e in eventMap) eventMap[e] = true;
      });
      setEvents(eventMap);
    }
  }, [webhook]);

  const maskedLiveKey = apiKeys.liveKey
    ? apiKeys.liveKey.substring(0, 8) + "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
    : "sk_live_\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022";

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    addToast("Copied to clipboard");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const toggleEvent = (event: string) => {
    setEvents((prev) => ({ ...prev, [event]: !prev[event as keyof typeof prev] }));
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const newKey = await regenerateApiKey("live");
      const masked = newKey.substring(0, 12) + "..." + newKey.substring(newKey.length - 4);
      addToast(`New live key: ${masked}`);
      setRegenModalOpen(false);
    } catch {
      addToast("Failed to regenerate key", "error");
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleSaveWebhook = async () => {
    setIsSavingWebhook(true);
    try {
      const activeEvents = Object.entries(events)
        .filter(([, checked]) => checked)
        .map(([event]) => event);
      await saveWebhook({ url: webhookUrl, events: activeEvents, active: webhookUrl.length > 0 });
      addToast("Webhook saved");
    } catch {
      addToast("Failed to save webhook", "error");
    } finally {
      setIsSavingWebhook(false);
    }
  };

  const handleTestWebhook = async () => {
    setIsTesting(true);
    try {
      const success = await testWebhook();
      if (success) {
        addToast("Test event sent successfully");
      } else {
        addToast("Webhook test failed", "error");
      }
    } catch {
      addToast("Webhook test failed", "error");
    } finally {
      setIsTesting(false);
    }
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
                value={maskedLiveKey}
                readOnly
                className="flex-1 border border-border px-4 py-2.5 text-[13px] text-dark font-heading bg-surface focus:outline-none"
              />
              <button
                onClick={() => copyToClipboard(apiKeys.liveKey, "live")}
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
                value={apiKeys.testKey}
                readOnly
                className="flex-1 border border-border px-4 py-2.5 text-[13px] text-dark font-heading bg-white focus:outline-none"
              />
              <button
                onClick={() => copyToClipboard(apiKeys.testKey, "test")}
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

          <button
            onClick={() => setRegenModalOpen(true)}
            className="text-[13px] text-brand font-heading font-medium hover:underline cursor-pointer self-start"
          >
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
          <button
            onClick={handleSaveWebhook}
            disabled={isSavingWebhook}
            className={`bg-dark text-white font-heading text-[13px] font-medium px-5 py-2.5 hover:bg-dark/90 cursor-pointer ${
              isSavingWebhook ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isSavingWebhook ? "Saving..." : "Save webhook"}
          </button>
          <button
            onClick={handleTestWebhook}
            disabled={isTesting}
            className={`border border-border text-dark font-heading text-[13px] font-medium px-5 py-2.5 hover:bg-surface cursor-pointer ${
              isTesting ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isTesting ? "Sending..." : "Send test event"}
          </button>
        </div>
      </div>

      {/* Regenerate Confirmation Modal */}
      <Modal
        open={regenModalOpen}
        onClose={() => setRegenModalOpen(false)}
        title="Regenerate API Key"
      >
        <div className="flex flex-col gap-5">
          <p className="text-[13px] text-gray leading-relaxed">
            Are you sure you want to regenerate your live API key? The current key will be immediately invalidated and any integrations using it will stop working.
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className={`bg-brand text-white font-heading text-[13px] font-medium px-5 py-2.5 ${
                isRegenerating ? "opacity-50 cursor-not-allowed" : "hover:bg-brand/90 cursor-pointer"
              }`}
            >
              {isRegenerating ? "Regenerating..." : "Regenerate key"}
            </button>
            <button
              onClick={() => setRegenModalOpen(false)}
              className="border border-border text-dark font-heading text-[13px] font-medium px-5 py-2.5 hover:bg-surface cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
