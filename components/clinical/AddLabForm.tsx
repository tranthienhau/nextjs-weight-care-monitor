"use client";

import { useState } from "react";
import { DEMO_TODAY } from "@/lib/data";
import { useApp } from "@/lib/store";
import { Card, Field, inputCls } from "@/components/ui";
import { useCurrentUser } from "@/components/shell";

type Form = { test: string; value: string; unit: string; refRange: string; flag: "" | "H" | "L"; collectedOn: string; lab: string };

const today = DEMO_TODAY.slice(0, 10);
const empty: Form = { test: "", value: "", unit: "", refRange: "", flag: "", collectedOn: today, lab: "Quest Diagnostics" };

/** Manual lab entry. Values and units are stored exactly as the lab reported them. */
export function AddLabForm({ patientId, onClose, onSaved }: { patientId: string; onClose: () => void; onSaved: (test: string) => void }) {
  const { userId } = useCurrentUser();
  const addLab = useApp((s) => s.addLab);
  const [f, setF] = useState<Form>(empty);
  const [tried, setTried] = useState(false);
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((x) => ({ ...x, [k]: v }));

  const num = Number(f.value);
  const errors = {
    test: !f.test.trim() ? "Enter the test name" : undefined,
    value: f.value === "" || !Number.isFinite(num) ? "Enter the value as reported" : undefined,
    unit: !f.unit.trim() ? "Enter the unit as reported" : undefined,
    collectedOn: !f.collectedOn || f.collectedOn > today ? "Enter a collection date, not in the future" : undefined,
    lab: !f.lab.trim() ? "Enter the lab name" : undefined,
  };
  const ok = Object.values(errors).every((e) => !e);
  const err = (k: keyof typeof errors) => (tried ? errors[k] : undefined);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (!ok || !userId) return;
    addLab({
      patientId,
      test: f.test.trim(),
      value: num,
      unit: f.unit.trim(),
      refRange: f.refRange.trim() || "Not reported",
      flag: f.flag || null,
      collectedOn: f.collectedOn,
      resultOn: today,
      lab: f.lab.trim(),
      enteredBy: userId,
    });
    onSaved(f.test.trim());
  };

  return (
    <Card className="p-4 lg:p-5">
      <form onSubmit={save} noValidate className="space-y-3">
        <div>
          <h2 className="text-[16px] font-semibold">Add lab result</h2>
          <p className="text-[12px] text-text-secondary">Enter exactly what the lab report shows. Units are never converted.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Test" error={err("test")}>
            <input className={inputCls} value={f.test} onChange={(e) => set("test", e.target.value)} placeholder="e.g. HbA1c" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Value" error={err("value")}>
              <input className={inputCls} inputMode="decimal" value={f.value} onChange={(e) => set("value", e.target.value.replace(/[^0-9.]/g, ""))} />
            </Field>
            <Field label="Unit" error={err("unit")}>
              <input className={inputCls} value={f.unit} onChange={(e) => set("unit", e.target.value)} placeholder="%, mg/dL" />
            </Field>
          </div>
          <Field label="Reference range (as reported)">
            <input className={inputCls} value={f.refRange} onChange={(e) => set("refRange", e.target.value)} placeholder="e.g. 4.0 - 5.6" />
          </Field>
          <Field label="Lab flag (as reported)">
            <select className={inputCls} value={f.flag} onChange={(e) => set("flag", e.target.value as Form["flag"])}>
              <option value="">None</option>
              <option value="H">H</option>
              <option value="L">L</option>
            </select>
          </Field>
          <Field label="Collected on" error={err("collectedOn")}>
            <input type="date" className={inputCls} value={f.collectedOn} max={today} onChange={(e) => set("collectedOn", e.target.value)} />
          </Field>
          <Field label="Lab name" error={err("lab")}>
            <input className={inputCls} value={f.lab} onChange={(e) => set("lab", e.target.value)} />
          </Field>
        </div>
        <div className="flex gap-2 justify-end pt-1">
          <button type="button" onClick={onClose} className="h-11 px-4 rounded-full text-text-secondary hover:bg-surface-alt text-[14px]">
            Cancel
          </button>
          <button type="submit" className="h-11 px-5 rounded-full bg-accent-fill text-white font-semibold text-[14px] hover:bg-accent-pressed">
            Save result
          </button>
        </div>
      </form>
    </Card>
  );
}
