"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";
import { Modal } from "@/components/Modal";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";

export default function SettingsPage() {
  const { addToast } = useToast();
  const { user } = useAuth();
  const { updateProfile, deleteAccount, isLoading } = useSettings();
  const router = useRouter();

  const [form, setForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    company: user?.company || "",
  });

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSave = async () => {
    try {
      await updateProfile(form);
      addToast("Profile updated");
    } catch {
      addToast("Failed to update profile", "error");
    }
  };

  const handleCancel = () => {
    setForm({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      company: user?.company || "",
    });
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
      addToast("Account deleted", "error");
      setDeleteModalOpen(false);
      setDeleteConfirm("");
      router.push("/");
    } catch {
      addToast("Failed to delete account", "error");
      setIsDeleting(false);
    }
  };

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
              className="w-full border border-border rounded-lg px-4 py-2.5 text-[13px] text-dark font-heading bg-white focus:outline-none focus:border-dark transition-colors"
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
              className="w-full border border-border rounded-lg px-4 py-2.5 text-[13px] text-dark font-heading bg-white focus:outline-none focus:border-dark transition-colors"
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
              className="w-full border border-border rounded-lg px-4 py-2.5 text-[13px] text-dark font-heading bg-white focus:outline-none focus:border-dark transition-colors"
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
              className="w-full border border-border rounded-lg px-4 py-2.5 text-[13px] text-dark font-heading bg-white focus:outline-none focus:border-dark transition-colors"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={isLoading}
            className={`bg-dark text-white font-heading text-[13px] font-medium px-5 py-2.5 hover:bg-dark/90 cursor-pointer rounded-lg ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? "Saving..." : "Save changes"}
          </button>
          <button
            onClick={handleCancel}
            className="border border-border rounded-lg text-dark font-heading text-[13px] font-medium px-5 py-2.5 hover:bg-surface cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="mt-4 border border-[#FEE2E2] rounded-lg p-6">
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
            className="bg-brand text-white font-heading text-[13px] font-medium px-5 py-2.5 hover:bg-brand/90 cursor-pointer shrink-0 rounded-lg"
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
              className="w-full border border-border rounded-lg px-4 py-2.5 text-[13px] text-dark font-heading bg-white focus:outline-none focus:border-dark transition-colors"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleDeleteAccount}
              disabled={deleteConfirm !== "DELETE" || isDeleting}
              className={`bg-brand text-white font-heading text-[13px] font-medium px-5 py-2.5 rounded-lg ${
                deleteConfirm === "DELETE" && !isDeleting
                  ? "hover:bg-brand/90 cursor-pointer"
                  : "opacity-50 cursor-not-allowed"
              }`}
            >
              {isDeleting ? "Deleting..." : "Delete my account"}
            </button>
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="border border-border rounded-lg text-dark font-heading text-[13px] font-medium px-5 py-2.5 hover:bg-surface cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
