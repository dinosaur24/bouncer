"use client";

import { useState } from "react";
import { Lock } from "lucide-react";

const tabs = [
  { key: "Profile", locked: false },
  { key: "API Keys", locked: true },
  { key: "Notifications", locked: false },
  { key: "Billing", locked: false },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("Profile");

  return (
    <>
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-[28px] font-bold text-dark">
          Settings
        </h1>
        <p className="text-sm text-gray">
          Manage your account and preferences
        </p>
      </div>

      {/* Tabs Row */}
      <div className="flex border-b border-border gap-0">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => !tab.locked && setActiveTab(tab.key)}
            className={`px-5 py-3 text-[13px] font-heading font-medium cursor-pointer relative ${
              tab.locked
                ? "text-light-gray cursor-not-allowed opacity-50"
                : tab.key === activeTab
                  ? "text-dark"
                  : "text-gray hover:text-dark"
            }`}
          >
            <span className="flex items-center gap-1.5">
              {tab.key}
              {tab.locked && <Lock size={14} />}
            </span>
            {tab.key === activeTab && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand" />
            )}
          </button>
        ))}
      </div>

      {/* Profile Form Section */}
      {activeTab === "Profile" && (
        <div className="flex flex-col gap-8 max-w-[560px]">
          {/* Form Fields */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-[13px] text-gray mb-2 block">
                First name
              </label>
              <input
                type="text"
                defaultValue="Sara"
                className="w-full border border-border px-4 py-2.5 text-[13px] text-dark font-heading bg-white focus:outline-none focus:border-dark transition-colors"
              />
            </div>
            <div>
              <label className="text-[13px] text-gray mb-2 block">
                Last name
              </label>
              <input
                type="text"
                defaultValue="Martinez"
                className="w-full border border-border px-4 py-2.5 text-[13px] text-dark font-heading bg-white focus:outline-none focus:border-dark transition-colors"
              />
            </div>
            <div className="col-span-2">
              <label className="text-[13px] text-gray mb-2 block">Email</label>
              <input
                type="email"
                defaultValue="sara@techcorp.io"
                className="w-full border border-border px-4 py-2.5 text-[13px] text-dark font-heading bg-white focus:outline-none focus:border-dark transition-colors"
              />
            </div>
            <div className="col-span-2">
              <label className="text-[13px] text-gray mb-2 block">
                Company
              </label>
              <input
                type="text"
                defaultValue="TechCorp Inc."
                className="w-full border border-border px-4 py-2.5 text-[13px] text-dark font-heading bg-white focus:outline-none focus:border-dark transition-colors"
              />
            </div>
          </div>

          {/* Button Row */}
          <div className="flex gap-3">
            <button className="bg-dark text-white font-heading text-[13px] font-medium px-5 py-2.5 hover:bg-dark/90">
              Save changes
            </button>
            <button className="border border-border text-dark font-heading text-[13px] font-medium px-5 py-2.5 hover:bg-surface">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Danger Zone */}
      {activeTab === "Profile" && (
        <div className="mt-12 border border-[#FEE2E2] p-6">
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-2">
              <h3 className="font-heading text-[15px] font-semibold text-dark">
                Delete account
              </h3>
              <p className="text-[13px] text-gray">
                Permanently delete your account and all associated data. This
                action cannot be undone.
              </p>
            </div>
            <button className="bg-brand text-white font-heading text-[13px] font-medium px-5 py-2.5 hover:bg-brand/90">
              Delete account
            </button>
          </div>
        </div>
      )}
    </>
  );
}
