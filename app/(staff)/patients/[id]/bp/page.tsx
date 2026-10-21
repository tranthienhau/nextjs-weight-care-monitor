"use client";

import { images } from "@/lib/data";
import { useApp } from "@/lib/store";
import { bpFor, whoName } from "@/lib/selectors";
import type { Patient } from "@/lib/types";
import { BpChart, C } from "@/components/charts";
import { Button, Card, EmptyState, SafetyBanner } from "@/components/ui";
import { LatestReadingCard, ReadingsList } from "@/components/clinical/BpParts";
import { ExportButton } from "@/components/clinical/ExportButton";
import { ClinicalPage } from "@/components/clinical/PatientTabs";

const SAFETY = "Not continuously monitored. Not an emergency channel - call 911.";

function Legend({ threshold }: { threshold: number }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5 text-[12px] text-text-secondary mb-3">
      <span className="inline-flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: C.fill }} />
        Systolic
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-support" />
        Diastolic
      </span>
      <span className="inline-flex items-center gap-1.5 text-warning font-medium">
        <span className="w-3.5 border-t-2 border-dashed border-warning inline-block" />
        Practice review rule ({threshold})
      </span>
    </div>
  );
}

function BpTab({ patient }: { patient: Patient }) {
  const all = useApp((s) => s.bpReadings);
  const staff = useApp((s) => s.staff);
  const rule = useApp((s) => s.settings.bpRule);
  const readings = bpFor(all, patient.id);
  const newest = [...readings].reverse();
  const last = newest[0];

  if (!last)
    return (
      <>
        <EmptyState
          image={images.emptyReception}
          title="No readings yet"
          body={`${patient.firstName} has no blood pressure readings on file. "No reading" is shown until the first one is entered.`}
          action={<Button href={`/patients/${patient.id}/bp/new`} icon="add">New reading</Button>}
        />
        <SafetyBanner>{SAFETY}</SafetyBanner>
      </>
    );

  const csvRows = () =>
    readings.map((b) => ({
      date: b.measuredAt,
      systolic: b.systolic,
      diastolic: b.diastolic,
      pulse: b.pulse ?? "Not measured",
      method: b.method,
      source: b.source,
      entered_by: whoName(b.enteredBy, staff),
      patient_reported: b.patientReported ? "yes" : "no",
      review_status: b.reviewStatus,
    }));

  return (
    <>
      <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-6">
        <Card className="p-4 lg:p-5 lg:col-span-2">
          <h2 className="text-title-md font-semibold">Blood pressure trend</h2>
          <p className="text-caption-sm text-text-secondary mb-3">Clinic and patient-reported readings</p>
          <Legend threshold={rule.systolicGte} />
          <div className="bg-surface-alt/40 rounded-xl p-1">
            <BpChart data={readings.map((b) => ({ at: b.measuredAt, sys: b.systolic, dia: b.diastolic }))} threshold={rule.systolicGte} />
          </div>
          <p className="mt-2 text-[11px] text-text-tertiary">
            The dashed line is the practice review rule set by the physician. It marks readings for review and is not a diagnosis.
          </p>
        </Card>
        <LatestReadingCard b={last} patientId={patient.id} />
      </div>

      <section className="space-y-2.5">
        <div className="flex items-start justify-between gap-2 px-1">
          <div className="flex items-baseline gap-2 pt-1.5">
            <h2 className="text-title-md font-semibold">Readings history</h2>
            <span className="text-caption-sm text-text-tertiary">({readings.length})</span>
          </div>
          <ExportButton dataset={`Blood pressure - ${patient.name}`} fileName={`bp-${patient.id}.csv`} rows={csvRows} />
        </div>
        <ReadingsList readings={newest} />
      </section>

      <SafetyBanner>{SAFETY}</SafetyBanner>
    </>
  );
}

export default function Page() {
  return (
    <ClinicalPage
      title="BP history"
      active="BP"
      right={(p) => (
        <Button href={`/patients/${p.id}/bp/new`} icon="add" className="h-11 px-4 text-[14px] shrink-0">
          New reading
        </Button>
      )}
    >
      {(p) => <BpTab patient={p} />}
    </ClinicalPage>
  );
}
