"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { images } from "@/lib/data";
import { useApp } from "@/lib/store";
import { getPatient, getStaff } from "@/lib/selectors";
import { fmtDay } from "@/lib/format";
import type { Patient } from "@/lib/types";
import { Button, EmptyState, Icon } from "@/components/ui";
import { useCurrentUser } from "@/components/shell";
import { ClinicalGate, NotFoundCard } from "@/components/ma/common";
import { RecordHeader, RecordTopBar } from "@/components/ma/record-header";
import { LastReview, OverviewGrid, WeightHero } from "@/components/ma/overview-cards";

export default function PatientRecordPage() {
  const { id } = useParams<{ id: string }>();
  const p = getPatient(id);
  return (
    <div className="pb-6">
      <RecordTopBar />
      <ClinicalGate>{p ? <Record p={p} /> : <NotFoundCard />}</ClinicalGate>
    </div>
  );
}

function Record({ p }: { p: Patient }) {
  const ms = useApp((s) => s.measurements);
  const bps = useApp((s) => s.bpReadings);
  const hasData = ms.some((m) => m.patientId === p.id) || bps.some((b) => b.patientId === p.id);

  return (
    <div className="pt-4 space-y-4">
      <RecordHeader p={p} active="Overview" />
      {hasData ? (
        <>
          <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-[1fr_1.2fr] lg:gap-6">
            <WeightHero p={p} />
            <OverviewGrid p={p} />
          </div>
          <LastReview p={p} />
          <RecordActions p={p} />
        </>
      ) : (
        <EmptyRecord p={p} />
      )}
    </div>
  );
}

function EmptyRecord({ p }: { p: Patient }) {
  const visit = p.nextVisit;
  return (
    <div className="lg:max-w-xl">
      <EmptyState
        image={images.emptyReception}
        title="No measurements yet"
        body={visit ? `${visit.kind} ${fmtDay(visit.at)} - ${visit.note.toLowerCase()} will appear here once entered.` : "Measurements will appear here once entered."}
        action={
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button href={`/patients/${p.id}/measure`} icon="monitor_weight">
              New measurement
            </Button>
            <Button href={`/patients/${p.id}/bp/new`} variant="secondary" icon="favorite">
              Blood pressure
            </Button>
          </div>
        }
      />
    </div>
  );
}

function RecordActions({ p }: { p: Patient }) {
  const { userId } = useCurrentUser();
  const ms = useApp((s) => s.measurements);
  const bps = useApp((s) => s.bpReadings);
  const markReady = useApp((s) => s.markReadyForReview);
  const [sent, setSent] = useState<number | null>(null);

  const open = ms.filter((m) => m.patientId === p.id && m.reviewStatus === "unreviewed").length + bps.filter((b) => b.patientId === p.id && b.reviewStatus === "unreviewed").length;
  const md = getStaff(p.clinicianId);

  const onMark = () => {
    if (!userId || open === 0) return;
    markReady(p.id, userId);
    setSent(open);
  };

  return (
    <section className="pt-2 space-y-3">
      {sent != null && (
        <div role="status" className="flex items-start gap-3 rounded-2xl bg-success-tint p-4 text-[13px] text-[#15803D]">
          <Icon name="check_circle" size={20} />
          <p>
            {sent} {sent === 1 ? "item" : "items"} marked ready for MD review. {md?.shortName ?? "The physician"} will see {sent === 1 ? "it" : "them"} in the review queue.
          </p>
        </div>
      )}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="grid grid-cols-2 gap-3 lg:flex">
          <Button href={`/patients/${p.id}/measure`} variant="secondary" icon="monitor_weight" className="px-3">
            New measurement
          </Button>
          <Button href={`/patients/${p.id}/bp/new`} variant="secondary" icon="favorite" className="px-3">
            Blood pressure
          </Button>
        </div>
        <Button onClick={onMark} disabled={open === 0} icon="check_circle" full className="lg:w-auto lg:ml-auto">
          Mark ready for MD review{open > 0 ? ` (${open})` : ""}
        </Button>
      </div>
      {open === 0 && sent == null && <p className="text-[12px] text-text-tertiary text-center lg:text-right">No unreviewed items. Everything entered is with the physician or already reviewed.</p>}
    </section>
  );
}
