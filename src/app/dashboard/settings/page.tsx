"use client";

import { useState } from "react";
import { Lock, Bell, CreditCard } from "lucide-react";
import { useToast } from "@/components/Toast";
import { Modal } from "@/components/Modal";

const tabs = [
  { key: "Profile", locked: false },
  { key: "API Keys", locked: true },
  { key: "Notifications", locked: false },
  { key: "Billing", locked: false },
];

const initialForm = {
  firstName: "Sara",
  lastName: "Martinez",
  email: "sara@techcorp.io",
  company: "TechCorp Inc.",
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("Profile");
  const { addToast } = useToast();

  // Profile form state
  const [form, setForm] = useState({ ...initialForm });
  const [savedForm, setSavedForm] = useState({ ...initialForm });

  // Delete account modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  // Notification toggle states
  const [dailyDigest, setDailyDigest] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(false);
  const [rejectedAlerts, setRejectedAlerts] = useState(true);
  const [slackWebhook, setSlackWebhook] = useState("");
  const [slackRejected, setSlackRejected] = useState(false);

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
                value={form.firstName}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, firstName: e.target.value }))
                }
                className="w-full border border-border px-4 py-2.5 text-[13px] text-dark font-heading bg-white focus:outline-none focus:border-dark transition-colors"
              />
            </div>
            <div>
              <label className="text-[13px] text-gray mb-2 block">
                Last name
              </label>
              <input
                type="text"
                value={form.lastName}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, lastName: e.target.value }))
                }
                className="w-full border border-border px-4 py-2.5 text-[13px] text-dark font-heading bg-white focus:outline-none focus:border-dark transition-colors"
              />
            </div>
            <div className="col-span-2">
              <label className="text-[13px] text-gray mb-2 block">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, email: e.target.value }))
                }
                className="w-full border border-border px-4 py-2.5 text-[13px] text-dark font-heading bg-white focus:outline-none focus:border-dark transition-colors"
              />
            </div>
            <div className="col-span-2">
              <label className="text-[13px] text-gray mb-2 block">
                Company
              </label>
              <input
                type="text"
                value={form.company}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, company: e.target.value }))
                }
                className="w-full border border-border px-4 py-2.5 text-[13px] text-dark font-heading bg-white focus:outline-none focus:border-dark transition-colors"
              />
            </div>
          </div>

          {/* Button Row */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                setSavedForm(form);
                addToast("Settings saved successfully");
              }}
              className="bg-dark text-white font-heading text-[13px] font-medium px-5 py-2.5 hover:bg-dark/90 cursor-pointer"
            >
              Save changes
            </button>
            <button
              onClick={() => setForm(savedForm)}
              className="border border-border text-dark font-heading text-[13px] font-medium px-5 py-2.5 hover:bg-surface cursor-pointer"
            >
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
            <button
              onClick={() => {
                setDeleteConfirm("");
                setDeleteModalOpen(true);
              }}
              className="bg-brand text-white font-heading text-[13px] font-medium px-5 py-2.5 hover:bg-brand/90 cursor-pointer"
            >
              Delete account
            </button>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      <Modal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete account"
      >
        <div className="flex flex-col gap-5">
          <p className="text-[13px] text-gray leading-relaxed">
            Are you sure you want to delete your account? This will permanently
            remove all your data, validation history, and integrations. This
            action cannot be undone.
          </p>
          <div>
            <label className="text-[13px] text-gray mb-2 block">
              Type DELETE to confirm
            </label>
            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              className="w-full border border-border px-4 py-2.5 text-[13px] text-dark font-heading bg-white focus:outline-none focus:border-dark transition-colors"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                addToast("Account deletion initiated", "error");
                setDeleteModalOpen(false);
                setDeleteConfirm("");
              }}
              disabled={deleteConfirm !== "DELETE"}
              className={`bg-brand text-white font-heading text-[13px] font-medium px-5 py-2.5 ${
                deleteConfirm === "DELETE"
                  ? "hover:bg-brand/90 cursor-pointer"
                  : "opacity-50 cursor-not-allowed"
              }`}
            >
              Delete my account
            </button>
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="border border-border text-dark font-heading text-[13px] font-medium px-5 py-2.5 hover:bg-surface cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Notifications Tab */}
      {activeTab === "Notifications" && (
        <div className="flex flex-col gap-8 max-w-[560px]">
          {/* Email Notifications */}
          <div>
            <h3 className="font-heading text-[15px] font-semibold text-dark mb-4">
              Email notifications
            </h3>
            <div className="flex flex-col">
              {/* Daily validation digest */}
              <div className="flex justify-between items-center py-3 border-b border-border">
                <div>
                  <p className="text-[13px] font-heading font-medium text-dark">
                    Daily validation digest
                  </p>
                  <p className="text-[12px] text-gray mt-0.5">
                    Receive a daily summary of validation results
                  </p>
                </div>
                <button
                  onClick={() => setDailyDigest(!dailyDigest)}
                  className={`w-[44px] h-[24px] rounded-full relative transition-colors cursor-pointer ${
                    dailyDigest ? "bg-dark" : "bg-[#D0D0D0]"
                  }`}
                >
                  <div
                    className={`w-[20px] h-[20px] rounded-full bg-white absolute top-[2px] transition-all ${
                      dailyDigest ? "left-[22px]" : "left-[2px]"
                    }`}
                  />
                </button>
              </div>

              {/* Weekly performance report */}
              <div className="flex justify-between items-center py-3 border-b border-border">
                <div>
                  <p className="text-[13px] font-heading font-medium text-dark">
                    Weekly performance report
                  </p>
                </div>
                <button
                  onClick={() => setWeeklyReport(!weeklyReport)}
                  className={`w-[44px] h-[24px] rounded-full relative transition-colors cursor-pointer ${
                    weeklyReport ? "bg-dark" : "bg-[#D0D0D0]"
                  }`}
                >
                  <div
                    className={`w-[20px] h-[20px] rounded-full bg-white absolute top-[2px] transition-all ${
                      weeklyReport ? "left-[22px]" : "left-[2px]"
                    }`}
                  />
                </button>
              </div>

              {/* Rejected lead alerts */}
              <div className="flex justify-between items-center py-3 border-b border-border">
                <div>
                  <p className="text-[13px] font-heading font-medium text-dark">
                    Rejected lead alerts
                  </p>
                  <p className="text-[12px] text-gray mt-0.5">
                    Get notified when leads are rejected
                  </p>
                </div>
                <button
                  onClick={() => setRejectedAlerts(!rejectedAlerts)}
                  className={`w-[44px] h-[24px] rounded-full relative transition-colors cursor-pointer ${
                    rejectedAlerts ? "bg-dark" : "bg-[#D0D0D0]"
                  }`}
                >
                  <div
                    className={`w-[20px] h-[20px] rounded-full bg-white absolute top-[2px] transition-all ${
                      rejectedAlerts ? "left-[22px]" : "left-[2px]"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Slack Notifications */}
          <div className="mt-6">
            <h3 className="font-heading text-[15px] font-semibold text-dark mb-4">
              Slack notifications
            </h3>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-[13px] text-gray mb-2 block">
                  Webhook URL
                </label>
                <input
                  type="text"
                  value={slackWebhook}
                  onChange={(e) => setSlackWebhook(e.target.value)}
                  placeholder="https://hooks.slack.com/..."
                  className="w-full border border-border px-4 py-2.5 text-[13px] text-dark font-heading bg-white focus:outline-none focus:border-dark transition-colors placeholder:text-light-gray"
                />
              </div>
              <div className="flex justify-between items-center py-3 border-b border-border">
                <div>
                  <p className="text-[13px] font-heading font-medium text-dark">
                    Send rejected alerts to Slack
                  </p>
                </div>
                <button
                  onClick={() => setSlackRejected(!slackRejected)}
                  className={`w-[44px] h-[24px] rounded-full relative transition-colors cursor-pointer ${
                    slackRejected ? "bg-dark" : "bg-[#D0D0D0]"
                  }`}
                >
                  <div
                    className={`w-[20px] h-[20px] rounded-full bg-white absolute top-[2px] transition-all ${
                      slackRejected ? "left-[22px]" : "left-[2px]"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Save Preferences Button */}
          <div>
            <button
              onClick={() => addToast("Notification preferences saved")}
              className="bg-dark text-white font-heading text-[13px] font-medium px-5 py-2.5 hover:bg-dark/90 cursor-pointer"
            >
              Save preferences
            </button>
          </div>
        </div>
      )}

      {/* Billing Tab */}
      {activeTab === "Billing" && (
        <div className="flex flex-col gap-0 max-w-[560px]">
          {/* Current Plan */}
          <div className="border border-border p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-heading text-[15px] font-semibold text-dark">
                  Starter Plan
                </h3>
                <p className="text-[24px] font-heading font-bold text-dark mt-1">
                  $49
                  <span className="text-[13px] font-normal text-gray">
                    /month
                  </span>
                </p>
                <p className="text-[13px] text-gray mt-1">
                  2,500 validations/month
                </p>
              </div>
            </div>
            <div className="mb-4">
              <div className="flex justify-between text-[12px] text-gray mb-1.5">
                <span>1,247 of 2,500 used</span>
              </div>
              <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
                <div
                  className="h-full bg-dark rounded-full"
                  style={{ width: "49.88%" }}
                />
              </div>
            </div>
            <button className="bg-dark text-white font-heading text-[13px] font-medium px-5 py-2.5 hover:bg-dark/90 cursor-pointer">
              Upgrade plan
            </button>
          </div>

          {/* Payment Method */}
          <div className="border border-border p-6 mt-6">
            <h3 className="font-heading text-[15px] font-semibold text-dark mb-3">
              Payment method
            </h3>
            <div className="flex justify-between items-center">
              <p className="text-[13px] text-dark font-heading">
                Visa ending in 4242
              </p>
              <button className="text-[13px] text-brand font-heading font-medium hover:underline cursor-pointer">
                Update
              </button>
            </div>
          </div>

          {/* Billing History */}
          <div className="mt-6">
            <h3 className="font-heading text-[15px] font-semibold text-dark mb-4">
              Billing history
            </h3>
            <div className="flex flex-col">
              <div className="flex justify-between items-center py-3 border-b border-border">
                <div className="flex items-center gap-4">
                  <span className="text-[13px] text-dark font-heading">
                    Feb 2026
                  </span>
                  <span className="text-[13px] text-dark font-heading">
                    $49.00
                  </span>
                  <span className="text-[12px] text-gray">Paid</span>
                </div>
                <button className="text-[13px] text-brand font-heading font-medium hover:underline cursor-pointer">
                  Download
                </button>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-border">
                <div className="flex items-center gap-4">
                  <span className="text-[13px] text-dark font-heading">
                    Jan 2026
                  </span>
                  <span className="text-[13px] text-dark font-heading">
                    $49.00
                  </span>
                  <span className="text-[12px] text-gray">Paid</span>
                </div>
                <button className="text-[13px] text-brand font-heading font-medium hover:underline cursor-pointer">
                  Download
                </button>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-border">
                <div className="flex items-center gap-4">
                  <span className="text-[13px] text-dark font-heading">
                    Dec 2025
                  </span>
                  <span className="text-[13px] text-dark font-heading">
                    $49.00
                  </span>
                  <span className="text-[12px] text-gray">Paid</span>
                </div>
                <button className="text-[13px] text-brand font-heading font-medium hover:underline cursor-pointer">
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
