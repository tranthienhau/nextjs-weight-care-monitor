"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import { patients, permissionMatrix } from "@/lib/data";
import { downloadText, toCsv } from "@/lib/format";
import { whoName } from "@/lib/selectors";
import type { Role } from "@/lib/types";
import { Button, Card, Icon, inputCls } from "@/components/ui";
import { Confirmation } from "./common";

type Dataset = "Measurements" | "Check-ins" | "Patients";
const RANGE = { from: "2026-10-01", to: "2026-10-31" };
const inRange = (iso: string) => iso.slice(0, 10) >= RANGE.from && iso.slice(0, 10) <= RANGE.to;

export function ExportCard({ userId, role }: { userId: string; role: Role | null }) {
  const measurements = useApp((s) => s.measurements);
  const checkIns = useApp((s) => s.checkIns);
  const staff = useApp((s) => s.staff);
  const recordExport = useApp((s) => s.recordExport);
  const log = useApp((s) => s.log);
  const [dataset, setDataset] = useState<Dataset>(role === "admin" ? "Patients" : "Measurements");
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  const row = permissionMatrix.find((r) => r.key === "export");
  const allowed = !!row && role !== null && role !== "patient" && row[role];
  /** Admin access does not include clinical records: admins export admin fields only. */
  const clinicalBlocked = role === "admin" && dataset !== "Patients";

  const rows = (): Record<string, string | number | null>[] => {
    if (dataset === "Patients")
      return patients.map((p) => ({ mrn: p.mrn, name: p.name, status: p.status, membership: p.membership, enrolled_on: p.enrolledOn, program_week: p.programWeek, consent: p.consent }));
    if (dataset === "Check-ins")
      return checkIns
        .filter((c) => inRange(c.submittedAt))
        .map((c) => ({ patient_id: c.patientId, month: c.month, submitted_at: c.submittedAt, wants_contact: c.wantsContact ? "yes" : "no", review_status: c.reviewStatus }));
    return measurements
      .filter((m) => inRange(m.measuredAt))
      .map((m) => ({ patient_id: m.patientId, type: m.type, value: m.value ?? "Not measured", unit: m.unit, measured_at: m.measuredAt, source: m.source, entered_by: whoName(m.enteredBy, staff), estimate: m.isEstimate ? "yes" : "no", review_status: m.reviewStatus }));
  };

  const exportCsv = () => {
    if (!allowed || clinicalBlocked) {
      log({ by: userId, action: "access", target: `Export - ${dataset}`, detail: "Export blocked, role lacks permission" });
      setResult({ ok: false, text: clinicalBlocked ? "Admin exports are limited to admin fields. Choose the Patients dataset." : "Your role cannot export data. Ask a physician or practice admin." });
      return;
    }
    const data = rows();
    downloadText(`steadfast-${dataset.toLowerCase()}-oct-2026.csv`, toCsv(data));
    recordExport(userId, dataset, data.length);
    setResult({ ok: true, text: `Exported ${data.length} rows. Logged in the audit trail.` });
  };

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-surface-alt text-accent-fill">
            <Icon name="database" size={20} />
          </span>
          <h2 className="text-[16px] font-semibold">Export clinic data</h2>
        </div>
        <span className="text-caption-sm text-text-tertiary">Audit logged</span>
      </div>

      <label className="block">
        <span className="block text-caption-sm text-text-secondary mb-1.5">Selected dataset</span>
        <select
          className={inputCls}
          value={dataset}
          onChange={(e) => {
            setDataset(e.target.value as Dataset);
            setResult(null);
          }}
        >
          <option value="Measurements">Dataset: Measurements</option>
          <option value="Check-ins">Dataset: Check-ins</option>
          <option value="Patients">Dataset: Patients (admin fields only)</option>
        </select>
      </label>

      <div className="flex items-center justify-between">
        <span className="text-caption-sm text-text-secondary">Format</span>
        <span className="px-3.5 py-1.5 rounded-full text-caption-sm font-medium bg-accent-tint text-accent-fill border border-accent-fill">CSV</span>
      </div>
      <div className="flex items-center justify-between bg-surface-alt px-3.5 py-2.5 rounded-xl border border-border text-caption-sm">
        <span className="flex items-center gap-2 text-text-secondary">
          <Icon name="calendar_today" size={18} className="text-text-tertiary" />
          Date range
        </span>
        <span className="font-medium text-text-primary">Oct 1 - Oct 31, 2026</span>
      </div>

      <p className="flex items-start gap-2 text-text-tertiary text-caption-sm">
        <Icon name="lock" size={16} className="mt-0.5" />
        Exports are permission-checked and logged in the audit trail.
      </p>

      {!allowed && (
        <p className="flex items-start gap-2 rounded-xl bg-warning-tint text-[#92400E] p-3 text-caption-sm">
          <Icon name="block" size={16} className="mt-0.5" />
          Your role ({role === "ma" ? "Medical assistant" : role}) does not have export permission.
        </p>
      )}
      {result && (result.ok ? <Confirmation>{result.text}</Confirmation> : <p role="alert" className="rounded-xl bg-danger-tint text-danger p-3 text-caption-sm">{result.text}</p>)}

      <Button full icon="download" onClick={exportCsv}>
        Export CSV
      </Button>
    </Card>
  );
}
