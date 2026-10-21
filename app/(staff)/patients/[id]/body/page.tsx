"use client";

import clsx from "clsx";
import { useState } from "react";
import { DEMO_TODAY, images, localIso } from "@/lib/data";
import { fmtDate, signed } from "@/lib/format";
import { useApp } from "@/lib/store";
import { latest, seriesFor, weightChange, whoName } from "@/lib/selectors";
import type { Measurement, Patient } from "@/lib/types";
import { Button, EmptyState } from "@/components/ui";
import { BodyEntries } from "@/components/clinical/BodyEntries";
import { BodyFatCard, WeightTrendCard } from "@/components/clinical/BodyCharts";
import { ExportButton } from "@/components/clinical/ExportButton";
import { ClinicalPage } from "@/components/clinical/PatientTabs";

const RANGES = [
  { key: "3M", months: 3 },
  { key: "6M", months: 6 },
  { key: "1Y", months: 12 },
  { key: "All", months: 0 },
] as const;
type RangeKey = (typeof RANGES)[number]["key"];

const cutoff = (months: number) => {
  if (!months) return "";
  const d = new Date(DEMO_TODAY);
  d.setMonth(d.getMonth() - months);
  return localIso(d);
};

function RangeChips({ value, onChange }: { value: RangeKey; onChange: (k: RangeKey) => void }) {
  return (
    <div role="group" aria-label="Date range" className="flex items-center gap-1 p-1 bg-surface rounded-full shadow-ambient border border-border/60">
      {RANGES.map((r) => (
        <button
          key={r.key}
          type="button"
          aria-pressed={value === r.key}
          onClick={() => onChange(r.key)}
          className={clsx(
            "min-w-11 h-9 px-3 rounded-full text-caption-sm transition-colors",
            value === r.key ? "bg-accent-tint text-accent-fill font-semibold" : "text-text-secondary hover:text-accent-fill",
          )}
        >
          {r.key}
        </button>
      ))}
    </div>
  );
}

function BodyTab({ patient }: { patient: Patient }) {
  const all = useApp((s) => s.measurements);
  const staff = useApp((s) => s.staff);
  const [range, setRange] = useState<RangeKey>("6M");
  const from = cutoff(RANGES.find((r) => r.key === range)!.months);
  const inRange = (m: Measurement) => m.measuredAt >= from;

  const weights = seriesFor(all, patient.id, "weight").filter(inRange);
  const bodyFat = seriesFor(all, patient.id, "bodyFat").filter(inRange);
  const change = weightChange(all, patient);

  if (!seriesFor(all, patient.id, "weight").length)
    return (
      <EmptyState
        image={images.emptyDesk}
        title="No measurements yet"
        body={`${patient.firstName} has no body measurements on file. ${patient.nextVisit ? `First measurements are planned for the ${patient.nextVisit.kind.toLowerCase()} on ${fmtDate(patient.nextVisit.at)}.` : ""}`}
        action={<Button href={`/patients/${patient.id}/measure`} icon="add">Enter measurements</Button>}
      />
    );

  const csvRows = () =>
    all
      .filter((m) => m.patientId === patient.id)
      .sort((a, b) => a.measuredAt.localeCompare(b.measuredAt))
      .map((m) => ({
        date: m.measuredAt,
        type: m.type,
        value: m.value ?? "Not measured",
        unit: m.unit,
        source: m.source,
        entered_by: whoName(m.enteredBy, staff),
        estimate: m.isEstimate ? "yes" : "no",
        review_status: m.reviewStatus,
      }));

  return (
    <>
      <section className="flex flex-wrap items-center justify-between gap-2">
        <RangeChips value={range} onChange={setRange} />
        <div className="text-right">
          <div className="text-[11px] text-text-tertiary">Baseline: {patient.startWeightLb ? `${patient.startWeightLb.toFixed(1)} lb` : "Not measured"}</div>
          {change != null && (
            <div className="text-[12px] text-text-primary font-semibold">
              {signed(change)} lb ({signed((change / patient.startWeightLb) * 100)}%)
            </div>
          )}
        </div>
      </section>

      <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-6">
        <WeightTrendCard series={weights} />
        <BodyFatCard series={bodyFat} muscle={latest(all, patient.id, "muscleMass")} fatFree={latest(all, patient.id, "fatFreeMass")} />
      </div>

      <BodyEntries
        weights={weights}
        bodyFat={bodyFat}
        exportSlot={<ExportButton dataset={`Measurements - ${patient.name}`} fileName={`measurements-${patient.id}.csv`} rows={csvRows} />}
      />
    </>
  );
}

export default function Page() {
  return (
    <ClinicalPage
      title="Body"
      active="Body"
      right={(p) => <Button variant="ghost" href={`/patients/${p.id}/measure`} icon="add" className="px-3 hidden sm:inline-flex">Enter measurements</Button>}
    >
      {(p) => <BodyTab patient={p} />}
    </ClinicalPage>
  );
}
