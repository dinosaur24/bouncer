"use client";

import { useState } from "react";
import { useToast } from "@/components/Toast";
import { Modal } from "@/components/Modal";

const defaultSources = [
  {
    id: 1,
    title: "Contact Form",
    status: "Active" as const,
    description:
      "Main website contact form with name, email, phone, and company fields",
    submissions: "3,847",
    passRate: "86%",
    avgScore: "74",
    lastSubmission: "2m ago",
  },
  {
    id: 2,
    title: "Newsletter Signup",
    status: "Active" as const,
    description: "Email-only signup form on blog and resource pages",
    submissions: "12,453",
    passRate: "91%",
    avgScore: "81",
    lastSubmission: "5m ago",
  },
  {
    id: 3,
    title: "Demo Request",
    status: "Active" as const,
    description:
      "Enterprise demo booking form with detailed qualification fields",
    submissions: "892",
    passRate: "78%",
    avgScore: "68",
    lastSubmission: "18m ago",
  },
  {
    id: 4,
    title: "Webinar Registration",
    status: "Paused" as const,
    description: "Event registration form for monthly webinar series",
    submissions: "2,156",
    passRate: "83%",
    avgScore: "71",
    lastSubmission: "2h ago",
  },
  {
    id: 5,
    title: "API Endpoint",
    status: "Active" as const,
    description:
      "/api/v1/validate direct integration for custom forms",
    submissions: "8,721",
    passRate: "88%",
    avgScore: "76",
    lastSubmission: "30s ago",
  },
];

