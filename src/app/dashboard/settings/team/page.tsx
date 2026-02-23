"use client";

import { useState } from "react";
import { useTeam } from "@/contexts/TeamContext";
import { useToast } from "@/components/Toast";
import { Modal } from "@/components/Modal";
import type { TeamMember } from "@/lib/types";

export default function TeamPage() {
  const { members, isLoading, inviteMember, removeMember } = useTeam();
  const { addToast } = useToast();
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Member");
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null);

  const handleInvite = async () => {
    if (!inviteEmail) return;
    await inviteMember(inviteEmail, inviteRole as TeamMember["role"]);
    addToast("Invite sent to " + inviteEmail, "success");
    setInviteEmail("");
  };

  const handleRemoveClick = (member: TeamMember) => {
    setMemberToRemove(member);
    setShowRemoveConfirm(true);
  };

  const handleConfirmRemove = async () => {
    if (!memberToRemove) return;
    setRemovingId(memberToRemove.id);
    try {
      await removeMember(memberToRemove.id);
      addToast(`${memberToRemove.name} removed from team`, "success");
    } catch {
      addToast("Failed to remove member. Please try again.", "error");
    } finally {
      setRemovingId(null);
      setShowRemoveConfirm(false);
      setMemberToRemove(null);
    }
  };

  const formatJoined = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <>
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-[28px] font-bold text-dark">Team</h1>
        <p className="text-sm text-gray">Invite and manage team members</p>
      </div>

      {/* Invite Form */}
      <div className="flex flex-col md:flex-row gap-3">
        <input
          type="email"
          value={inviteEmail}
          onChange={(e) => setInviteEmail(e.target.value)}
          placeholder="colleague@company.com"
          className="flex-1 border border-border rounded-lg px-4 py-2.5 text-[13px] text-dark font-heading bg-white focus:outline-none focus:border-dark transition-colors placeholder:text-light-gray"
        />
        <div className="relative">
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value)}
            className="w-full md:w-[140px] border border-border rounded-lg px-4 py-2.5 text-[13px] text-dark font-heading bg-white focus:outline-none focus:border-dark transition-colors appearance-none cursor-pointer"
          >
            <option>Admin</option>
            <option>Member</option>
            <option>Viewer</option>
          </select>
        </div>
        <button
          onClick={handleInvite}
          disabled={isLoading || !inviteEmail}
          className="bg-dark text-white font-heading text-[13px] font-medium px-5 py-2.5 hover:bg-dark/90 cursor-pointer shrink-0 disabled:opacity-60 rounded-lg"
        >
          {isLoading ? (
            <span className="animate-pulse">Sending...</span>
          ) : (
            "Send invite"
          )}
        </button>
      </div>

      {/* Team Members */}
      <div className="flex flex-col gap-4">
        <h3 className="font-heading text-[15px] font-semibold text-dark">
          Team members ({members.length} of 5)
        </h3>

        {/* Desktop table */}
        <div className="hidden md:block">
          <div className="grid grid-cols-5 py-2.5 border-b border-border text-xs text-gray font-heading">
            <span>Member</span>
            <span>Role</span>
            <span>Status</span>
            <span>Joined</span>
            <span></span>
          </div>
          {members.map((m) => (
            <div
              key={m.id}
              className="grid grid-cols-5 py-3 border-b border-border items-center"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-dark rounded-lg flex items-center justify-center shrink-0">
                  <span className="text-white font-heading text-[11px] font-medium">
                    {m.initials}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[13px] font-heading font-medium text-dark">
                    {m.name}
                  </span>
                  <span className="text-xs text-gray">{m.email}</span>
                </div>
              </div>
              <span className="text-[13px] text-dark font-heading">
                {m.role}
              </span>
              <span
                className={`text-xs font-medium px-2 py-0.5 w-fit rounded-lg ${
                  m.status === "Active"
                    ? "bg-green/10 text-green"
                    : "bg-[#FEF3C7] text-[#D97706]"
                }`}
              >
                {m.status}
              </span>
              <span className="text-[13px] text-gray">{formatJoined(m.joinedAt)}</span>
              <div>
                {m.role !== "Owner" && (
                  <button
                    onClick={() => handleRemoveClick(m)}
                    disabled={removingId === m.id}
                    className="text-[13px] text-brand font-heading font-medium hover:underline cursor-pointer bg-transparent border-none p-0 disabled:opacity-60"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Mobile cards */}
        <div className="md:hidden flex flex-col gap-3">
          {members.map((m) => (
            <div
              key={m.id}
              className="border border-border rounded-lg p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-dark rounded-lg flex items-center justify-center shrink-0">
                  <span className="text-white font-heading text-[11px] font-medium">
                    {m.initials}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[13px] font-heading font-medium text-dark">
                    {m.name}
                  </span>
                  <span className="text-xs text-gray">{m.email}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray">{m.role}</span>
                {m.role !== "Owner" && (
                  <button
                    onClick={() => handleRemoveClick(m)}
                    disabled={removingId === m.id}
                    className="text-[11px] text-brand font-medium hover:underline cursor-pointer bg-transparent border-none p-0"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Remove Confirmation Modal */}
      <Modal
        open={showRemoveConfirm}
        onClose={() => {
          setShowRemoveConfirm(false);
          setMemberToRemove(null);
        }}
        title="Remove Team Member"
      >
        <div className="flex flex-col gap-6">
          <p className="text-[13px] text-gray leading-relaxed">
            Are you sure you want to remove{" "}
            <span className="font-medium text-dark">{memberToRemove?.name}</span> from
            the team? They will lose access to all Bouncer resources.
          </p>
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => {
                setShowRemoveConfirm(false);
                setMemberToRemove(null);
              }}
              className="border border-border rounded-lg text-dark font-heading text-[13px] font-medium px-5 py-2.5 cursor-pointer bg-white hover:bg-surface transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmRemove}
              disabled={removingId !== null}
              className="bg-brand text-white font-heading text-[13px] font-medium px-5 py-2.5 cursor-pointer hover:bg-brand/90 transition-colors border-none disabled:opacity-60 rounded-lg"
            >
              {removingId ? (
                <span className="animate-pulse">Removing...</span>
              ) : (
                "Remove member"
              )}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
