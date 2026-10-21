"use client";

import { useState } from "react";
import { C, TrendChart } from "@/components/charts";
import { PortalHeader, sourceLabel, usePortalPatient } from "@/components/portal/common";
import { Button, Card, Chip, EmptyState, EstimateTag, Icon, SafetyBanner, SourceTag } from "@/components/ui";
import { DEMO_TODAY, images } from "@/lib/data";
import { fmtDate, fmtDay, fmtVal, signed } from "@/lib/format";
import { latest, seriesFor, weightChange } from "@/lib/selectors";
import { useApp } from "@/lib/store";

const RANGES = [
  { label: "All", days: Infinity },
  { label: "Last 90 days", days: 90 },
  { label: "Last 30 days", days: 30 },
];

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface-alt p-3">
      <div className="text-[12px] text-text-tertiary">{label}</div>
      <div className="text-[18px] font-semibold text-text-primary mt-0.5">{value}</div>
    </div>
  );
}

export default function PortalTrends() {
  const patient = usePortalPatient();
  const ms = useApp((s) => s.measurements);
  const showBodyFat = useApp((s) => s.settings.patientVisible.bodyFat);
  const [range, setRange] = useState(RANGES[0]);
  if (!patient) return null;

  const all = seriesFor(ms, patient.id, "weight");
  const cutoff = new Date(DEMO_TODAY).getTime() - range.days * 864e5;
  const weights = all.filter((m) => new Date(m.measuredAt).getTime() >= cutoff);
  const bodyFat = seriesFor(ms, patient.id, "bodyFat");
  const change = weightChange(ms, patient);
  const lastW = latest(ms, patient.id, "weight");
  const lastBf = latest(ms, patient.id, "bodyFat");

  if (!all.some((m) => m.value != null))
    return (
      <>
        <PortalHeader title="Your trends" avatar={patient.avatar} />
        <div className="space-y-4 lg:max-w-xl">
          <EmptyState
            image={images.emptyReception}
            title="No measurements yet"
            body={`Your first measurements will appear after your intake visit${patient.nextVisit ? ` on ${fmtDay(patient.nextVisit.at)}` : ""}.`}
            action={<Button href="/portal">Back to home</Button>}
          />
          <SafetyBanner />
        </div>
      </>
    );

  const bfAt = (at: string) => bodyFat.find((b) => b.measuredAt === at);

  return (
    <>
      <PortalHeader title="Your trends" avatar={patient.avatar} />
      <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-5 lg:gap-6 lg:items-start">
        <div className="space-y-4 lg:col-span-3">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-title-md text-text-primary">Weight</h2>
              <span className="text-caption-sm text-text-tertiary">lb</span>
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar mb-3">
              {RANGES.map((r) => (
                <Chip key={r.label} selected={range.label === r.label} onClick={() => setRange(r)}>
                  {r.label}
                </Chip>
              ))}
            </div>
            {weights.length ? (
              <TrendChart data={weights.map((m) => ({ at: m.measuredAt, value: m.value }))} unit="lb" />
            ) : (
              <p className="py-10 text-center text-caption-sm text-text-tertiary">No measurements in this range.</p>
            )}
            <div className="grid grid-cols-3 gap-2 mt-4">
              <Stat label="Start" value={fmtVal(patient.startWeightLb, "lb")} />
              <Stat label="Latest" value={fmtVal(lastW?.value, "lb")} />
              <Stat label="Change" value={change != null ? `${signed(change)} lb` : "No reading"} />
            </div>
          </Card>

          {showBodyFat && lastBf && (
            <Card className="p-5">
              <div className="flex items-center justify-between gap-2 mb-1">
                <h2 className="text-title-md text-text-primary">Body fat</h2>
                <EstimateTag />
              </div>
              <p className="text-caption-sm text-text-secondary mb-3">
                Latest {fmtVal(lastBf.value, "%")} on {fmtDay(lastBf.measuredAt)}. Body composition values are estimates from the body scan, not a diagnosis.
              </p>
              <TrendChart data={bodyFat.map((m) => ({ at: m.measuredAt, value: m.value }))} unit="%" color={C.support} height={160} />
            </Card>
          )}
          <SafetyBanner className="hidden lg:flex" />
        </div>

        <Card className="p-5 lg:col-span-2">
          <h2 className="text-title-md text-text-primary mb-1">Measurements</h2>
          <p className="text-caption-sm text-text-tertiary mb-2">Taken at your clinic visits</p>
          <ul className="divide-y divide-border">
            {[...all].reverse().map((m) => {
              const bf = showBodyFat ? bfAt(m.measuredAt) : undefined;
              return (
                <li key={m.id} className="py-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-label-md text-text-primary font-semibold">{fmtDate(m.measuredAt)}</div>
                    <SourceTag patient={m.patientReported} className="mt-1">
                      {sourceLabel(m)}
                    </SourceTag>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[16px] font-semibold text-text-primary">{fmtVal(m.value, "lb")}</div>
                    {bf && (
                      <div className="mt-1 flex items-center justify-end gap-1.5 text-[12px] text-text-secondary">
                        {fmtVal(bf.value, "%")} body fat <EstimateTag />
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
          <p className="mt-3 flex items-center gap-1.5 text-[12px] text-text-tertiary">
            <Icon name="chat_bubble" size={14} /> Questions about a value? Message your care team.
          </p>
        </Card>
        <SafetyBanner className="lg:hidden" />
      </div>
    </>
  );
}
