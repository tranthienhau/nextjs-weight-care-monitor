"use client";

import { images } from "@/lib/data";
import { fmtDate } from "@/lib/format";
import { useApp } from "@/lib/store";
import type { Patient } from "@/lib/types";
import { EmptyState } from "@/components/ui";
import { CheckInCard } from "@/components/clinical/CheckInCard";
import { ClinicalPage } from "@/components/clinical/PatientTabs";

function CheckInsTab({ patient }: { patient: Patient }) {
  const all = useApp((s) => s.checkIns);
  const list = all.filter((c) => c.patientId === patient.id).sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));

  if (!list.length)
    return (
      <EmptyState
        image={images.emptyReception}
        title="No check-ins yet"
        body={`${patient.firstName} has not submitted a monthly check-in.${patient.checkInDue ? ` The next one is due ${fmtDate(patient.checkInDue)}.` : " Check-ins start after the intake visit."}`}
      />
    );

  return (
    <>
      <p className="text-caption-sm text-text-secondary">
        Monthly check-ins submitted by the patient. Answers that match a practice rule create a staff task.
        {patient.checkInDue && ` Next due ${fmtDate(patient.checkInDue)}.`}
      </p>
      <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-6 lg:items-start">
        {list.map((ci, i) => (
          <CheckInCard key={ci.id} ci={ci} defaultOpen={i === 0} />
        ))}
      </div>
    </>
  );
}

export default function Page() {
  return <ClinicalPage title="Check-ins" active="Check-ins">{(p) => <CheckInsTab patient={p} />}</ClinicalPage>;
}
