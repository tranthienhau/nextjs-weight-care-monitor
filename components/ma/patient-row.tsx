"use client";

import Link from "next/link";
import type { Measurement, Patient } from "@/lib/types";
import { fmtDay, fmtVal } from "@/lib/format";
import { Avatar, StatusPill } from "@/components/ui";
import { patientChip, type ReviewItems } from "./status";

/** One patient row: avatar, name, MRN - week, status chip, latest weight. */
export function PatientRow({ p, items, lastWeight, clinical }: { p: Patient; items: ReviewItems; lastWeight?: Measurement; clinical: boolean }) {
  const chip = patientChip(p, items);
  return (
    <Link
      href={`/patients/${p.id}`}
      className="bg-surface rounded-2xl p-3.5 shadow-ambient border border-border/60 hover:border-accent-fill/40 transition-all flex items-center justify-between gap-3"
    >
      <div className="flex items-center gap-3 min-w-0">
        <Avatar src={p.avatar} alt={p.name} size={48} className="ring-1 ring-border" />
        <div className="min-w-0">
          <h2 className="text-label-md font-bold text-text-primary truncate">{p.name}</h2>
          <p className="text-caption-sm text-text-secondary truncate">
            {p.mrn} • {p.programWeek > 0 ? `Week ${p.programWeek}` : "Not started"}
          </p>
          <div className="mt-1">
            <StatusPill tone={chip.tone}>{chip.label}</StatusPill>
          </div>
        </div>
      </div>
      <div className="text-right shrink-0">
        {!clinical ? (
          <>
            <div className="text-[14px] font-semibold text-text-primary capitalize">{p.membership}</div>
            <div className="text-[12px] text-text-tertiary">Membership</div>
          </>
        ) : lastWeight ? (
          <>
            <div className="text-[16px] font-bold text-text-primary tracking-tight">{fmtVal(lastWeight.value, "lb")}</div>
            <div className="text-[12px] text-text-tertiary">{fmtDay(lastWeight.measuredAt)}</div>
          </>
        ) : (
          <>
            <div className="text-[13px] font-medium text-text-tertiary">No reading</div>
            {p.nextVisit && <div className="text-[12px] text-text-tertiary">Intake {fmtDay(p.nextVisit.at)}</div>}
          </>
        )}
      </div>
    </Link>
  );
}
