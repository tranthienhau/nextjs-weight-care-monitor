"use client";

import Link from "next/link";
import { Sparkline } from "@/components/charts";
import { Button, Card, HeroCard, Icon, SafetyBanner, StatusPill } from "@/components/ui";
import { DEMO_TODAY, educationArticles, images, medications } from "@/lib/data";
import { fmtDay, signed } from "@/lib/format";
import { getStaff, seriesFor, weightChange } from "@/lib/selectors";
import { useApp } from "@/lib/store";
import type { Patient } from "@/lib/types";
import { monthName } from "./common";

function ProgressHero({ patient }: { patient: Patient }) {
  const ms = useApp((s) => s.measurements);
  const weights = seriesFor(ms, patient.id, "weight").filter((m) => m.value != null);
  const last = weights[weights.length - 1];
  const change = weightChange(ms, patient);
  const pct = change != null ? (change / patient.startWeightLb) * 100 : null;
  return (
    <HeroCard className="p-6">
      <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-white/10 blur-xl pointer-events-none" />
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-semibold tracking-wider uppercase bg-black/20 border border-white/25">Progress</span>
          {pct != null && <span className="text-caption-sm text-white/90">{signed(pct)}% since enrollment</span>}
        </div>
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-[40px] leading-none font-bold tracking-tight">
              {change != null ? signed(change) : "No reading"} <span className="text-2xl font-medium">lb</span>
            </div>
            <p className="text-caption-sm text-white/80 mt-1">since {monthName(patient.enrolledOn)}</p>
          </div>
          <div className="w-28">
            <Sparkline values={weights.map((w) => w.value as number)} height={44} />
          </div>
        </div>
        {last && (
          <Link href="/portal/trends" className="mt-5 pt-3 border-t border-white/15 flex items-center justify-between text-white/85 text-caption-sm">
            <span className="flex items-center gap-1.5">
              <Icon name={last.patientReported ? "home" : "local_hospital"} size={16} />
              Last measured {fmtDay(last.measuredAt)} {last.patientReported ? "at home" : "at the clinic"}
            </span>
            <Icon name="chevron_right" size={18} />
          </Link>
        )}
      </div>
    </HeroCard>
  );
}

function CheckInCard({ patient }: { patient: Patient }) {
  const checkIns = useApp((s) => s.checkIns);
  const month = DEMO_TODAY.slice(0, 7);
  const done = checkIns.some((c) => c.patientId === patient.id && c.month === month);
  const due = patient.checkInDue ? fmtDay(patient.checkInDue) : null;
  return (
    <Card className="p-5">
      <div className="flex items-start gap-3.5 mb-4">
        <div className="w-10 h-10 rounded-full bg-accent-tint grid place-items-center shrink-0 text-accent-fill">
          <Icon name={done ? "task_alt" : "calendar_today"} size={22} />
        </div>
        <div className="flex-1">
          <h2 className="text-title-md text-text-primary leading-tight">
            {done ? `${monthName(DEMO_TODAY)} check-in submitted` : `Monthly check-in due ${due ?? "this month"}`}
          </h2>
          <p className="text-caption-sm text-text-secondary mt-1">
            {done
              ? `Thank you. Your care team will review your answers.${due ? ` Next check-in opens ${due}.` : ""}`
              : "Share how you are feeling, any side effects and questions with your care team."}
          </p>
        </div>
      </div>
      {done ? (
        <Button href="/portal/check-in" variant="secondary" full>
          Send an update
        </Button>
      ) : (
        <Button href="/portal/check-in" full>
          Start check-in
          <Icon name="arrow_forward" size={20} />
        </Button>
      )}
    </Card>
  );
}

function PlanCard({ patient }: { patient: Patient }) {
  const plan = medications.filter((m) => m.patientId === patient.id && m.kind === "plan" && m.status === "current");
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between pb-3 border-b border-border/60">
        <h3 className="text-[18px] font-semibold text-text-primary">Your plan</h3>
        <StatusPill tone="muted">View only</StatusPill>
      </div>
      {plan.length === 0 ? (
        <p className="mt-3.5 text-caption-sm text-text-secondary">Your care team has not set a plan yet.</p>
      ) : (
        plan.map((m) => (
          <div key={m.id} className="mt-3.5">
            <div className="text-text-primary font-medium text-[15px] leading-snug">
              {m.name} {m.dose} - {m.frequency.toLowerCase()}
            </div>
            <div className="text-caption-sm text-text-secondary mt-0.5 flex items-center gap-1">
              <Icon name="schedule" size={16} className="text-accent-fill" />
              {m.route}, since {fmtDay(m.start)}
            </div>
            <div className="mt-3 pt-3 border-t border-dashed border-border flex flex-wrap items-center justify-between gap-2 text-caption-sm text-text-secondary">
              <span className="flex items-center gap-1.5">
                <Icon name="verified" filled size={17} className="text-accent-fill" />
                Set by {getStaff(m.prescriberId)?.name}
              </span>
              <Link href="/portal/messages" className="text-accent-fill font-medium min-h-[44px] inline-flex items-center hover:underline">
                Questions? Message your care team
              </Link>
            </div>
          </div>
        ))
      )}
    </Card>
  );
}

function EducationCard() {
  const a = educationArticles[0];
  return (
    <Card as="article" className="overflow-hidden">
      <div className="relative w-full h-44 bg-surface-alt">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={a.image ?? images.meal} alt="Balanced plate with salmon and vegetables" className="w-full h-full object-cover" />
        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[12px] font-semibold bg-surface/90 text-text-primary shadow-sm border border-border/40">
          {a.tag}
        </span>
      </div>
      <div className="p-5">
        <h4 className="text-title-md text-text-primary leading-snug">{a.title}</h4>
        <p className="text-caption-sm text-text-secondary mt-1.5">Simple ways to keep protein in every meal while your appetite changes, plus hydration tips from your care team.</p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-text-tertiary text-caption-sm">
          <span>{a.minutes} min read</span>
          <span aria-hidden>-</span>
          <span className="flex items-center gap-1 text-text-secondary">
            <Icon name="check_circle" size={15} className="text-success" />
            {getStaff(a.approvedBy)?.name} approved
          </span>
        </div>
      </div>
    </Card>
  );
}

/** Patient home with measurements (design 17). */
export function ActiveHome({ patient }: { patient: Patient }) {
  return (
    <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-6">
      <div className="space-y-4 lg:space-y-6">
        <ProgressHero patient={patient} />
        <CheckInCard patient={patient} />
        <SafetyBanner className="hidden lg:flex">Not monitored 24/7. For emergencies call 911 or visit the nearest emergency room.</SafetyBanner>
      </div>
      <div className="space-y-4 lg:space-y-6">
        <PlanCard patient={patient} />
        <EducationCard />
      </div>
      <SafetyBanner className="lg:hidden">Not monitored 24/7. For emergencies call 911 or visit the nearest emergency room.</SafetyBanner>
    </div>
  );
}
