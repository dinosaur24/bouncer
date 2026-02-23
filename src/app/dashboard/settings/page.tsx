"use client";

import { useState } from "react";
import { useToast } from "@/components/Toast";
import { Modal } from "@/components/Modal";

const initialForm = {
  firstName: "Sara",
  lastName: "Martinez",
  email: "sara@techcorp.io",
  company: "TechCorp Inc.",
};

export default function SettingsPage() {
  const { addToast } = useToast();

  const [form, setForm] = useState({ ...initialForm });
  const [savedForm, setSavedForm] = useState({ ...initialForm });

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");

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

      {/* Profile Information */}
      <div className="flex flex-col gap-2">
        <h2 className="font-heading text-[15px] font-semibold text-dark">
          Profile Information
        </h2>
        <p className="text-[13px] text-gray">
          Update your personal details and email address.
        </p>
      </div>

      <div className="flex flex-col gap-8 max-w-[560px]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          <div className="col-span-1 md:col-span-2">
            <label className="text-[13px] text-gray mb-2 block">
              Email address
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, email: e.target.value }))
              }
              className="w-full border border-border px-4 py-2.5 text-[13px] text-dark font-heading bg-white focus:outline-none focus:border-dark transition-colors"
            />
          </div>
          <div className="col-span-1 md:col-span-2">
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

      {/* Danger Zone */}
      <div className="mt-4 border border-[#FEE2E2] p-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
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
            className="bg-brand text-white font-heading text-[13px] font-medium px-5 py-2.5 hover:bg-brand/90 cursor-pointer shrink-0"
          >
            Delete account
          </button>
        </div>
      </div>

      {/* Delete Account Modal */}
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
    </>
  );
}
