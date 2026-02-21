"use client";

const integrations = [
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

export default function IntegrationsPage() {
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
                      <span className="text-brand text-[13px] font-medium cursor-pointer hover:underline">
                        {item.footerLink} &rarr;
                      </span>
                    ) : (
                      <button className="border border-border text-dark font-heading text-[13px] px-4 py-1.5 cursor-pointer bg-white hover:bg-surface transition-colors">
                        Connect
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