export default function SourcesPage() {
  const { addToast } = useToast();
  const [sources, setSources] = useState(defaultSources);

  // Add Source modal state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDomain, setNewDomain] = useState("");
  const [newSignals, setNewSignals] = useState({
    email: true,
    phone: true,
    ip: true,
    domain: true,
  });

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<typeof sources[0] | null>(null);

  const handleOpenAdd = () => {
    setNewName("");
    setNewDomain("");
    setNewSignals({ email: true, phone: true, ip: true, domain: true });
    setAddModalOpen(true);
  };

  const handleCreateSource = () => {
    if (!newName.trim()) return;
    const newSource = {
      id: Math.max(...sources.map((s) => s.id), 0) + 1,
      title: newName.trim(),
      status: "Active" as const,
      description: newDomain ? `Validation source for ${newDomain}` : "",
      submissions: "0",
      passRate: "N/A",
      avgScore: "N/A",
      lastSubmission: "N/A",
    };
    setSources((prev) => [...prev, newSource]);
    setAddModalOpen(false);
    addToast("Source created successfully");
  };

  const handleOpenEdit = (source: typeof sources[0]) => {
    setEditingSource({ ...source });
    setEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingSource) return;
    setSources((prev) =>
      prev.map((s) => (s.id === editingSource.id ? editingSource : s))
    );
    setEditModalOpen(false);
    addToast("Source updated");
  };

  return (
    <>
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-[28px] font-bold text-dark">
            Sources
          </h1>
          <p className="text-sm text-gray">
            Manage your form and API validation sources
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-dark text-white font-heading text-[13px] font-medium px-5 py-2.5 cursor-pointer hover:bg-dark/90 transition-colors"
        >
          Add Source
        </button>
      </div>

      {/* Sources Grid */}
      <div className="grid grid-cols-3 gap-6">
        {sources.map((source) => (
          <div
            key={source.id}
            className="border border-border p-6 flex flex-col gap-4"
          >
            {/* Top Row */}
            <div className="flex justify-between items-start">
              <span className="font-heading text-[15px] font-semibold text-dark">
                {source.title}
              </span>
              <span
                className={`text-[11px] font-medium px-2.5 py-0.5 ${
                  source.status === "Active"
                    ? "bg-[#F0FDF4] text-[#22C55E]"
                    : "bg-[#FFFBEB] text-[#F59E0B]"
                }`}
              >
                {source.status}
              </span>
            </div>

            {/* Description */}
            <p className="text-[13px] text-gray leading-relaxed">
              {source.description}
            </p>

            {/* Stats Row */}
            <div className="flex gap-8">
              <div className="flex flex-col gap-1">
                <span className="text-[11px] text-[#999999] uppercase tracking-wide">
                  Submissions
                </span>
                <span className="font-heading text-lg font-semibold text-dark">
                  {source.submissions}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] text-[#999999] uppercase tracking-wide">
                  Pass rate
                </span>
                <span className="font-heading text-lg font-semibold text-dark">
                  {source.passRate}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] text-[#999999] uppercase tracking-wide">
                  Avg score
                </span>
                <span className="font-heading text-lg font-semibold text-dark">
                  {source.avgScore}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-border pt-4 mt-auto flex justify-between items-center">
              <span className="text-[11px] text-[#999999]">
                Last submission {source.lastSubmission}
              </span>
              <span
                onClick={() => handleOpenEdit(source)}
                className="text-brand text-[13px] font-medium cursor-pointer hover:underline"
              >
                Edit &rarr;
              </span>
            </div>
          </div>
        ))}

        {/* Add New Source Card */}
        <div
          onClick={handleOpenAdd}
          className="border border-dashed border-[#D0D0D0] p-6 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-gray transition-colors"
        >
          <div className="w-10 h-10 border border-border flex items-center justify-center">
            <span className="text-gray text-xl">+</span>
          </div>
          <span className="text-[13px] text-gray font-medium">
            Add new source
          </span>
        </div>
      </div>

      {/* Add Source Modal */}
      <Modal open={addModalOpen} onClose={() => setAddModalOpen(false)} title="Add Source">
        <div className="flex flex-col gap-5">
          <div>
            <label className="text-[13px] text-gray mb-2 block">Source name</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full border border-border px-4 py-2.5 text-[13px] text-dark font-heading bg-white focus:outline-none focus:border-dark transition-colors"
            />
          </div>
          <div>
            <label className="text-[13px] text-gray mb-2 block">Domain</label>
            <input
              type="text"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              placeholder="yourdomain.com"
              className="w-full border border-border px-4 py-2.5 text-[13px] text-dark font-heading bg-white focus:outline-none focus:border-dark transition-colors"
            />
          </div>
          <div>
            <label className="text-[13px] text-gray mb-2 block">Signals</label>
            <div className="flex flex-col gap-2.5">
              {(["email", "phone", "ip", "domain"] as const).map((signal) => (
                <label key={signal} className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newSignals[signal]}
                    onChange={(e) =>
                      setNewSignals((prev) => ({ ...prev, [signal]: e.target.checked }))
                    }
                    className="w-4 h-4 accent-dark cursor-pointer"
                  />
                  <span className="text-[13px] text-dark font-heading capitalize">{signal === "ip" ? "IP" : signal.charAt(0).toUpperCase() + signal.slice(1)}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setAddModalOpen(false)}
              className="border border-border text-dark font-heading text-[13px] font-medium px-5 py-2.5 cursor-pointer hover:bg-surface transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateSource}
              className="bg-dark text-white font-heading text-[13px] font-medium px-5 py-2.5 cursor-pointer hover:bg-dark/90 transition-colors"
            >
              Create source
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Source Modal */}
      <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Source">
        {editingSource && (
          <div className="flex flex-col gap-5">
            <div>
              <label className="text-[13px] text-gray mb-2 block">Source name</label>
              <input
                type="text"
                value={editingSource.title}
                onChange={(e) =>
                  setEditingSource((prev) => prev ? { ...prev, title: e.target.value } : prev)
                }
                className="w-full border border-border px-4 py-2.5 text-[13px] text-dark font-heading bg-white focus:outline-none focus:border-dark transition-colors"
              />
            </div>
            <div>
              <label className="text-[13px] text-gray mb-2 block">Description</label>
              <textarea
                value={editingSource.description}
                onChange={(e) =>
                  setEditingSource((prev) => prev ? { ...prev, description: e.target.value } : prev)
                }
                rows={3}
                className="w-full border border-border px-4 py-2.5 text-[13px] text-dark font-heading bg-white focus:outline-none focus:border-dark transition-colors resize-none"
              />
            </div>
            <div>
              <label className="text-[13px] text-gray mb-2 block">Status</label>
              <div className="flex gap-0">
                <button
                  onClick={() =>
                    setEditingSource((prev) => prev ? { ...prev, status: "Active" as const } : prev)
                  }
                  className={`font-heading text-[13px] font-medium px-5 py-2.5 cursor-pointer transition-colors ${
                    editingSource.status === "Active"
                      ? "bg-dark text-white"
                      : "border border-border text-dark hover:bg-surface"
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() =>
                    setEditingSource((prev) => prev ? { ...prev, status: "Paused" as const } : prev)
                  }
                  className={`font-heading text-[13px] font-medium px-5 py-2.5 cursor-pointer transition-colors ${
                    editingSource.status === "Paused"
                      ? "bg-dark text-white"
                      : "border border-border text-dark hover:bg-surface"
                  }`}
                >
                  Paused
                </button>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setEditModalOpen(false)}
                className="border border-border text-dark font-heading text-[13px] font-medium px-5 py-2.5 cursor-pointer hover:bg-surface transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="bg-dark text-white font-heading text-[13px] font-medium px-5 py-2.5 cursor-pointer hover:bg-dark/90 transition-colors"
              >
                Save changes
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
