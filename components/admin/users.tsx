"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import { permissionMatrix } from "@/lib/data";
import { fmtDay } from "@/lib/format";
import { Avatar, Button, Card, Field, Icon, StatusPill, inputCls } from "@/components/ui";
import { Confirmation } from "./common";

export function StaffList({ canEdit, userId }: { canEdit: boolean; userId: string }) {
  const staff = useApp((s) => s.staff);
  const setStaffStatus = useApp((s) => s.setStaffStatus);

  const change = (id: string, name: string, to: "active" | "removed") => {
    const q = to === "removed" ? `Remove access for ${name}? Their sessions end immediately.` : `Restore access for ${name}?`;
    if (window.confirm(q)) setStaffStatus(id, to, userId);
  };

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <h2 className="text-[18px] font-semibold">Clinic staff</h2>
        <span className="bg-surface-variant text-text-secondary text-caption-sm px-2 py-0.5 rounded-full">{staff.length}</span>
      </div>
      <Card className="px-4 py-1 divide-y divide-border">
        {staff.map((s) => {
          const removed = s.status === "removed";
          return (
            <div key={s.id} className="py-3.5 flex items-center justify-between gap-3 flex-wrap">
              <div className={`flex items-center gap-3 min-w-0 `}>
                <Avatar src={s.avatar} alt="" size={40} className={`ring-1 ring-border ${removed ? "grayscale-[20%]" : ""}`} />
                <div className="min-w-0">
                  <p className={`text-[15px] font-semibold truncate ${removed ? "text-text-secondary" : "text-text-primary"}`}>
                    {s.name}
                    {s.role === "physician" ? ", MD" : ""}
                  </p>
                  <p className={`text-[13px] truncate ${removed ? "text-text-tertiary" : "text-text-secondary"}`}>{s.title}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                {removed ? <StatusPill tone="muted">Access removed {s.removedOn ? fmtDay(s.removedOn) : ""}</StatusPill> : <StatusPill tone="success">Active</StatusPill>}
                {canEdit && s.id !== userId && (
                  <button
                    type="button"
                    onClick={() => change(s.id, s.name, removed ? "active" : "removed")}
                    className={`h-11 px-3 rounded-full text-[13px] font-semibold ${removed ? "text-accent-fill hover:bg-accent-tint" : "text-danger hover:bg-danger-tint"}`}
                  >
                    {removed ? "Restore" : "Remove access"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </Card>
    </section>
  );
}

function Cell({ on, label }: { on: boolean; label: string }) {
  return (
    <div role="cell" className="col-span-2 flex justify-center" aria-label={on ? `${label}: allowed` : `${label}: not allowed`}>
      {on ? <Icon name="check" size={19} className="text-accent-fill" /> : <span className="text-text-tertiary text-sm font-semibold">-</span>}
    </div>
  );
}

export function PermissionMatrix() {
  return (
    <Card className="p-5 flex flex-col gap-4 overflow-hidden">
      <div>
        <h3 className="text-title-md font-semibold">Permission matrix</h3>
        <p className="text-caption-sm text-text-secondary mt-0.5">Role-based access privileges</p>
      </div>
      <div role="table" aria-label="Permission matrix">
        <div role="row" className="grid grid-cols-12 pb-3 border-b border-border items-center">
          <span role="columnheader" className="col-span-6 text-caption-sm text-text-secondary font-medium">
            Capability
          </span>
          {["MD", "MA", "Admin"].map((r) => (
            <span role="columnheader" key={r} className="col-span-2 flex justify-center">
              <span className="bg-accent-tint text-accent-fill text-[12px] font-semibold px-2 py-0.5 rounded-full">{r}</span>
            </span>
          ))}
        </div>
        <div className="divide-y divide-border">
          {permissionMatrix.map((row) => (
            <div role="row" key={row.key} className="grid grid-cols-12 py-3 items-center">
              <span role="cell" className="col-span-6 text-[13px] text-text-primary">
                {row.label}
              </span>
              <Cell on={row.physician} label="MD" />
              <Cell on={row.ma} label="MA" />
              <Cell on={row.admin} label="Admin" />
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2 bg-surface-alt -mx-5 -mb-5 p-4 border-t border-border">
        <p className="flex items-start gap-2 text-caption-sm text-text-secondary">
          <Icon name="shield" size={18} className="shrink-0" />
          Admin access does not include clinical records by default.
        </p>
        <p className="flex items-center gap-1.5 text-[12px] text-text-tertiary">
          <Icon name="verified_user" size={15} />
          Role changes are recorded in the audit log.
        </p>
      </div>
    </Card>
  );
}

export function InviteForm() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("Medical assistant");
  const [sent, setSent] = useState("");
  const [error, setError] = useState("");

  if (!open)
    return (
      <div className="space-y-3">
        {sent && <Confirmation>{sent}</Confirmation>}
        <Button full icon="add" onClick={() => setOpen(true)}>
          Invite user
        </Button>
      </div>
    );

  return (
    <Card className="p-4 space-y-3">
      <h2 className="text-title-md font-semibold">Invite user</h2>
      <Field label="Full name" error={error}>
        <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sam Ortiz" />
      </Field>
      <Field label="Role">
        <select className={inputCls} value={role} onChange={(e) => setRole(e.target.value)}>
          <option>Medical assistant</option>
          <option>Physician</option>
          <option>Practice admin</option>
        </select>
      </Field>
      <div className="flex gap-2">
        <Button variant="secondary" className="flex-1" onClick={() => setOpen(false)}>
          Cancel
        </Button>
        <Button
          className="flex-1"
          onClick={() => {
            if (!name.trim()) return setError("Enter a name.");
            setSent(`Invitation prepared for ${name.trim()} (${role}). They set up MFA on first sign-in.`);
            setName("");
            setError("");
            setOpen(false);
          }}
        >
          Send invite
        </Button>
      </div>
    </Card>
  );
}
