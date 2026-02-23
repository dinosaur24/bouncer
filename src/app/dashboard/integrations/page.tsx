"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { useToast } from "@/components/Toast";
import { Modal } from "@/components/Modal";
import { useIntegrations } from "@/contexts/IntegrationContext";
import type { FieldMapping } from "@/lib/types";

interface IntegrationCardInfo {
  provider: string;
  name: string;
  iconBg: string;
  iconText: string;
  iconTextColor: string;
  description: string;
  category: string;
}

const INTEGRATION_CARDS: IntegrationCardInfo[] = [
  {
    provider: "hubspot",
    name: "HubSpot",
    iconBg: "#FF6B35",
    iconText: "H",
    iconTextColor: "text-white",
    description: "Sync validated leads directly to HubSpot contacts and deals",
    category: "CRM & Sales",
  },
  {
    provider: "salesforce",
    name: "Salesforce",
    iconBg: "#0176D3",
    iconText: "S",
    iconTextColor: "text-white",
    description: "Push qualified leads to Salesforce with custom field mapping",
    category: "CRM & Sales",
  },
  {
    provider: "pipedrive",
    name: "Pipedrive",
    iconBg: "#7B68EE",
    iconText: "P",
    iconTextColor: "text-white",
    description: "Trigger automations based on lead validation scores",
    category: "Marketing & Automation",
  },
  {
    provider: "webhook",
    name: "Webhooks",
    iconBg: "#0D0D0D",
    iconText: "<>",
    iconTextColor: "text-white",
    description: "Send real-time validation events to custom endpoints",
    category: "Webhooks & Developer",
  },
  {
    provider: "zapier",
    name: "Zapier",
    iconBg: "#FF4500",
    iconText: "Z",
    iconTextColor: "text-white",
    description: "Connect to 5,000+ apps through Zapier automations",
    category: "Webhooks & Developer",
  },
];

