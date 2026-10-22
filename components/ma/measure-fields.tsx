"use client";

import clsx from "clsx";
import { EstimateTag, Icon } from "@/components/ui";

export const SOURCES = [
  { source: "Hume Body Pod - Clinic Room 2", title: "Hume Body Pod", sub: "Clinic Room 2", icon: "accessibility_new", patient: false },
  { source: "Clinic scale - Seca 703", title: "Clinic scale", sub: "Seca 703", icon: "scale", patient: false },
  { source: "Patient home scale - reported by patient", title: "Patient home scale", sub: "Reported by patient", icon: "home", patient: true },
] as const;

export type SourceOption = (typeof SOURCES)[number];

export function SourcePicker({ value, onChange }: { value: string; onChange: (s: SourceOption) => void }) {
  return (
    <fieldset aria-labelledby="source-label" className="bg-surface rounded-[20px] p-4 shadow-soft-card border border-border/60">
      <div className="flex items-center justify-between mb-3">
        <h2 id="source-label" className="text-label-md font-semibold text-text-primary">Measurement source</h2>
        <span className="text-[12px] text-text-tertiary tracking-wide uppercase font-semibold">Measured on</span>
      </div>
      <div className="space-y-2.5">
        {SOURCES.map((o) => {
          const on = o.source === value;
          return (
            <label
              key={o.source}
              className={clsx(
                "flex items-center justify-between p-3 rounded-xl cursor-pointer transition min-h-11",
                on ? "bg-accent-tint/70 border-[1.5px] border-accent-fill" : "bg-surface border border-border hover:bg-surface-alt/50",
                o.patient && !on && "border-dashed",
              )}
            >
              <span className="flex items-center gap-3">
                <input type="radio" name="source" className="sr-only" checked={on} onChange={() => onChange(o)} />
                <span className={clsx("w-5 h-5 rounded-full grid place-items-center bg-surface", on ? "border-2 border-accent-fill" : "border border-outline-variant")}>
                  {on && <span className="w-2.5 h-2.5 rounded-full bg-accent-fill" />}
                </span>
                <span>
                  <span className={clsx("block text-[14px] text-text-primary", on ? "font-semibold" : "font-medium")}>{o.title}</span>
                  <span className={clsx("block text-[12px]", on ? "text-text-secondary" : "text-text-tertiary")}>{o.sub}</span>
                </span>
              </span>
              <Icon name={o.icon} size={18} className={on ? "text-accent-fill" : "text-text-tertiary"} />
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

/** Small right-aligned numeric input row used for body composition values. */
export function CompRow({
  id,
  label,
  unit,
  value,
  onChange,
  error,
  estimate = true,
}: {
  id: string;
  label: string;
  unit: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  estimate?: boolean;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <label htmlFor={id} className="text-label-md font-medium text-text-primary">
            {label}
          </label>
          {estimate && <EstimateTag />}
        </div>
        <div className="w-32 relative flex items-center">
          <input
            id={id}
            inputMode="decimal"
            value={value}
            placeholder="Not measured"
            aria-invalid={!!error}
            onChange={(e) => onChange(e.target.value.replace(/[^0-9.]/g, ""))}
            className={clsx(
              "w-full h-11 bg-surface rounded-xl border text-right pr-9 pl-3 text-[15px] font-semibold text-text-primary placeholder:text-[12px] placeholder:font-normal placeholder:text-text-tertiary outline-none focus:border-accent-fill focus:ring-2 focus:ring-accent/30",
              error ? "border-danger" : "border-border",
            )}
          />
          <span className="absolute right-3 text-[13px] text-text-tertiary pointer-events-none">{unit}</span>
        </div>
      </div>
      {error && <p className="text-[12px] text-danger mt-1 text-right">{error}</p>}
    </div>
  );
}

export function UnitToggle({ unit, onChange }: { unit: "lb" | "kg"; onChange: (u: "lb" | "kg") => void }) {
  return (
    <div className="bg-surface-alt p-0.5 rounded-full flex items-center border border-border/80" role="group" aria-label="Weight unit">
      {(["lb", "kg"] as const).map((u) => (
        <button
          key={u}
          type="button"
          aria-pressed={unit === u}
          onClick={() => onChange(u)}
          className={clsx("min-w-11 h-9 px-3.5 rounded-full text-[13px] transition", unit === u ? "bg-accent-fill text-white font-semibold" : "text-text-secondary font-medium hover:text-text-primary")}
        >
          {u}
        </button>
      ))}
    </div>
  );
}
