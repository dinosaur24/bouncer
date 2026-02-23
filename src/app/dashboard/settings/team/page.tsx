"use client";

import { useState } from "react";

const members = [
  {
    name: "Sara Martinez",
    email: "sara@acme.com",
    initials: "SM",
    role: "Owner",
    status: "Active",
    joined: "Jun 15, 2025",
  },
  {
    name: "Matej Novak",
    email: "matej@acme.com",
    initials: "MN",
    role: "Admin",
    status: "Active",
    joined: "Jan 12, 2026",
  },
  {
    name: "Marco Rossi",
    email: "marco@acme.com",
    initials: "MR",
    role: "Member",
    status: "Pending",
    joined: "Invited Feb 23",
  },
];

export default function TeamPage() {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Member");

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
          className="flex-1 border border-border px-4 py-2.5 text-[13px] text-dark font-heading bg-white focus:outline-none focus:border-dark transition-colors placeholder:text-light-gray"
        />
        <div className="relative">
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value)}
            className="w-full md:w-[140px] border border-border px-4 py-2.5 text-[13px] text-dark font-heading bg-white focus:outline-none focus:border-dark transition-colors appearance-none cursor-pointer"
          >
            <option>Admin</option>
            <option>Member</option>
            <option>Viewer</option>
          </select>
        </div>
        <button className="bg-dark text-white font-heading text-[13px] font-medium px-5 py-2.5 hover:bg-dark/90 cursor-pointer shrink-0">
          Send invite
        </button>
      </div>

      {/* Team Members */}
      <div className="flex flex-col gap-4">
        <h3 className="font-heading text-[15px] font-semibold text-dark">
          Team members ({members.length} of 5)
        </h3>

        {/* Desktop table */}
        <div className="hidden md:block">
          <div className="grid grid-cols-4 py-2.5 border-b border-border text-xs text-gray font-heading">
            <span>Member</span>
            <span>Role</span>
            <span>Status</span>
            <span>Joined</span>
          </div>
          {members.map((m) => (
            <div
              key={m.email}
              className="grid grid-cols-4 py-3 border-b border-border items-center"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-dark flex items-center justify-center shrink-0">
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
                className={`text-xs font-medium px-2 py-0.5 w-fit ${
                  m.status === "Active"
                    ? "bg-green/10 text-green"
                    : "bg-[#FEF3C7] text-[#D97706]"
                }`}
              >
                {m.status}
              </span>
              <span className="text-[13px] text-gray">{m.joined}</span>
            </div>
          ))}
        </div>

        {/* Mobile cards */}
        <div className="md:hidden flex flex-col gap-3">
          {members.map((m) => (
            <div
              key={m.email}
              className="border border-border p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-dark flex items-center justify-center shrink-0">
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
              <span className="text-xs text-gray">{m.role}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