export default function IntegrationsPage() {
  const { addToast } = useToast();
  const {
    connections,
    fieldMappings,
    isLoading,
    connectCRM,
    disconnectCRM,
    saveFieldMappings,
    testConnection,
  } = useIntegrations();
  const [connecting, setConnecting] = useState<string | null>(null);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [configuringId, setConfiguringId] = useState<string | null>(null);
  const [configuringName, setConfiguringName] = useState<string | null>(null);
  const [localMappings, setLocalMappings] = useState<FieldMapping[]>(fieldMappings);
  const [testing, setTesting] = useState<string | null>(null);

  const getConnection = (provider: string) =>
    connections.find((c) => c.provider === provider);

  const handleConnect = async (provider: string) => {
    setConnecting(provider);
    try {
      await connectCRM(provider);
      const card = INTEGRATION_CARDS.find((c) => c.provider === provider);
      addToast(`${card?.name ?? provider} connected successfully`);
    } catch {
      addToast("Failed to connect. Please try again.", "error");
    } finally {
      setConnecting(null);
    }
  };

  const handleConfigure = (provider: string) => {
    const conn = getConnection(provider);
    const card = INTEGRATION_CARDS.find((c) => c.provider === provider);
    if (conn) {
      setConfiguringId(conn.id);
      setConfiguringName(card?.name ?? provider);
      setLocalMappings([...fieldMappings]);
      setConfigModalOpen(true);
    }
  };

  const handleDisconnect = async () => {
    if (!configuringId) return;
    try {
      await disconnectCRM(configuringId);
      addToast(`${configuringName} disconnected`);
    } catch {
      addToast("Failed to disconnect. Please try again.", "error");
    }
    setConfigModalOpen(false);
    setConfiguringId(null);
    setConfiguringName(null);
  };

  const handleSaveMapping = async () => {
    try {
      await saveFieldMappings(localMappings);
      addToast("Field mapping saved");
    } catch {
      addToast("Failed to save mappings.", "error");
    }
    setConfigModalOpen(false);
    setConfiguringId(null);
    setConfiguringName(null);
  };

  const handleTest = async (id: string, name: string) => {
    setTesting(id);
    try {
      await testConnection(id);
      addToast(`${name} connection is healthy`, "success");
    } catch {
      addToast(`${name} connection test failed`, "error");
    } finally {
      setTesting(null);
    }
  };

  const toggleMapping = (index: number) => {
    setLocalMappings((prev) =>
      prev.map((m, i) => (i === index ? { ...m, enabled: !m.enabled } : m))
    );
  };

  // Group cards by category
  const categories = INTEGRATION_CARDS.reduce<
    Record<string, IntegrationCardInfo[]>
  >((acc, card) => {
    if (!acc[card.category]) acc[card.category] = [];
    acc[card.category].push(card);
    return acc;
  }, {});

  return (
    <>
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-[28px] font-bold text-dark">
            Integrations
          </h1>
          <p className="text-sm text-gray">
            Connect Bouncer with your existing tools
          </p>
        </div>

        <button className="border border-border text-dark font-heading text-[13px] font-medium px-5 py-2.5 cursor-pointer bg-white hover:bg-surface transition-colors">
          Browse marketplace
        </button>
      </div>

      {/* Categories */}
      <div className="flex flex-col gap-10">
        {Object.entries(categories).map(([category, cards]) => (
          <div key={category}>
            <h2 className="font-heading text-[15px] font-semibold text-dark mb-4">
              {category}
            </h2>

            <div className="grid grid-cols-3 gap-6">
              {cards.map((card) => {
                const conn = getConnection(card.provider);
                const isConnected = conn?.status === "connected";

                return (
                  <div
                    key={card.provider}
                    className="border border-border p-6 flex flex-col gap-4"
                  >
                    {/* Top */}
                    <div className="flex items-start gap-4">
                      <div
                        className="w-10 h-10 flex items-center justify-center shrink-0"
                        style={{ backgroundColor: card.iconBg }}
                      >
                        <span
                          className={`font-heading font-bold text-lg ${card.iconTextColor}`}
                        >
                          {card.iconText}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="font-heading text-[15px] font-semibold text-dark">
                          {card.name}
                        </span>
                        <span className="text-[13px] text-gray leading-relaxed">
                          {card.description}
                        </span>
                      </div>
                    </div>

                    {/* Bottom */}
                    <div className="border-t border-border pt-4 mt-auto flex justify-between items-center">
                      {/* Connection status */}
                      {isConnected ? (
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-green" />
                          <span className="text-[11px] text-green">
                            Connected
                          </span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-gray">
                          Not connected
                        </span>
                      )}

                      {/* Action */}
                      {isConnected ? (
                        <div className="flex items-center gap-3">
                          {conn && (
                            <button
                              onClick={() => handleTest(conn.id, card.name)}
                              disabled={testing === conn.id}
                              className="text-gray text-[11px] font-medium cursor-pointer hover:underline bg-transparent border-none p-0 disabled:opacity-60"
                            >
                              {testing === conn.id ? (
                                <span className="animate-pulse">Testing...</span>
                              ) : (
                                "Test"
                              )}
                            </button>
                          )}
                          <span
                            className="text-brand text-[13px] font-medium cursor-pointer hover:underline"
                            onClick={() => handleConfigure(card.provider)}
                          >
                            Configure &rarr;
                          </span>
                        </div>
                      ) : (
                        <button
                          className="border border-border text-dark font-heading text-[13px] px-4 py-1.5 cursor-pointer bg-white hover:bg-surface transition-colors"
                          onClick={() => handleConnect(card.provider)}
                          disabled={connecting === card.provider || isLoading}
                        >
                          {connecting === card.provider ? (
                            <span className="animate-pulse">Connecting...</span>
                          ) : (
                            "Connect"
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Configure Modal */}
      <Modal
        open={configModalOpen}
        onClose={() => {
          setConfigModalOpen(false);
          setConfiguringId(null);
          setConfiguringName(null);
        }}
        title={`Configure ${configuringName ?? ""}`}
      >
        <div className="flex flex-col gap-6">
          {/* Field Mapping */}
          <div>
            <h3 className="font-heading text-[13px] font-semibold text-dark mb-3">
              Field mapping
            </h3>
            <div className="flex flex-col gap-2">
              {localMappings.map((mapping, index) => (
                <div
                  key={mapping.bouncerField}
                  className={`flex items-center gap-3 ${!mapping.enabled ? "opacity-40" : ""}`}
                >
                  <button
                    onClick={() => toggleMapping(index)}
                    className={`w-4 h-4 border shrink-0 flex items-center justify-center cursor-pointer ${
                      mapping.enabled
                        ? "bg-brand border-brand"
                        : "bg-white border-border"
                    }`}
                  >
                    {mapping.enabled && (
                      <span className="text-white text-[10px]">&#10003;</span>
                    )}
                  </button>
                  <span className="bg-surface p-2 text-[13px] text-dark font-medium flex-1">
                    {mapping.bouncerField}
                  </span>
                  <ArrowRight size={14} className="text-gray shrink-0" />
                  <span className="bg-surface p-2 text-[13px] text-dark font-medium flex-1">
                    {mapping.crmField}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between border-t border-border pt-4">
            <button
              onClick={handleDisconnect}
              className="text-brand text-[13px] font-medium cursor-pointer hover:underline bg-transparent border-none p-0"
            >
              Disconnect
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setConfigModalOpen(false);
                  setConfiguringId(null);
                  setConfiguringName(null);
                }}
                className="border border-border text-dark font-heading text-[13px] font-medium px-5 py-2.5 cursor-pointer bg-white hover:bg-surface transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleSaveMapping}
                disabled={isLoading}
                className="bg-brand text-white font-heading text-[13px] font-medium px-5 py-2.5 cursor-pointer hover:bg-brand/90 transition-colors border-none disabled:opacity-60"
              >
                {isLoading ? (
                  <span className="animate-pulse">Saving...</span>
                ) : (
                  "Save mapping"
                )}
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
