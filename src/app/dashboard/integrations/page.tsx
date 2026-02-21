"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { useToast } from "@/components/Toast";
import { Modal } from "@/components/Modal";

interface IntegrationItem {
  name: string;
  iconBg: string;
  iconText: string;
  iconTextColor: string;
  description: string;
  connected: boolean | null;
  statusText: string | null;
  footerLink: string | null;
}

interface IntegrationCategory {
  category: string;
  items: IntegrationItem[];
}

const initialIntegrations: IntegrationCategory[] = [
  {
    category: "CRM & Sales",
    items: [
      {
        name: "HubSpot",
        iconBg: "#FF6B35",
        iconText: "H",
        iconTextColor: "text-white",
        description:
          "Sync validated leads directly to HubSpot contacts and deals",
        connected: true,
        statusText: null,
        footerLink: "Configure",
      },
      {
        name: "Salesforce",
        iconBg: "#0176D3",
        iconText: "S",
        iconTextColor: "text-white",
        description:
          "Push qualified leads to Salesforce with custom field mapping",
        connected: false,
        statusText: null,
        footerLink: null,
      },
    ],
  },
  {
    category: "Marketing & Automation",
    items: [
      {
        name: "Mailchimp",
        iconBg: "#FFE01B",
        iconText: "M",
        iconTextColor: "text-dark",
        description:
          "Auto-tag validated subscribers in Mailchimp audiences",
        connected: true,
        statusText: null,
        footerLink: "Configure",
      },
      {
        name: "ActiveCampaign",
        iconBg: "#7B68EE",
        iconText: "A",
        iconTextColor: "text-white",
        description:
          "Trigger automations based on lead validation scores",
        connected: false,
        statusText: null,
        footerLink: null,
      },
    ],
  },
  {
    category: "Webhooks & Developer",
    items: [
      {
        name: "Webhooks",
        iconBg: "#0D0D0D",
        iconText: "<>",
        iconTextColor: "text-white",
        description:
          "Send real-time validation events to custom endpoints",
        connected: null,
        statusText: "3 active",
        footerLink: "Manage",
      },
      {
        name: "Zapier",
        iconBg: "#FF4500",
        iconText: "Z",
        iconTextColor: "text-white",
        description:
          "Connect to 5,000+ apps through Zapier automations",
        connected: true,
        statusText: null,
        footerLink: "Configure",
      },
    ],
  },
];

const fieldMappings = [
  { bouncer: "Email", crm: "Email" },
  { bouncer: "Phone", crm: "Phone" },
  { bouncer: "Score", crm: "Lead Score (Custom)" },
];

export default function IntegrationsPage() {
  const { addToast } = useToast();
  const [integrations, setIntegrations] =
    useState<IntegrationCategory[]>(initialIntegrations);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [configuring, setConfiguring] = useState<string | null>(null);

  const updateIntegration = (
    name: string,
    updates: Partial<IntegrationItem>
  ) => {
    setIntegrations((prev) =>
      prev.map((cat) => ({
        ...cat,
        items: cat.items.map((item) =>
          item.name === name ? { ...item, ...updates } : item
        ),
      }))
    );
  };

  const handleConnect = (name: string) => {
    setConnecting(name);
    setTimeout(() => {
      updateIntegration(name, { connected: true, footerLink: "Configure" });
      addToast(`${name} connected successfully`);
      setConnecting(null);
    }, 1500);
  };

  const handleConfigure = (name: string) => {
    setConfiguring(name);
    setConfigModalOpen(true);
  };

  const handleDisconnect = () => {
    if (!configuring) return;
    updateIntegration(configuring, { connected: false, footerLink: null });
    addToast(`${configuring} disconnected`);
    setConfigModalOpen(false);
    setConfiguring(null);
  };

  const handleSaveMapping = () => {
    addToast("Field mapping saved");
    setConfigModalOpen(false);
    setConfiguring(null);
  };

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
        {integrations.map((category) => (
          <div key={category.category}>
            <h2 className="font-heading text-[15px] font-semibold text-dark mb-4">
              {category.category}
            </h2>

            <div className="grid grid-cols-3 gap-6">
              {category.items.map((item) => (
                <div
                  key={item.name}
                  className="border border-border p-6 flex flex-col gap-4"
                >
                  {/* Top */}
                  <div className="flex items-start gap-4">
                    <div
                      className="w-10 h-10 flex items-center justify-center shrink-0"
                      style={{ backgroundColor: item.iconBg }}
                    >
                      <span
                        className={`font-heading font-bold text-lg ${item.iconTextColor}`}
                      >
                        {item.iconText}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="font-heading text-[15px] font-semibold text-dark">
                        {item.name}
                      </span>
                      <span className="text-[13px] text-gray leading-relaxed">
                        {item.description}
                      </span>
                    </div>
                  </div>

                  {/* Bottom */}
                  <div className="border-t border-border pt-4 mt-auto flex justify-between items-center">
                    {/* Connection status */}
                    {item.connected === true ? (
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-green" />
                        <span className="text-[11px] text-green">
                          Connected
                        </span>
                      </div>
                    ) : item.connected === false ? (
                      <span className="text-[11px] text-gray">
                        Not connected
                      </span>
                    ) : (
                      <span className="text-[11px] text-gray">
                        {item.statusText}
                      </span>
                    )}

                    {/* Action */}
                    {item.footerLink ? (
                      <span
                        className="text-brand text-[13px] font-medium cursor-pointer hover:underline"
                        onClick={() => handleConfigure(item.name)}
                      >
                        {item.footerLink} &rarr;
                      </span>
                    ) : (
                      <button
                        className="border border-border text-dark font-heading text-[13px] px-4 py-1.5 cursor-pointer bg-white hover:bg-surface transition-colors"
                        onClick={() => handleConnect(item.name)}
                        disabled={connecting === item.name}
                      >
                        {connecting === item.name ? (
                          <span className="animate-pulse">Connecting...</span>
                        ) : (
                          "Connect"
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Configure Modal */}
      <Modal
        open={configModalOpen}
        onClose={() => {
          setConfigModalOpen(false);
          setConfiguring(null);
        }}
        title={`Configure ${configuring ?? ""}`}
      >
        <div className="flex flex-col gap-6">
          {/* Field Mapping */}
          <div>
            <h3 className="font-heading text-[13px] font-semibold text-dark mb-3">
              Field mapping
            </h3>
            <div className="flex flex-col gap-2">
              {fieldMappings.map((mapping) => (
                <div
                  key={mapping.bouncer}
                  className="flex items-center gap-3"
                >
                  <span className="bg-surface p-2 text-[13px] text-dark font-medium flex-1">
                    {mapping.bouncer}
                  </span>
                  <ArrowRight size={14} className="text-gray shrink-0" />
                  <span className="bg-surface p-2 text-[13px] text-dark font-medium flex-1">
                    {mapping.crm}
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
                  setConfiguring(null);
                }}
                className="border border-border text-dark font-heading text-[13px] font-medium px-5 py-2.5 cursor-pointer bg-white hover:bg-surface transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleSaveMapping}
                className="bg-brand text-white font-heading text-[13px] font-medium px-5 py-2.5 cursor-pointer hover:bg-brand/90 transition-colors border-none"
              >
                Save mapping
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
