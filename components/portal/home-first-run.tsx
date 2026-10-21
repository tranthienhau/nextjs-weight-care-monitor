"use client";

import { useState } from "react";
import { Avatar, Button, Card, Chip, Icon, SafetyBanner, Toggle } from "@/components/ui";
import { images } from "@/lib/data";
import { fmtDate, fmtDay } from "@/lib/format";
import { getStaff } from "@/lib/selectors";
import { useApp } from "@/lib/store";
import type { Patient } from "@/lib/types";

const INTAKE = [
  { id: "goal", text: "What is your main goal for the program?", options: ["Lose weight", "Improve energy", "Better lab results", "Not sure yet"] },
  { id: "prior", text: "Have you used a weight-loss medication before?", options: ["No", "Yes", "Prefer to discuss"] },
  { id: "activity", text: "How active are you in a typical week?", options: ["Rarely", "1-2 days", "3+ days"] },
];

function IntakeForm({ onSubmit }: { onSubmit: () => void }) {
  const [a, setA] = useState<Record<string, string>>({});
  const complete = INTAKE.every((q) => a[q.id]);
  return (
    <div className="mt-3 space-y-4 rounded-xl bg-surface-alt p-4">
      {INTAKE.map((q) => (
        <fieldset key={q.id}>
          <legend className="text-label-md font-semibold text-text-primary mb-2">{q.text}</legend>
          <div className="flex flex-wrap gap-2">
            {q.options.map((o) => (
              <Chip key={o} selected={a[q.id] === o} onClick={() => setA({ ...a, [q.id]: o })} className="h-11">
                {o}
              </Chip>
            ))}
          </div>
        </fieldset>
      ))}
      <Button full disabled={!complete} onClick={onSubmit}>
        Submit intake
      </Button>
      <p className="text-[12px] text-text-tertiary">Your full medical history is reviewed with you at the intake visit.</p>
    </div>
  );
}

function Done() {
  return (
    <span className="inline-flex items-center gap-1 text-caption-sm text-success font-medium">
      <Icon name="check_circle" filled size={18} /> Done
    </span>
  );
}

function Checklist({ patient }: { patient: Patient }) {
  const log = useApp((s) => s.log);
  const [intakeOpen, setIntakeOpen] = useState(false);
  const [intake, setIntake] = useState(false);
  const [consentOpen, setConsentOpen] = useState(false);
  const [consent, setConsent] = useState(patient.consent === "signed");
  const [reminders, setReminders] = useState(false);
  const count = [intake, consent, reminders].filter(Boolean).length;

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Icon name="event_available" className="text-accent-fill" />
          <h2 className="text-title-md text-text-primary">Before your visit</h2>
        </div>
        <span className="text-caption-sm bg-accent-tint text-accent-fill px-2.5 py-0.5 rounded-full font-medium">{count} of 3</span>
      </div>
      <div className="divide-y divide-border">
        <div className="py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="pr-2">
              <h3 className="text-label-md text-text-primary font-semibold">Complete intake questionnaire</h3>
              <p className="text-caption-sm text-text-secondary">Estimated 5 min - Medical history and lifestyle</p>
            </div>
            {intake ? (
              <Done />
            ) : (
              !intakeOpen && (
                <button
                  type="button"
                  onClick={() => setIntakeOpen(true)}
                  className="h-11 px-5 bg-accent-fill hover:bg-accent-pressed text-white text-label-md rounded-full inline-flex items-center justify-center gap-1 shrink-0"
                >
                  Start intake <Icon name="arrow_forward" size={16} />
                </button>
              )
            )}
          </div>
          {intakeOpen && !intake && (
            <IntakeForm
              onSubmit={() => {
                setIntake(true);
                log({ by: patient.id, action: "create", target: "Intake questionnaire", detail: "Submitted from patient portal" });
              }}
            />
          )}
        </div>

        <div className="py-4">
          <button type="button" onClick={() => setConsentOpen((v) => !v)} aria-expanded={consentOpen} className="w-full min-h-[44px] flex items-center justify-between text-left group">
            <span className="pr-2">
              <span className="block text-label-md text-text-primary font-semibold group-hover:text-accent-fill">Review and sign consent</span>
              <span className="block text-caption-sm text-text-secondary">Program consent and privacy notice</span>
            </span>
            {consent ? <Done /> : <Icon name={consentOpen ? "expand_less" : "chevron_right"} className="text-text-tertiary" />}
          </button>
          {consentOpen && !consent && (
            <div className="mt-3 rounded-xl bg-surface-alt p-4 space-y-3 text-caption-sm text-text-secondary">
              <p>
                You agree to take part in a physician-supervised weight program. Your measurements and check-ins are reviewed by your care team during business hours. This
                portal is not monitored 24/7 and is not for emergencies.
              </p>
              <p>Your health information is private and only visible to your care team and to you.</p>
              <Button
                full
                icon="draw"
                onClick={() => {
                  setConsent(true);
                  log({ by: patient.id, action: "sign", target: "Program consent", detail: "Consent and privacy notice signed in portal" });
                }}
              >
                I agree and sign
              </Button>
            </div>
          )}
        </div>

        <div className="pt-4 flex items-center justify-between gap-3">
          <div className="pr-3">
            <h3 className="text-label-md text-text-primary font-semibold">Turn on check-in reminders</h3>
            <p className="text-caption-sm text-text-secondary">Monthly check-in and visit reminders</p>
          </div>
          <Toggle on={reminders} onChange={setReminders} label="Check-in reminders" />
        </div>
      </div>
    </Card>
  );
}

/** First-run patient home before any measurements (design 18). */
export function FirstRunHome({ patient }: { patient: Patient }) {
  const visit = patient.nextVisit;
  const doctor = getStaff(patient.clinicianId);
  return (
    <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-6 lg:items-start">
      <Card className="p-4">
        <div className="w-full h-44 lg:h-64 rounded-2xl overflow-hidden relative bg-surface-alt">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={images.emptyReception} alt="Bright clinic reception desk" className="w-full h-full object-cover" />
          {visit && (
            <div className="absolute top-3 left-3 bg-surface/95 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm border border-border/60">
              <span className="w-2 h-2 rounded-full bg-accent-fill animate-pulse" />
              <span className="text-caption-sm text-text-primary font-medium">Upcoming intake - {fmtDate(visit.at)}</span>
            </div>
          )}
        </div>
        <div className="pt-4 pb-1 px-1">
          <p className="text-title-md text-text-primary font-semibold leading-snug">Your journey begins here</p>
          <p className="text-body-md text-text-secondary mt-1.5">
            Your first measurements will appear after your intake visit{visit ? ` on ${fmtDay(visit.at)}` : ""}.
          </p>
        </div>
      </Card>
      <div className="space-y-4">
        <Checklist patient={patient} />
        {doctor && (
          <section className="bg-surface-alt rounded-2xl p-4 border border-border flex items-center gap-3.5">
            <Avatar src={doctor.avatar} alt="" size={40} />
            <div className="flex-1">
              <h4 className="text-label-md text-text-primary font-semibold">{doctor.name}, MD</h4>
              <p className="text-caption-sm text-text-secondary">Your physician</p>
            </div>
          </section>
        )}
        <SafetyBanner />
      </div>
    </div>
  );
}
