"use client";

import clsx from "clsx";
import Link from "next/link";
import type { ReactNode } from "react";
import type { Patient } from "@/lib/types";
import { PRACTICE_NAME } from "@/lib/data";
import { Avatar, Card, Icon } from "@/components/ui";
import { roleChip, useCurrentUser } from "@/components/shell";
import { currentPlan, staffLabel } from "./status";

/** Clinical screens are limited to physicians and medical assistants (permission matrix). */
export function ClinicalGate({ children }: { children: ReactNode }) {
  const { role } = useCurrentUser();
  if (role !== "admin") return <>{children}</>;
  return (
    <Card className="p-6 mt-6 text-center">
      <Icon name="lock" size={36} className="text-accent-fill mb-2" />
      <p className="text-title-md font-semibold mb-1">Clinical record not available</p>
      <p className="text-body-md text-text-secondary mb-4">Clinical data is limited to physicians and medical assistants. Practice admins manage membership and users.</p>
      <Link href="/patients" className="text-accent-fill font-semibold">
        Back to patients
      </Link>
    </Card>
  );
}

export function NotFoundCard() {
  return (
    <Card className="p-6 mt-6 text-center">
      <Icon name="person_search" size={36} className="text-text-tertiary mb-2" />
      <p className="text-title-md font-semibold mb-1">Patient not found</p>
      <p className="text-body-md text-text-secondary mb-4">This record does not exist or is not available to you.</p>
      <Link href="/patients" className="text-accent-fill font-semibold">
        Back to patients
      </Link>
    </Card>
  );
}

/** Compact patient context card used at the top of entry forms. */
export function PatientMini({ p }: { p: Patient }) {
  const plan = currentPlan(p.id);
  return (
    <Card className="p-3.5 flex items-center justify-between gap-3" as="div">
      <div className="flex items-center gap-3 min-w-0">
        <Avatar src={p.avatar} alt={p.name} size={44} className="ring-2 ring-accent-tint" />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[15px] font-semibold text-text-primary truncate">{p.name}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-text-tertiary/40" />
            <span className="text-caption-sm text-text-secondary">{p.age}y</span>
          </div>
          <p className="text-[12px] text-text-tertiary">ID {p.mrn}</p>
        </div>
      </div>
      <div className="text-right shrink-0">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-accent-tint text-accent-fill text-[12px] font-medium">
          {p.programWeek > 0 ? `Week ${p.programWeek}` : "New patient"}
        </span>
        {plan && <p className="text-[12px] text-text-tertiary mt-1">{plan.name}</p>}
      </div>
    </Card>
  );
}

/** "Entered by" attribution card for the signed-in staff user. */
export function EnteredBy({ note, patientSource }: { note?: string; patientSource?: boolean }) {
  const { staff } = useCurrentUser();
  if (!staff) return null;
  return (
    <div className="bg-surface-alt rounded-xl p-3 border border-border/70 flex items-center gap-3">
      <Avatar src={staff.avatar} alt="" size={36} className="border border-white" />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-text-primary truncate">Entered by {staffLabel(staff)}</p>
        <p className="text-[12px] text-text-secondary truncate">{note ?? PRACTICE_NAME}</p>
      </div>
      <span
        className={clsx(
          "text-[12px] px-2.5 py-1 rounded-full border shrink-0",
          patientSource ? "border-dashed border-text-tertiary text-text-secondary bg-surface" : "border-border/60 text-text-secondary bg-surface",
        )}
      >
        {patientSource ? "Patient-reported" : `Staff entry - ${roleChip(staff.role)}`}
      </span>
    </div>
  );
}

/** Single-select pill chips (method, arm, position). */
export function ChoiceChips<T extends string>({
  label,
  options,
  value,
  onChange,
  render,
  stretch,
}: {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  render?: (v: T) => string;
  stretch?: boolean;
}) {
  return (
    <fieldset>
      <legend className="block text-[12px] font-semibold text-text-secondary uppercase tracking-wider mb-2">{label}</legend>
      <div className={clsx("flex flex-wrap gap-2", stretch && "flex-nowrap")}>
        {options.map((o) => {
          const on = o === value;
          return (
            <button
              key={o}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(o)}
              className={clsx(
                "min-h-11 px-3.5 rounded-full border text-[13px] font-medium inline-flex items-center justify-center gap-1.5 transition-colors",
                stretch && "flex-1",
                on ? "bg-accent-tint text-accent-fill border-accent-fill/30 shadow-sm" : "bg-surface text-text-secondary border-border hover:bg-surface-alt",
              )}
            >
              {on && <Icon name="check" size={16} />}
              {render ? render(o) : o}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

/** Fixed bottom action bar for full-screen forms on phone (desktop uses the summary panel). */
export function MobileFormFooter({ children }: { children: ReactNode }) {
  return (
    <footer className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-surface/95 backdrop-blur border-t border-border px-5 pt-3.5 pb-[max(env(safe-area-inset-bottom),14px)] shadow-elevated-sheet">
      <div className="max-w-xl mx-auto">{children}</div>
    </footer>
  );
}

export function AuditNote() {
  return (
    <div className="flex items-center justify-center gap-1.5 mt-2.5 text-[12px] text-text-tertiary">
      <Icon name="lock" size={13} />
      <span>Secure entry - audit logged</span>
    </div>
  );
}
