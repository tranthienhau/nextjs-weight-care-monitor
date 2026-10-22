"use client";

import { useState, type ReactNode } from "react";
import { useApp } from "@/lib/store";
import { fmtDay, fmtTime, fmtVal } from "@/lib/format";
import { whoName } from "@/lib/selectors";
import type { EditEntry, Measurement } from "@/lib/types";
import { Card, Field, Icon, ReviewBadge, SourceTag, UnitInput, inputCls } from "@/components/ui";
import { useCurrentUser } from "@/components/shell";
import { can } from "./PatientTabs";

const shortSource = (s: string) => s.split(" - ")[0];

function AuditBox({ history, unit }: { history: EditEntry[]; unit: string }) {
  const staff = useApp((s) => s.staff);
  return (
    <div className="mt-2.5 space-y-2">
      {history.map((h) => (
        <div key={h.at} className="p-2.5 bg-surface-alt rounded-xl border border-border/80 flex items-start gap-2">
          <Icon name="history" size={16} className="text-text-tertiary mt-0.5" />
          <p className="text-[12px] text-text-secondary leading-snug">
            <span className="font-medium text-text-primary">
              Corrected {h.from ?? "Not measured"} to {fmtVal(h.to, unit)}
            </span>{" "}
            by <span className="font-medium">{whoName(h.by, staff)}</span>, {fmtDay(h.at)} {fmtTime(h.at)}.
            <span className="block text-text-tertiary mt-0.5 italic">Reason: {h.reason}.</span>
          </p>
        </div>
      ))}
    </div>
  );
}

function CorrectionForm({ m, onCancel, onSaved }: { m: Measurement; onCancel: () => void; onSaved: () => void }) {
  const { userId } = useCurrentUser();
  const correct = useApp((s) => s.correctMeasurement);
  const [value, setValue] = useState(m.value?.toString() ?? "");
  const [reason, setReason] = useState("");
  const [tried, setTried] = useState(false);
  const num = Number(value);
  const valueOk = value !== "" && Number.isFinite(num) && num > 0;
  const reasonOk = reason.trim().length > 0;

  const save = () => {
    setTried(true);
    if (!valueOk || !reasonOk || !userId) return;
    correct(m.id, Math.round(num * 10) / 10, reason.trim(), userId);
    onSaved();
  };

  return (
    <div className="mt-3 p-3 rounded-xl border border-accent-tint bg-accent-tint/30 space-y-3">
      <p className="text-[12px] text-text-secondary">Corrections keep the original value in the audit history.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Corrected value" error={tried && !valueOk ? "Enter a value" : undefined}>
          <UnitInput value={value} onChange={setValue} unit={m.unit} invalid={tried && !valueOk} />
        </Field>
        <Field label="Reason (required)" error={tried && !reasonOk ? "A reason is required" : undefined}>
          <input className={inputCls} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Transcription error" />
        </Field>
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="h-11 px-4 rounded-full text-text-secondary hover:bg-surface-alt text-[14px]">
          Cancel
        </button>
        <button type="button" onClick={save} className="h-11 px-5 rounded-full bg-accent-fill text-white font-semibold text-[14px] hover:bg-accent-pressed">
          Save correction
        </button>
      </div>
    </div>
  );
}

function EntryRow({ m, bodyFat }: { m: Measurement; bodyFat?: Measurement }) {
  const staff = useApp((s) => s.staff);
  const { role } = useCurrentUser();
  const [open, setOpen] = useState(m.history.length > 0);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const edited = m.history.length > 0;

  return (
    <li className="py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[13px] font-semibold">{fmtDay(m.measuredAt)}</span>
            <span className="text-[15px] font-bold tracking-tight">{fmtVal(m.value, m.unit)}</span>
            {edited && (
              <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-expanded={open}
                className="bg-warning-tint text-warning border border-warning/30 text-[12px] font-semibold px-2 h-6 rounded-full inline-flex items-center gap-0.5"
              >
                <Icon name="edit" size={12} />
                Edited
                <Icon name={open ? "expand_less" : "expand_more"} size={14} />
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            <SourceTag patient={m.patientReported}>{shortSource(m.source)}</SourceTag>
            <SourceTag>{whoName(m.enteredBy, staff)}</SourceTag>
            <ReviewBadge status={m.reviewStatus} by={whoName(m.reviewedBy, staff)} on={m.reviewedAt ? fmtDay(m.reviewedAt) : undefined} short />
          </div>
        </div>
        <div className="text-right shrink-0 flex flex-col items-end gap-1">
          <span className="text-[13px] text-text-secondary">{bodyFat ? `${fmtVal(bodyFat.value, "%")} BF` : ""}</span>
          {bodyFat?.value != null && <span className="text-[12px] text-text-tertiary">Estimate</span>}
          {can(role, "enterMeasurements") && !editing && (
            <button
              type="button"
              onClick={() => {
                setEditing(true);
                setSaved(false);
              }}
              className="h-9 px-3 -mr-2 rounded-full text-accent-fill text-[13px] font-semibold hover:bg-accent-tint inline-flex items-center gap-1"
              aria-label={`Edit weight entry from ${fmtDay(m.measuredAt)}`}
            >
              <Icon name="edit" size={16} />
              Edit
            </button>
          )}
        </div>
      </div>
      {editing && (
        <CorrectionForm
          m={m}
          onCancel={() => setEditing(false)}
          onSaved={() => {
            setEditing(false);
            setSaved(true);
            setOpen(true);
          }}
        />
      )}
      {saved && <p className="text-[12px] text-success mt-2">Correction saved and audit logged.</p>}
      {edited && open && <AuditBox history={m.history} unit={m.unit} />}
    </li>
  );
}

export function BodyEntries({ weights, bodyFat, exportSlot }: { weights: Measurement[]; bodyFat: Measurement[]; exportSlot: ReactNode }) {
  const rows = [...weights].reverse();
  return (
    <Card className="p-4 lg:p-5">
      <div className="flex items-start justify-between gap-2 pb-3 border-b border-border/50">
        <div className="flex items-center gap-1.5 pt-1.5">
          <h2 className="text-[16px] font-semibold">Entries</h2>
          <span className="text-caption-sm text-text-tertiary">({rows.length})</span>
        </div>
        {exportSlot}
      </div>
      {rows.length ? (
        <ul className="divide-y divide-border/40">
          {rows.map((m) => (
            <EntryRow key={m.id} m={m} bodyFat={bodyFat.find((b) => b.measuredAt === m.measuredAt)} />
          ))}
        </ul>
      ) : (
        <p className="py-6 text-center text-text-tertiary">No entries in this range</p>
      )}
    </Card>
  );
}
