"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { patients } from "@/lib/data";
import { latest } from "@/lib/selectors";
import type { Patient } from "@/lib/types";
import { Card, Chip, Icon, PageHeader } from "@/components/ui";
import { roleChip, useCurrentUser } from "@/components/shell";
import { PatientRow } from "@/components/ma/patient-row";
import { addDays, TODAY, useReviewItems } from "@/components/ma/status";

const FILTERS = ["Active", "Inactive", "Discharged", "Due check-in", "New"] as const;
type Filter = (typeof FILTERS)[number];

const dueBy = addDays(TODAY, 7);

const matches = (p: Patient, f: Filter) => {
  switch (f) {
    case "Active":
      return p.status === "active";
    case "Inactive":
      return p.status === "inactive";
    case "Discharged":
      return p.status === "discharged";
    case "New":
      return p.status === "new";
    case "Due check-in":
      return p.status !== "discharged" && !!p.checkInDue && p.checkInDue <= dueBy;
  }
};

export default function PatientsPage() {
  return (
    <Suspense>
      <PatientsList />
    </Suspense>
  );
}

function PatientsList() {
  const params = useSearchParams();
  const { staff, role } = useCurrentUser();
  const items = useReviewItems();
  const [filter, setFilter] = useState<Filter>(params.get("filter") === "due" ? "Due check-in" : "Active");
  const [q, setQ] = useState("");
  const [showNote, setShowNote] = useState(false);
  const clinical = role !== "admin";

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return patients
      .filter((p) => matches(p, filter))
      .filter((p) => !term || p.name.toLowerCase().includes(term) || p.mrn.toLowerCase().includes(term) || p.mrn.replace(/\D/g, "").includes(term.replace(/\D/g, "") || "x"))
      .map((p) => ({ p, w: latest(items.measurements, p.id, "weight") }))
      .sort((a, b) => (b.w?.measuredAt ?? "").localeCompare(a.w?.measuredAt ?? ""));
  }, [filter, q, items.measurements]);

  const newPatient = (
    <button
      type="button"
      onClick={() => setShowNote((v) => !v)}
      className="fixed bottom-24 right-5 z-40 lg:static h-11 pl-3.5 pr-4 rounded-full bg-surface border border-accent-fill text-accent-fill hover:bg-accent-tint font-semibold flex items-center gap-1.5 shadow-float lg:shadow-none active:scale-95 transition-all shrink-0"
    >
      <Icon name="add" size={20} />
      New patient
    </button>
  );

  return (
    <div className="pb-6">
      <PageHeader title="Patients" avatar={staff?.avatar} role={roleChip(role)} right={newPatient} />

      {showNote && (
        <Card className="p-4 mb-3 flex items-start gap-3" as="div">
          <Icon name="info" className="text-accent-fill" size={20} />
          <p className="text-caption-sm text-text-secondary flex-1">Registration form is part of Phase 1. In this demo, new patients are added by the practice admin.</p>
          <button type="button" aria-label="Dismiss" onClick={() => setShowNote(false)} className="w-11 h-11 -m-3 grid place-items-center text-text-tertiary">
            <Icon name="close" size={18} />
          </button>
        </Card>
      )}

      <div className="lg:flex lg:items-end lg:gap-6">
        <div className="lg:flex-1 lg:max-w-md">
          <label className="relative flex items-center">
            <span className="sr-only">Search patients</span>
            <Icon name="search" size={20} className="absolute left-4 text-text-tertiary pointer-events-none" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name or MRN"
              className="w-full h-12 pl-11 pr-4 bg-surface rounded-2xl border border-border text-text-primary placeholder:text-text-tertiary text-label-md focus:outline-none focus:ring-2 focus:ring-accent-fill focus:border-transparent shadow-ambient"
            />
          </label>
          <div className="mt-2.5 px-1 flex items-center justify-between">
            <p className="text-caption-sm text-text-secondary font-medium">
              {rows.length} shown • {patients.length} enrolled
            </p>
            <span className="text-[12px] text-text-tertiary flex items-center gap-1">
              <Icon name="swap_vert" size={14} />
              Sort: Recent activity
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-3 -mx-5 px-5 lg:mx-0 lg:px-0 lg:pb-7" role="group" aria-label="Filter patients">
          {FILTERS.map((f) => (
            <Chip key={f} selected={f === filter} onClick={() => setFilter(f)} className="shrink-0 px-4">
              {f}
            </Chip>
          ))}
        </div>
      </div>

      {filter === "Due check-in" && <p className="text-[12px] text-text-tertiary mb-2 px-1">Monthly check-in overdue or due within 7 days.</p>}

      {rows.length === 0 ? (
        <Card className="p-6 text-center">
          <Icon name="group_off" size={32} className="text-text-tertiary mb-2" />
          <p className="text-body-md text-text-secondary">{q ? `No patients match "${q}".` : `No ${filter.toLowerCase()} patients.`}</p>
        </Card>
      ) : (
        <div className="space-y-3 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-3">
          {rows.map(({ p, w }) => (
            <PatientRow key={p.id} p={p} items={items} lastWeight={w} clinical={clinical} />
          ))}
        </div>
      )}
    </div>
  );
}
