"use client";

import Link from "next/link";
import { PRACTICE_NAME } from "@/lib/data";
import { getStaff } from "@/lib/selectors";
import type { Patient } from "@/lib/types";
import { Avatar, Card, Icon, Segmented, StatusPill } from "@/components/ui";
import { patientStatusLabel, staffLabel } from "./status";

export const recordTabs = (id: string) => [
  { label: "Overview", href: `/patients/${id}` },
  { label: "Body", href: `/patients/${id}/body` },
  { label: "BP", href: `/patients/${id}/bp` },
  { label: "Labs", href: `/patients/${id}/labs` },
  { label: "Meds", href: `/patients/${id}/meds` },
  { label: "Check-ins", href: `/patients/${id}/check-ins` },
];

const dob = (iso: string) => {
  const [y, m, d] = iso.split("-");
  return `${m}/${d}/${y}`;
};

/** Sticky top bar for the patient record (back goes to the patient list). */
export function RecordTopBar({ title = "Patient record" }: { title?: string }) {
  return (
    <header className="sticky top-0 z-20 -mx-5 px-5 lg:-mx-8 lg:px-8 py-3 bg-surface/95 backdrop-blur border-b border-border flex items-center gap-3">
      <Link href="/patients" aria-label="Back to patients" className="w-11 h-11 -ml-2 rounded-full grid place-items-center hover:bg-surface-alt">
        <Icon name="arrow_back" />
      </Link>
      <div className="min-w-0">
        <span className="text-caption-sm text-text-tertiary block leading-none">{PRACTICE_NAME}</span>
        <h1 className="text-title-md font-semibold text-text-primary leading-tight">{title}</h1>
      </div>
    </header>
  );
}

/** Patient identity card + record tabs. */
export function RecordHeader({ p, active }: { p: Patient; active: string }) {
  const status = patientStatusLabel[p.status];
  const md = getStaff(p.clinicianId);
  const ma = getStaff(p.maId);
  return (
    <>
      <Card className="p-5 rounded-[20px]">
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            <Avatar src={p.avatar} alt={p.name} size={56} ring />
            {p.status === "active" && <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-success border-2 border-surface rounded-full" title="Active monitoring" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-serif text-[22px] leading-7 font-bold tracking-tight truncate">{p.name}</h2>
              <StatusPill tone={status.tone}>{status.label}</StatusPill>
            </div>
            <p className="text-caption-sm text-text-secondary mt-1">
              {p.mrn} • DOB {dob(p.dob)} • {p.programWeek > 0 ? `Week ${p.programWeek}` : "Not started"}
            </p>
            {p.consent === "pending" && <p className="text-[12px] text-[#92400E] mt-1">Consent pending</p>}
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-border/60 flex items-center gap-2 text-text-secondary text-caption-sm">
          <Icon name="medical_services" size={18} className="text-accent-fill shrink-0" />
          <span className="truncate">
            Care team: <strong className="font-medium text-text-primary">{staffLabel(md)}</strong> • {staffLabel(ma)}
          </span>
        </div>
      </Card>
      <Segmented items={recordTabs(p.id)} active={active} />
    </>
  );
}
