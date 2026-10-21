"use client";

import { adherence, medications } from "@/lib/data";
import { fmtDate, fmtDayTime } from "@/lib/format";
import { getStaff, whoName } from "@/lib/selectors";
import { useApp } from "@/lib/store";
import type { Medication, Patient } from "@/lib/types";
import { Card, Icon, ReviewBadge, StatusPill } from "@/components/ui";
import { ClinicalPage, Panel } from "@/components/clinical/PatientTabs";
import { AdherenceDots } from "@/components/clinical/AdherenceDots";

const monthName = (m: string) => new Date(`${m}-01T12:00:00`).toLocaleDateString("en-US", { month: "long", year: "numeric" });
const None = ({ children }: { children: string }) => <p className="text-body-md text-text-tertiary">{children}</p>;

function PlanCard({ med }: { med: Medication }) {
  return (
    <Card className="relative overflow-hidden p-5">
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-primary-container via-accent-fill to-support" />
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-alt px-2.5 py-1 text-[11px] font-medium text-text-secondary">
          <Icon name="verified_user" size={13} className="text-accent-fill" />
          Clinician authorized
        </span>
        <StatusPill tone={med.status === "current" ? "success" : "muted"}>{med.status === "current" ? "Current" : `Stopped ${fmtDate(med.stop!)}`}</StatusPill>
      </div>
      <h3 className="font-serif text-[26px] leading-tight font-bold">
        {med.name} {med.dose}
      </h3>
      <p className="mt-1 text-[13.5px] text-text-secondary">
        {med.route} - {med.frequency} - Started {fmtDate(med.start)}
      </p>
      <div className="my-3.5 h-px bg-border" />
      <p className="flex items-center gap-1.5 text-caption-sm text-text-secondary">
        <Icon name="stethoscope" size={16} className="text-accent-fill" />
        Prescriber: <span className="font-semibold text-text-primary">{getStaff(med.prescriberId)?.name ?? "Not recorded"}</span>
      </p>
    </Card>
  );
}

function MedRow({ med }: { med: Medication }) {
  const stopped = med.status === "discontinued";
  return (
    <li className={`py-3.5 flex items-start justify-between gap-3 ${stopped ? "opacity-75" : ""}`}>
      <div className="min-w-0">
        <h4 className={`text-[15px] font-semibold ${stopped ? "text-text-tertiary line-through" : ""}`}>
          {med.name} {med.dose}
        </h4>
        <p className="mt-0.5 text-caption-sm text-text-secondary">
          {med.route} - {med.frequency} - Started {fmtDate(med.start)}
        </p>
        <p className="mt-1 text-[11px] text-text-tertiary">Prescriber: {getStaff(med.prescriberId)?.name ?? "Not recorded"}</p>
      </div>
      {stopped ? (
        <span className="rounded-full bg-surface-alt px-2.5 py-0.5 text-[11px] font-medium text-text-tertiary shrink-0 border border-border">
          Discontinued {med.stop ? fmtDate(med.stop) : ""}
        </span>
      ) : (
        <StatusPill tone="success">Current</StatusPill>
      )}
    </li>
  );
}

function MedsTab({ patient }: { patient: Patient }) {
  const reviews = useApp((s) => s.reviews);
  const staff = useApp((s) => s.staff);
  const meds = medications.filter((m) => m.patientId === patient.id);
  const plan = meds.filter((m) => m.kind === "plan");
  const list = meds.filter((m) => m.kind === "list").sort((a, b) => (a.status === b.status ? b.start.localeCompare(a.start) : a.status === "current" ? -1 : 1));
  const adh = adherence.filter((a) => a.patientId === patient.id).sort((a, b) => b.month.localeCompare(a.month))[0];
  const review = reviews.filter((r) => r.patientId === patient.id).sort((a, b) => b.at.localeCompare(a.at))[0];

  return (
    <>
      <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-6">
        <section aria-labelledby="plan-h" className="space-y-2">
          <h2 id="plan-h" className="text-caption-sm text-text-secondary uppercase tracking-wide px-1">
            Authorized treatment plan
          </h2>
          {plan.length ? plan.map((m) => <PlanCard key={m.id} med={m} />) : <Card className="p-5"><None>No treatment plan recorded yet.</None></Card>}
        </section>

        <section aria-labelledby="adh-h" className="space-y-2">
          <h2 id="adh-h" className="text-caption-sm text-text-secondary uppercase tracking-wide px-1">
            Patient-reported adherence
          </h2>
          <Panel
            title={adh ? monthName(adh.month) : "Adherence"}
            right={
              <span className="inline-flex items-center gap-1 rounded-md border border-dashed border-text-tertiary px-2 py-0.5 text-[11px] font-medium text-text-secondary">
                <Icon name="home" size={12} />
                Patient-reported
              </span>
            }
          >
            {adh ? (
              <>
                <p className="text-[15px] font-semibold">
                  {adh.taken} of {adh.scheduled} scheduled doses reported taken
                </p>
                <AdherenceDots taken={adh.taken} scheduled={adh.scheduled} />
                <div className="mt-3 rounded-xl bg-warning-tint/50 p-3 border border-warning/20">
                  <span className="text-[12px] font-semibold text-text-secondary">Reported side effects: </span>
                  <span className="text-[13px]">{adh.sideEffects || "None reported"}</span>
                </div>
                <p className="mt-2 text-[11px] text-text-tertiary">Reported by the patient {fmtDayTime(adh.reportedAt)}</p>
              </>
            ) : (
              <None>No adherence reported by the patient yet.</None>
            )}
          </Panel>
        </section>

        <section aria-labelledby="list-h" className="space-y-2">
          <h2 id="list-h" className="text-caption-sm text-text-secondary uppercase tracking-wide px-1">
            Medication list
          </h2>
          <Panel title="Other medications" right={<span className="text-[11px] text-text-tertiary">{list.length} recorded</span>}>
            {list.length ? <ul className="divide-y divide-border">{list.map((m) => <MedRow key={m.id} med={m} />)}</ul> : <None>No other medications recorded.</None>}
          </Panel>
        </section>

        <section aria-labelledby="rev-h" className="space-y-2">
          <h2 id="rev-h" className="text-caption-sm text-text-secondary uppercase tracking-wide px-1">
            Clinical review
          </h2>
          <Panel
            title="Latest signed review"
            right={review ? <ReviewBadge status="reviewed" by={whoName(review.by, staff)} on={fmtDate(review.at)} short /> : <ReviewBadge status="unreviewed" />}
          >
            {review ? (
              <>
                <blockquote className="rounded-r-xl border-l-4 border-primary-container bg-surface-alt p-3.5 text-[13px] leading-relaxed text-text-secondary italic">
                  &ldquo;{review.note}&rdquo;
                </blockquote>
                <p className="mt-3 text-[11px] text-text-tertiary">Covered: {review.items.join(", ")}</p>
              </>
            ) : (
              <None>No clinical review signed yet.</None>
            )}
          </Panel>
        </section>
      </div>

      <footer className="pt-2 pb-4 flex items-center justify-center gap-1.5 text-[12px] text-text-tertiary text-center">
        <Icon name="info" size={14} />
        <span>Steadfast records medications. It never prescribes, changes or recommends doses.</span>
      </footer>
    </>
  );
}

export default function Page() {
  return <ClinicalPage title="Medications" active="Meds">{(p) => <MedsTab patient={p} />}</ClinicalPage>;
}
