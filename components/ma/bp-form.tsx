"use client";

import clsx from "clsx";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useApp } from "@/lib/store";
import type { BpReading, Patient } from "@/lib/types";
import { Button, Card, Icon } from "@/components/ui";
import { useCurrentUser } from "@/components/shell";
import { AuditNote, ChoiceChips, EnteredBy, MobileFormFooter, PatientMini } from "./common";

const METHODS = ["Automated cuff", "Manual", "Patient home cuff"] as const satisfies readonly BpReading["method"][];
const ARMS = ["Left", "Right"] as const satisfies readonly BpReading["arm"][];
const POSITIONS = ["Seated, 5 min rest", "Seated", "Standing", "Lying down"] as const;

const int = (s: string) => (s.trim() === "" ? null : Number(s));
const range = (v: number | null, lo: number, hi: number, name: string, required: boolean) =>
  v == null ? (required ? `${name} is required.` : undefined) : v < lo || v > hi ? `${name} must be ${lo}-${hi}.` : undefined;

export function BpForm({ p, measuredAt }: { p: Patient; measuredAt: string }) {
  const router = useRouter();
  const { userId } = useCurrentUser();
  const rule = useApp((s) => s.settings.bpRule);
  const addBpReading = useApp((s) => s.addBpReading);

  const [sys, setSys] = useState("");
  const [dia, setDia] = useState("");
  const [pulse, setPulse] = useState("");
  const [method, setMethod] = useState<BpReading["method"]>("Automated cuff");
  const [arm, setArm] = useState<BpReading["arm"]>("Left");
  const [position, setPosition] = useState<(typeof POSITIONS)[number]>("Seated, 5 min rest");
  const [tried, setTried] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [touched, setTouched] = useState({ sys: false, dia: false, pulse: false });
  const touch = (k: keyof typeof touched) => () => setTouched((t) => ({ ...t, [k]: true }));

  const s = int(sys);
  const d = int(dia);
  const pu = int(pulse);
  const show = (k: keyof typeof touched) => tried || touched[k];
  const err = {
    sys: show("sys") ? range(s, 60, 260, "Systolic", true) : undefined,
    dia: show("dia") ? (range(d, 30, 160, "Diastolic", true) ?? (s != null && d != null && s <= d ? "Systolic must be higher than diastolic." : undefined)) : undefined,
    pulse: show("pulse") ? range(pu, 30, 220, "Pulse", false) : undefined,
  };
  const valuesOk = s != null && d != null && !range(s, 60, 260, "", true) && !range(d, 30, 160, "", true) && s > d;
  const valid = valuesOk && !range(pu, 30, 220, "", false);

  const sysHit = valuesOk && s! >= rule.systolicGte;
  const diaHit = valuesOk && d! >= rule.diastolicGte;
  const meetsRule = sysHit || diaHit;
  const ruleText = [sysHit && `systolic ${rule.systolicGte} or higher`, diaHit && `diastolic ${rule.diastolicGte} or higher`].filter(Boolean).join(", ");
  const repeatAt = new Date(new Date(measuredAt).getTime() + 5 * 60000).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  const save = () => {
    setTried(true);
    if (!valid || !userId) return;
    addBpReading({ patientId: p.id, systolic: s!, diastolic: d!, pulse: pu ?? undefined, measuredAt, method, arm, position, enteredBy: userId });
    router.push(`/patients/${p.id}/bp`);
  };

  const saveBtn = (
    <Button onClick={save} full icon={meetsRule ? "flag" : "check"}>
      {meetsRule ? "Save and flag for review" : "Save reading"}
    </Button>
  );

  return (
    <div className="pt-4 pb-40 lg:pb-10 lg:grid lg:grid-cols-2 lg:gap-6 lg:items-start">
      <div className="space-y-4">
        <PatientMini p={p} />

        <Card className="p-4 rounded-[20px]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-accent" />
              <span className="text-[12px] font-semibold tracking-wider text-text-secondary uppercase">Vital measurement</span>
            </div>
            <span className="text-[12px] text-text-secondary font-medium px-2 py-0.5 bg-surface-alt rounded-md border border-border/60">{position.split(",")[0]}</span>
          </div>
          <div className="bg-surface-alt rounded-xl p-3 border border-border/70">
            <div className="flex items-center justify-center gap-2">
              <BigInput id="bp-sys" label="Systolic" value={sys} onChange={setSys} onBlur={touch("sys")} invalid={!!err.sys} />
              <div className="text-[32px] font-light text-text-tertiary select-none" aria-hidden>
                /
              </div>
              <BigInput id="bp-dia" label="Diastolic" value={dia} onChange={setDia} onBlur={touch("dia")} invalid={!!err.dia} />
            </div>
            <div className="mt-2.5 text-center">
              <span className="text-[13px] font-medium text-text-secondary bg-surface px-3 py-1 rounded-full border border-border/60">mmHg</span>
            </div>
          </div>
          {(err.sys || err.dia) && <p className="text-[12px] text-danger mt-2 text-center">{err.sys ?? err.dia}</p>}
          <div className="mt-3 pt-3 border-t border-border/60 flex items-center justify-between px-1">
            <label htmlFor="bp-pulse" className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-danger-tint grid place-items-center text-support">
                <Icon name="favorite" size={17} />
              </span>
              <span className="text-[13px] text-text-secondary font-medium">Pulse rate</span>
            </label>
            <div className="flex items-baseline gap-1.5">
              <input
                id="bp-pulse"
                inputMode="numeric"
                value={pulse}
                placeholder="--"
                onBlur={touch("pulse")}
                onChange={(e) => setPulse(e.target.value.replace(/\D/g, "").slice(0, 3))}
                className={clsx("w-16 h-11 text-right text-[19px] font-bold bg-surface rounded-lg border px-2 outline-none focus:ring-2 focus:ring-accent", err.pulse ? "border-danger" : "border-border")}
              />
              <span className="text-[12px] text-text-secondary">bpm</span>
            </div>
          </div>
          {err.pulse && <p className="text-[12px] text-danger mt-1 text-right">{err.pulse}</p>}
        </Card>
      </div>

      <div className="space-y-4 mt-4 lg:mt-0">
        <Card className="p-4 rounded-[20px] space-y-4">
          <ChoiceChips label="Method" options={METHODS} value={method} onChange={setMethod} />
          <ChoiceChips label="Arm" options={ARMS} value={arm} onChange={setArm} render={(a) => `${a} arm`} stretch />
          <div className="pt-3 border-t border-border/60">
            <ChoiceChips label="Position" options={POSITIONS} value={position} onChange={setPosition} />
          </div>
        </Card>

        {meetsRule && (
          <div role="alert" className="bg-warning-tint border-l-4 border-warning rounded-r-2xl p-3.5 shadow-sm">
            <div className="flex items-start gap-2.5">
              <Icon name="info" size={20} className="text-warning mt-0.5 shrink-0" />
              <div>
                <p className="text-[13px] font-medium text-[#92400E] leading-snug">
                  This reading meets the practice review rule ({ruleText}). It will be flagged for clinician review. A flag is not a diagnosis.
                </p>
                <div className="mt-2.5 pt-2 border-t border-warning/20">
                  <button type="button" onClick={() => setRepeat(true)} className="inline-flex items-center gap-1.5 min-h-11 text-[12.5px] font-semibold text-accent-fill hover:underline">
                    <Icon name="timer" size={16} />
                    Repeat reading in 5 min
                  </button>
                  {repeat && (
                    <p role="status" className="text-[12px] text-text-secondary">
                      Reminder set for {repeatAt}. Save this reading now; the repeat is entered as its own reading.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <EnteredBy patientSource={method === "Patient home cuff"} note={method === "Patient home cuff" ? "Entering a reading the patient took at home" : undefined} />

        <div className="hidden lg:block">
          {saveBtn}
          <AuditNote />
        </div>
      </div>

      <MobileFormFooter>
        {saveBtn}
        <AuditNote />
      </MobileFormFooter>
    </div>
  );
}

function BigInput({ id, label, value, onChange, onBlur, invalid }: { id: string; label: string; value: string; onChange: (v: string) => void; onBlur: () => void; invalid: boolean }) {
  return (
    <div className={clsx("flex-1 text-center bg-surface rounded-xl py-3.5 px-1 shadow-card-sm border", invalid ? "border-danger" : "border-border/50")}>
      <label htmlFor={id} className="block text-[12px] uppercase tracking-wider text-text-secondary font-medium mb-1">
        {label}
      </label>
      <input
        id={id}
        inputMode="numeric"
        value={value}
        placeholder="--"
        aria-invalid={invalid}
        onBlur={onBlur}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 3))}
        className="w-full text-center text-[44px] font-bold leading-none tracking-tight bg-transparent outline-none placeholder:text-text-tertiary/50"
      />
    </div>
  );
}
