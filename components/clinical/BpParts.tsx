"use client";

import clsx from "clsx";
import { fmtDay, fmtDayTime } from "@/lib/format";
import { whoName } from "@/lib/selectors";
import { useApp } from "@/lib/store";
import type { BpReading } from "@/lib/types";
import { Button, Card, Icon, ReviewBadge, SourceTag } from "@/components/ui";

export const bpSource = (b: BpReading, staffName: string) =>
  b.patientReported ? `${b.method} - patient-reported` : `${b.method} - ${staffName}`;

function useReviewProps(b: BpReading) {
  const staff = useApp((s) => s.staff);
  return { status: b.reviewStatus, by: whoName(b.reviewedBy, staff), on: b.reviewedAt ? fmtDay(b.reviewedAt) : undefined };
}

export function LatestReadingCard({ b, patientId }: { b: BpReading; patientId: string }) {
  const staff = useApp((s) => s.staff);
  const rule = useApp((s) => s.settings.bpRule);
  const review = useReviewProps(b);
  return (
    <Card className={clsx("p-4 lg:p-5", b.flagged && "border-l-4 border-l-warning")}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-label-md font-medium">Latest reading</span>
        <ReviewBadge {...review} />
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-[34px] leading-none font-bold tracking-tight">
          {b.systolic}/{b.diastolic}
        </span>
        <span className="text-body-md text-text-secondary">mmHg</span>
      </div>
      <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-caption-sm text-text-secondary">
        <span className="inline-flex items-center gap-1 text-text-primary font-medium">
          <Icon name="favorite" filled size={16} className="text-accent-fill" />
          {b.pulse ? `Pulse ${b.pulse} bpm` : "Pulse not measured"}
        </span>
        <span>{fmtDayTime(b.measuredAt)}</span>
        <span className="text-text-tertiary">
          {b.arm} arm, {b.position}
        </span>
      </div>
      {b.flagged && (
        <p className="mt-2 text-[12px] text-[#92400E] bg-warning-tint rounded-lg px-2.5 py-1.5">
          At or above the practice review rule ({rule.systolicGte}/{rule.diastolicGte}). A review flag, not a diagnosis.
        </p>
      )}
      <div className="mt-3 pt-2.5 border-t border-border">
        <SourceTag patient={b.patientReported}>{bpSource(b, whoName(b.enteredBy, staff))}</SourceTag>
      </div>
      <Button variant="secondary" href={`/patients/${patientId}/bp/new`} icon="refresh" full className="mt-3.5 h-11 text-[14px]">
        Log repeat reading
      </Button>
    </Card>
  );
}

function ReadingCard({ b }: { b: BpReading }) {
  const staff = useApp((s) => s.staff);
  const review = useReviewProps(b);
  return (
    <li className={clsx("bg-surface rounded-2xl p-3.5 shadow-card border flex flex-col gap-2", b.flagged ? "border-warning/40" : "border-border/60")}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-body-md font-bold">
            {b.systolic}/{b.diastolic}
          </span>
          <span className="text-caption-sm text-text-tertiary">mmHg</span>
          {b.pulse ? <span className="text-caption-sm text-text-secondary bg-surface-alt px-1.5 py-0.5 rounded">{b.pulse} bpm</span> : null}
        </div>
        <ReviewBadge {...review} short />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-[12px] text-text-secondary">
        <span className={b.flagged ? "font-medium text-text-primary" : undefined}>{fmtDayTime(b.measuredAt)}</span>
        <SourceTag patient={b.patientReported}>{bpSource(b, whoName(b.enteredBy, staff))}</SourceTag>
      </div>
    </li>
  );
}

/** Cards on phone, a real table on desktop. */
export function ReadingsList({ readings }: { readings: BpReading[] }) {
  const staff = useApp((s) => s.staff);
  return (
    <>
      <ul className="space-y-2.5 lg:hidden">
        {readings.map((b) => (
          <ReadingCard key={b.id} b={b} />
        ))}
      </ul>
      <Card className="hidden lg:block overflow-hidden">
        <table className="w-full text-left text-[14px]">
          <thead className="bg-surface-alt text-caption-sm text-text-secondary">
            <tr>
              <th className="px-5 py-3 font-medium">Date</th>
              <th className="px-3 py-3 font-medium">Reading</th>
              <th className="px-3 py-3 font-medium">Pulse</th>
              <th className="px-3 py-3 font-medium">Method and source</th>
              <th className="px-3 py-3 font-medium">Entered by</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {readings.map((b) => (
              <tr key={b.id} className={b.flagged ? "bg-warning-tint/30" : undefined}>
                <td className="px-5 py-3 whitespace-nowrap">{fmtDayTime(b.measuredAt)}</td>
                <td className="px-3 py-3 font-semibold whitespace-nowrap">
                  {b.systolic}/{b.diastolic} <span className="text-text-tertiary font-normal text-[12px]">mmHg</span>
                </td>
                <td className="px-3 py-3">{b.pulse ? `${b.pulse} bpm` : "Not measured"}</td>
                <td className="px-3 py-3">
                  <SourceTag patient={b.patientReported}>{b.patientReported ? `${b.method} - patient-reported` : `${b.method}, ${b.source}`}</SourceTag>
                </td>
                <td className="px-3 py-3">{whoName(b.enteredBy, staff)}</td>
                <td className="px-5 py-3">
                  <ReviewBadge status={b.reviewStatus} by={whoName(b.reviewedBy, staff)} short />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}
