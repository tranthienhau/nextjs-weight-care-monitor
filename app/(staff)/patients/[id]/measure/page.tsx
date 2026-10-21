"use client";

import { useParams } from "next/navigation";
import { getPatient } from "@/lib/selectors";
import { BackHeader } from "@/components/ui";
import { ClinicalGate, NotFoundCard } from "@/components/ma/common";
import { MeasureForm } from "@/components/ma/measure-form";

export default function NewMeasurementPage() {
  const { id } = useParams<{ id: string }>();
  const p = getPatient(id);
  return (
    <div>
      <BackHeader close title="New measurement" subtitle={p ? `${p.name} • ${p.mrn}` : undefined} />
      <ClinicalGate>{p ? <MeasureForm p={p} /> : <NotFoundCard />}</ClinicalGate>
    </div>
  );
}
