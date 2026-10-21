"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import type { ReactNode } from "react";
import { permissionMatrix } from "@/lib/data";
import { getPatient } from "@/lib/selectors";
import type { Patient, Role } from "@/lib/types";
import { Card, Icon, Segmented } from "@/components/ui";
import { useCurrentUser } from "@/components/shell";

export type ClinicalTab = "Overview" | "Body" | "BP" | "Labs" | "Meds" | "Check-ins";

export function PatientTabs({ id, active }: { id: string; active: ClinicalTab }) {
  const base = `/patients/${id}`;
  const items = [
    { label: "Overview", href: base },
    { label: "Body", href: `${base}/body` },
    { label: "BP", href: `${base}/bp` },
    { label: "Labs", href: `${base}/labs` },
    { label: "Meds", href: `${base}/meds` },
    { label: "Check-ins", href: `${base}/check-ins` },
  ];
  return <Segmented items={items} active={active} />;
}

/** Compact patient header row: back to the record, tab title, patient context. */
export function PatientHeader({ patient, title, right }: { patient: Patient; title: string; right?: ReactNode }) {
  const week = patient.programWeek > 0 ? `Week ${patient.programWeek}` : "New patient";
  return (
    <header className="flex items-center gap-2 pt-2 pb-3">
      <Link
        href={`/patients/${patient.id}`}
        aria-label={`Back to ${patient.name} record`}
        className="w-11 h-11 -ml-2 rounded-full grid place-items-center text-text-primary hover:bg-surface-alt shrink-0"
      >
        <Icon name="chevron_left" />
      </Link>
      <div className="min-w-0 flex-1">
        <h1 className="font-serif text-[24px] leading-7 lg:text-[30px] lg:leading-9 font-bold tracking-[-0.01em] text-text-primary">{title}</h1>
        <p className="text-caption-sm text-text-secondary truncate">
          {patient.name} - {patient.mrn} - {week}
        </p>
      </div>
      {right}
    </header>
  );
}

/** Permission check against the practice permission matrix. */
export function can(role: Role | null, key: string) {
  if (!role || role === "patient") return false;
  const row = permissionMatrix.find((r) => r.key === key);
  return !!row?.[role];
}

/**
 * Shared frame for every clinical tab: resolves the patient from the route,
 * enforces clinical-view permission, renders header + tabs, then the tab body.
 */
export function ClinicalPage({
  title,
  active,
  right,
  children,
}: {
  title: ClinicalTab | string;
  active: ClinicalTab;
  right?: (p: Patient) => ReactNode;
  children: (p: Patient) => ReactNode;
}) {
  const { id } = useParams<{ id: string }>();
  const { role } = useCurrentUser();
  const patient = getPatient(id);

  if (!patient)
    return (
      <Card className="p-6 mt-6 text-center">
        <p className="text-title-md font-semibold mb-2">Patient not found</p>
        <Link href="/patients" className="text-accent-fill font-semibold">
          Back to patients
        </Link>
      </Card>
    );

  if (!can(role, "viewClinical"))
    return (
      <Card className="p-6 mt-6 text-center">
        <Icon name="lock" size={36} className="text-accent-fill mb-2" />
        <p className="text-title-md font-semibold mb-1">Clinical records are limited by role</p>
        <p className="text-text-secondary">Your role can see membership and admin records only. No clinical data was shown.</p>
      </Card>
    );

  return (
    <div>
      <PatientHeader patient={patient} title={title} right={right?.(patient)} />
      <PatientTabs id={patient.id} active={active} />
      <div className="pt-4 space-y-4">{children(patient)}</div>
    </div>
  );
}

/** Small card section with a heading row. */
export function Panel({ title, right, children, className }: { title: ReactNode; right?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <Card className={`p-4 lg:p-5 ${className ?? ""}`}>
      <div className="flex items-center justify-between gap-2 mb-3">
        <h2 className="text-[16px] font-semibold text-text-primary">{title}</h2>
        {right}
      </div>
      {children}
    </Card>
  );
}
