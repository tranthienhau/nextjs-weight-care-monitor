"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useApp } from "@/lib/store";
import { bpFor, labsFor, latest, seriesFor, weightChange, whoName } from "@/lib/selectors";
import { fmtDay, fmtDayTime, fmtVal, signed } from "@/lib/format";
import type { Patient } from "@/lib/types";
import { Card, EstimateTag, HeroCard, Icon, ReviewBadge, SourceTag, StatusPill } from "@/components/ui";
import { Sparkline } from "@/components/charts";
import { currentPlan } from "./status";

/** "Hume Body Pod - Clinic Room 2" -> "Hume Body Pod". */
const shortSource = (s: string) => s.split(" - ")[0];

export function WeightHero({ p }: { p: Patient }) {
  const ms = useApp((s) => s.measurements);
  const series = seriesFor(ms, p.id, "weight").filter((m) => m.value != null);
  const now = series[series.length - 1];
  const first = series[0];
  const change = weightChange(ms, p);
  const pct = change != null && p.startWeightLb ? (change / p.startWeightLb) * 100 : null;
  return (
    <HeroCard className="rounded-[20px]">
      <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-white/10 blur-xl pointer-events-none" />
      <div className="relative">
        <div className="flex items-center justify-between">
          <span className="text-caption-sm font-semibold tracking-wider uppercase text-white/90">Weight change</span>
          {pct != null && (
            <span className="inline-flex items-center gap-1 text-caption-sm bg-black/20 backdrop-blur-sm px-2.5 py-0.5 rounded-full">
              <Icon name={pct <= 0 ? "trending_down" : "trending_up"} size={14} />
              {signed(pct)}%
            </span>
          )}
        </div>
        <div className="mt-2 flex items-baseline gap-2 flex-wrap">
          <span className="text-[32px] leading-10 font-bold tracking-tight">{change != null ? `${signed(change)} lb` : "No change yet"}</span>
          <span className="text-label-md text-white/80">since enrollment</span>
        </div>
        <div className="my-3" role="img" aria-label="Weight trend since enrollment">
          <Sparkline values={series.map((m) => m.value as number)} height={52} />
        </div>
        <div className="pt-2 border-t border-white/20 flex items-center justify-between gap-2 text-caption-sm text-white/90 flex-wrap">
          <span>
            Start {fmtVal(p.startWeightLb || first?.value, "lb")} ({fmtDay(p.enrolledOn)})
          </span>
          {now && (
            <span>
              Now {fmtVal(now.value, "lb")} ({fmtDay(now.measuredAt)})
            </span>
          )}
        </div>
      </div>
    </HeroCard>
  );
}

function MetricCard({ title, tag, children, source, href }: { title: string; tag?: ReactNode; children: ReactNode; source: ReactNode; href: string }) {
  return (
    <Link href={href} className="block">
      <Card className="p-4 rounded-[20px] flex flex-col justify-between min-h-[150px] h-full hover:border-accent/50 transition-colors" as="article">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-1 mb-2">
            <span className="text-caption-sm text-text-secondary">{title}</span>
            {tag}
          </div>
          {children}
        </div>
        <div className="mt-3 pt-2.5 border-t border-border/60 min-w-0">{source}</div>
      </Card>
    </Link>
  );
}

const Big = ({ children }: { children: ReactNode }) => <div className="text-title-md font-bold text-text-primary tracking-tight">{children}</div>;
const Sub = ({ children }: { children: ReactNode }) => <div className="text-[12px] text-text-secondary mt-0.5">{children}</div>;
const Missing = ({ children = "No reading" }: { children?: ReactNode }) => <div className="text-[15px] font-medium text-text-tertiary">{children}</div>;

