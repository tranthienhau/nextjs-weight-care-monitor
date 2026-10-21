"use client";

import { PortalHeader, usePortalPatient } from "@/components/portal/common";
import { ActiveHome } from "@/components/portal/home-active";
import { FirstRunHome } from "@/components/portal/home-first-run";
import { seriesFor } from "@/lib/selectors";
import { useApp } from "@/lib/store";

export default function PortalHome() {
  const patient = usePortalPatient();
  const ms = useApp((s) => s.measurements);
  if (!patient) return null;
  const hasWeights = seriesFor(ms, patient.id, "weight").some((m) => m.value != null);
  return (
    <>
      <PortalHeader title={hasWeights ? `Hi ${patient.firstName}` : `Welcome, ${patient.firstName}`} avatar={patient.avatar} />
      {hasWeights ? <ActiveHome patient={patient} /> : <FirstRunHome patient={patient} />}
    </>
  );
}
