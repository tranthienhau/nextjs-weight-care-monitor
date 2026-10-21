"use client";

import { useState } from "react";
import { images } from "@/lib/data";
import { useApp } from "@/lib/store";
import { labsFor } from "@/lib/selectors";
import type { Patient } from "@/lib/types";
import { Button, EmptyState } from "@/components/ui";
import { useCurrentUser } from "@/components/shell";
import { AddLabForm } from "@/components/clinical/AddLabForm";
import { HbA1cCard, LabGroupCard, groupLabs } from "@/components/clinical/LabParts";
import { ClinicalPage, can } from "@/components/clinical/PatientTabs";

function LabsTab({ patient }: { patient: Patient }) {
  const all = useApp((s) => s.labResults);
  const { role } = useCurrentUser();
  const [adding, setAdding] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);
  const labs = labsFor(all, patient.id);
  const a1c = labs.filter((l) => l.test === "HbA1c");
  const groups = groupLabs(labs);
  const canAdd = can(role, "enterMeasurements");

  const addArea = canAdd && (
    <div className="space-y-2">
      {saved && (
        <p role="status" className="text-[13px] text-success bg-success-tint rounded-xl px-3 py-2">
          {saved} saved and marked ready for MD review.
        </p>
      )}
      {adding ? (
        <AddLabForm
          patientId={patient.id}
          onClose={() => setAdding(false)}
          onSaved={(test) => {
            setAdding(false);
            setSaved(test);
          }}
        />
      ) : (
        <Button variant="secondary" icon="add" full onClick={() => { setAdding(true); setSaved(null); }} className="h-12">
          Add lab result
        </Button>
      )}
    </div>
  );

  if (!labs.length)
    return (
      <>
        <EmptyState
          image={images.emptyDesk}
          title="No lab results yet"
          body={`${patient.firstName} has no lab results on file. Results are entered by staff from the lab report.`}
        />
        {addArea}
      </>
    );

  return (
    <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-6 lg:items-start">
      <div className="space-y-4 lg:sticky lg:top-8">
        {a1c.length > 0 && <HbA1cCard results={a1c} />}
        {addArea}
      </div>
      <div className="space-y-5">
        {groups.map((g) => (
          <LabGroupCard key={g.key} g={g} />
        ))}
      </div>
    </div>
  );
}

export default function Page() {
  return <ClinicalPage title="Labs" active="Labs">{(p) => <LabsTab patient={p} />}</ClinicalPage>;
}