export function OverviewGrid({ p }: { p: Patient }) {
  const ms = useApp((s) => s.measurements);
  const bps = useApp((s) => s.bpReadings);
  const labs = useApp((s) => s.labResults);
  const staff = useApp((s) => s.staff);

  const bfSeries = seriesFor(ms, p.id, "bodyFat");
  const bf = bfSeries[bfSeries.length - 1];
  const bfBase = bfSeries.find((m) => m.value != null);
  const bfDelta = bf?.value != null && bfBase?.value != null && bfBase !== bf ? bf.value - bfBase.value : null;
  const bp = bpFor(bps, p.id).at(-1);
  const a1c = labsFor(labs, p.id).find((l) => l.test === "HbA1c");
  const plan = currentPlan(p.id);
  const base = `/patients/${p.id}`;

  return (
    <div className="grid grid-cols-2 gap-3">
      <MetricCard
        title="Body fat"
        tag={<EstimateTag />}
        href={`${base}/body`}
        source={bf ? <SourceTag patient={bf.patientReported}>{shortSource(bf.source)} - {whoName(bf.enteredBy, staff)}</SourceTag> : <SourceTag>Not measured yet</SourceTag>}
      >
        {bf ? <Big>{fmtVal(bf.value, "%")}</Big> : <Missing>Not measured</Missing>}
        {bfDelta != null && (
          <div className={`text-[12px] flex items-center gap-0.5 mt-0.5 ${bfDelta <= 0 ? "text-success" : "text-text-secondary"}`}>
            <Icon name={bfDelta <= 0 ? "arrow_downward" : "arrow_upward"} size={14} />
            {signed(bfDelta)} pts from baseline
          </div>
        )}
        {bf && <Sub>{fmtDay(bf.measuredAt)}</Sub>}
      </MetricCard>

      <MetricCard
        title="Blood pressure"
        tag={bp && <ReviewBadge status={bp.reviewStatus} by={whoName(bp.reviewedBy, staff)} short />}
        href={`${base}/bp`}
        source={bp ? <SourceTag patient={bp.patientReported}>{bp.source} - {whoName(bp.enteredBy, staff)}</SourceTag> : <SourceTag>No reading yet</SourceTag>}
      >
        {bp ? (
          <>
            <Big>
              {bp.systolic}/{bp.diastolic} <span className="text-caption-sm font-normal text-text-secondary">mmHg</span>
            </Big>
            <Sub>{fmtDayTime(bp.measuredAt)}</Sub>
          </>
        ) : (
          <Missing />
        )}
      </MetricCard>

      <MetricCard
        title="HbA1c"
        href={`${base}/labs`}
        source={a1c ? <SourceTag>{a1c.lab} - {whoName(a1c.enteredBy, staff)}</SourceTag> : <SourceTag>No lab entered</SourceTag>}
      >
        {a1c ? (
          <>
            <Big>{fmtVal(a1c.value, a1c.unit)}</Big>
            <Sub>Lab ref {a1c.refRange} {a1c.unit} • {fmtDay(a1c.collectedOn)}</Sub>
            <div className="mt-2">
              <ReviewBadge status={a1c.reviewStatus} by={whoName(a1c.reviewedBy, staff)} on={a1c.reviewedAt ? fmtDay(a1c.reviewedAt) : undefined} short />
            </div>
          </>
        ) : (
          <Missing>No result</Missing>
        )}
      </MetricCard>

      <MetricCard
        title="Medication"
        tag={plan && <StatusPill>Treatment plan</StatusPill>}
        href={`${base}/meds`}
        source={plan ? <SourceTag>Authorized by {whoName(plan.prescriberId, staff)}</SourceTag> : <SourceTag>No current plan</SourceTag>}
      >
        {plan ? (
          <>
            <div className="text-label-md font-bold text-text-primary leading-tight mt-1">{plan.name}</div>
            <div className="text-caption-sm text-accent-fill font-medium">
              {plan.dose} {plan.frequency.toLowerCase()}
            </div>
            <div className="text-[12px] text-text-secondary mt-0.5">{plan.route}</div>
          </>
        ) : (
          <Missing>No current plan</Missing>
        )}
      </MetricCard>
    </div>
  );
}

export function LastReview({ p }: { p: Patient }) {
  const reviews = useApp((s) => s.reviews);
  const staff = useApp((s) => s.staff);
  const last = reviews.filter((r) => r.patientId === p.id).sort((a, b) => b.at.localeCompare(a.at))[0];
  return (
    <Card className="p-4 rounded-[20px] flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-full bg-accent-tint text-accent-fill grid place-items-center shrink-0">
          <Icon name="assignment_turned_in" size={20} />
        </div>
        <div className="min-w-0">
          <p className="text-caption-sm text-text-secondary">
            Last clinician review:{" "}
            <span className="font-medium text-text-primary">{last ? `${fmtDay(last.at)} by ${whoName(last.by, staff)}` : "None yet"}</span>
          </p>
          <p className="text-[12px] text-text-tertiary truncate">{last ? last.note : "Nothing has been signed for this patient."}</p>
        </div>
      </div>
    </Card>
  );
}
