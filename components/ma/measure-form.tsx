"use client";

import clsx from "clsx";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { latest } from "@/lib/selectors";
import { fmtDay, kgToLb, lbToKg } from "@/lib/format";
import type { Patient } from "@/lib/types";
import { Button, Card, EstimateTag, Icon, Toggle } from "@/components/ui";
import { useCurrentUser } from "@/components/shell";
import { AuditNote, EnteredBy, MobileFormFooter, PatientMini } from "./common";
import { CompRow, SOURCES, SourcePicker, UnitToggle, type SourceOption } from "./measure-fields";
import { DeltaPill, Summary } from "./measure-summary";

type Unit = "lb" | "kg";
const num = (s: string) => (s.trim() === "" ? null : Number(s));
const convert = (s: string, to: Unit) => {
  const n = num(s);
  if (n == null || Number.isNaN(n)) return s;
  return String(to === "kg" ? lbToKg(n) : kgToLb(n));
};

export function MeasureForm({ p }: { p: Patient }) {
  const router = useRouter();
  const { userId } = useCurrentUser();
  const ms = useApp((s) => s.measurements);
  const addMeasurements = useApp((s) => s.addMeasurements);
  const prev = latest(ms, p.id, "weight");

  const [at, setAt] = useState("2026-10-22T09:34");
  const [src, setSrc] = useState<SourceOption>(SOURCES[0]);
  const [unit, setUnit] = useState<Unit>("lb");
  const [weight, setWeight] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [muscle, setMuscle] = useState("");
  const [ffm, setFfm] = useState("");
  const [visceralOff, setVisceralOff] = useState(true);
  const [visceral, setVisceral] = useState("");
  const [notes, setNotes] = useState("");
  const [tried, setTried] = useState(false);

  const switchUnit = (u: Unit) => {
    if (u === unit) return;
    setWeight((v) => convert(v, u));
    setMuscle((v) => convert(v, u));
    setFfm((v) => convert(v, u));
    setUnit(u);
  };

  const w = num(weight);
  const wLb = w == null ? null : unit === "kg" ? kgToLb(w) : w;
  const [lo, hi] = unit === "kg" ? [lbToKg(50), lbToKg(700)] : [50, 700];
  const delta = wLb != null && prev?.value != null ? Math.round((wLb - prev.value) * 10) / 10 : null;
  const deltaShown = delta == null ? null : unit === "kg" ? lbToKg(Math.abs(delta)) * Math.sign(delta) : delta;

  const errors: Record<string, string | undefined> = {
    weight: w == null ? (tried ? "Weight is required." : undefined) : Number.isNaN(w) || w < lo || w > hi ? `Enter a weight between ${lo} and ${hi} ${unit}.` : undefined,
    bodyFat: badRange(bodyFat, 3, 75, "Body fat must be between 3 and 75 %."),
    muscle: massError(muscle, w),
    ffm: massError(ffm, w),
    visceral: visceralOff ? undefined : badRange(visceral, 1, 59, "Visceral fat rating must be between 1 and 59.", true),
  };
  const valid = w != null && !Object.values(errors).some(Boolean);

  const save = () => {
    setTried(true);
    if (!valid || !userId) return;
    const values: Parameters<typeof addMeasurements>[0]["values"] = { weight: w };
    if (num(bodyFat) != null) values.bodyFat = num(bodyFat);
    if (num(muscle) != null) values.muscleMass = num(muscle);
    if (num(ffm) != null) values.fatFreeMass = num(ffm);
    values.visceralFat = visceralOff ? null : num(visceral);
    addMeasurements({ patientId: p.id, measuredAt: `${at}:00`, source: src.source, enteredBy: userId, patientReported: src.patient, notes: notes.trim() || undefined, values, unit });
    router.push(`/patients/${p.id}/body`);
  };

  const saveBtn = (
    <Button onClick={save} full icon="check">
      Save measurement
    </Button>
  );

  return (
    <div className="pt-4 pb-40 lg:pb-10 lg:grid lg:grid-cols-[1fr_360px] lg:gap-6 lg:items-start">
      <div className="space-y-4">
        <PatientMini p={p} />

        <div className="space-y-1.5">
          <label htmlFor="m-at" className="block text-label-md text-text-secondary px-0.5">
            Date and time
          </label>
          <div className="relative bg-surface rounded-xl border border-border shadow-sm flex items-center px-3.5 h-12 focus-within:ring-2 focus-within:ring-accent">
            <Icon name="schedule" size={20} className="text-accent-fill mr-2.5" />
            <input id="m-at" type="datetime-local" value={at} max="2026-10-22T23:59" onChange={(e) => setAt(e.target.value)} className="w-full bg-transparent outline-none text-body-md text-text-primary" />
          </div>
        </div>

        <SourcePicker value={src.source} onChange={setSrc} />

        <Card className="p-5 rounded-[20px]">
          <div className="flex items-center justify-between">
            <label htmlFor="m-weight" className="flex items-center gap-1.5 text-label-md font-bold tracking-wider text-text-secondary uppercase">
              Weight <span className="w-1.5 h-1.5 rounded-full bg-accent-fill" />
            </label>
            <UnitToggle unit={unit} onChange={switchUnit} />
          </div>
          <div className="mt-4 mb-2 flex items-baseline justify-center">
            <input
              id="m-weight"
              inputMode="decimal"
              value={weight}
              placeholder="Weight"
              aria-invalid={!!errors.weight}
              onChange={(e) => setWeight(e.target.value.replace(/[^0-9.]/g, ""))}
              className={clsx("w-44 text-center text-[44px] leading-none font-bold tracking-tight bg-transparent outline-none placeholder:text-text-tertiary/50 border-b-2", errors.weight ? "border-danger" : "border-transparent focus:border-accent")}
            />
            <span className="text-[22px] font-medium text-text-tertiary ml-1.5">{unit}</span>
          </div>
          {errors.weight && <p className="text-[12px] text-danger text-center mb-2">{errors.weight}</p>}
          <div className="flex justify-center">
            <DeltaPill delta={deltaShown} unit={unit} prevDate={prev ? fmtDay(prev.measuredAt) : undefined} />
          </div>
        </Card>

        <Card className="p-4 rounded-[20px] space-y-3.5">
          <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
            <h2 className="text-label-md font-semibold text-text-primary">Body composition</h2>
            <span className="text-[11px] text-text-tertiary">Optional - device estimates</span>
          </div>
          <CompRow id="m-bf" label="Body fat" unit="%" value={bodyFat} onChange={setBodyFat} error={errors.bodyFat} />
          <CompRow id="m-mm" label="Muscle mass" unit={unit} value={muscle} onChange={setMuscle} error={errors.muscle} />
          <CompRow id="m-ffm" label="Fat-free mass" unit={unit} value={ffm} onChange={setFfm} error={errors.ffm} />
          <div className="pt-3 border-t border-border/50 flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <label htmlFor="m-vf" className="text-label-md font-medium text-text-secondary">
                  Visceral fat
                </label>
                <EstimateTag />
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                <Toggle on={visceralOff} onChange={setVisceralOff} label="Visceral fat not measured" />
                <span className="text-[12px] text-text-secondary font-medium">Not measured</span>
              </div>
            </div>
            {visceralOff ? (
              <div className="w-32 h-11 bg-surface-alt rounded-xl border border-dashed border-border grid place-items-center text-[12px] text-text-tertiary font-medium select-none">Not measured</div>
            ) : (
              <div className="w-32">
                <input
                  id="m-vf"
                  inputMode="numeric"
                  value={visceral}
                  placeholder="Rating"
                  onChange={(e) => setVisceral(e.target.value.replace(/[^0-9]/g, ""))}
                  className={clsx("w-full h-11 bg-surface rounded-xl border text-right px-3 text-[15px] font-semibold outline-none focus:ring-2 focus:ring-accent/30", errors.visceral ? "border-danger" : "border-border")}
                />
              </div>
            )}
          </div>
          {errors.visceral && <p className="text-[12px] text-danger text-right">{errors.visceral}</p>}
        </Card>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center px-0.5">
            <label htmlFor="m-notes" className="text-label-md text-text-secondary">
              Clinical notes
            </label>
            <span className="text-[11px] text-text-tertiary">Optional</span>
          </div>
          <textarea
            id="m-notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Shoes off, morning visit."
            className="w-full bg-surface rounded-xl border border-border shadow-sm p-3 text-caption-sm text-text-primary placeholder:text-text-tertiary outline-none focus:ring-2 focus:ring-accent resize-none leading-relaxed"
          />
        </div>

        <EnteredBy patientSource={src.patient} note={src.patient ? "Entering a value the patient reported from home" : undefined} />
      </div>

      <aside className="hidden lg:block lg:sticky lg:top-24">
        <Summary
          source={src}
          at={`${at}:00`}
          rows={[
            { label: "Weight", value: weight, unit, estimate: false },
            { label: "Body fat", value: bodyFat, unit: "%", estimate: true },
            { label: "Muscle mass", value: muscle, unit, estimate: true },
            { label: "Fat-free mass", value: ffm, unit, estimate: true },
            { label: "Visceral fat", value: visceralOff ? "" : visceral, unit: "", estimate: true },
          ]}
          delta={<DeltaPill delta={deltaShown} unit={unit} prevDate={prev ? fmtDay(prev.measuredAt) : undefined} />}
          action={saveBtn}
        />
      </aside>

      <MobileFormFooter>
        {saveBtn}
        <AuditNote />
      </MobileFormFooter>
    </div>
  );
}

function badRange(s: string, min: number, max: number, msg: string, required = false) {
  const n = num(s);
  if (n == null) return required ? msg : undefined;
  return Number.isNaN(n) || n < min || n > max ? msg : undefined;
}

function massError(s: string, weight: number | null) {
  const n = num(s);
  if (n == null) return undefined;
  if (Number.isNaN(n) || n <= 0) return "Enter a positive value.";
  if (weight != null && n >= weight) return "Must be less than total weight.";
  return undefined;
}

