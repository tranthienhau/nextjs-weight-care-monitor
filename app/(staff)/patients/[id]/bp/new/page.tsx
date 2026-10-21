"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { nowIso } from "@/lib/store";
import { getPatient } from "@/lib/selectors";
import { fmtDayTime } from "@/lib/format";
import { BackHeader } from "@/components/ui";
import { ClinicalGate, NotFoundCard } from "@/components/ma/common";
import { BpForm } from "@/components/ma/bp-form";

export default function NewBpPage() {
  const { id } = useParams<{ id: string }>();
  const p = getPatient(id);
  // Demo clock: the reading is timestamped when the form opens.
  const [measuredAt] = useState(() => nowIso());
  return (
    <div>
      <BackHeader close title="Blood pressure" subtitle={p ? `${p.name} • ${fmtDayTime(measuredAt)}` : undefined} />
      <ClinicalGate>{p ? <BpForm p={p} measuredAt={measuredAt} /> : <NotFoundCard />}</ClinicalGate>
    </div>
  );
}
