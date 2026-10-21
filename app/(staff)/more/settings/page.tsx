"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import type { Settings } from "@/lib/types";
import { roleChip, useCurrentUser } from "@/components/shell";
import { Button, Card, Field, Icon, PageHeader, Toggle, UnitInput } from "@/components/ui";
import { BackLink, Confirmation, Note } from "@/components/admin/common";

const VISIBILITY: { key: keyof Settings["patientVisible"]; label: string; sub: string }[] = [
  { key: "bodyFat", label: "Body fat", sub: "Shown to patients with the Estimate tag" },
  { key: "muscleMass", label: "Muscle mass", sub: "Shown to patients with the Estimate tag" },
  { key: "labs", label: "Lab results", sub: "Only after physician review" },
];

export default function SettingsPage() {
  const { userId, role, staff: me } = useCurrentUser();
  const settings = useApp((s) => s.settings);
  const updateSettings = useApp((s) => s.updateSettings);
  const canEdit = role === "physician";

  const [sys, setSys] = useState(String(settings.bpRule.systolicGte));
  const [dia, setDia] = useState(String(settings.bpRule.diastolicGte));
  const [visible, setVisible] = useState(settings.patientVisible);
  const [saved, setSaved] = useState(false);

  const s = Number(sys);
  const d = Number(dia);
  const sysErr = !sys || s < 100 || s > 200 ? "Enter 100 to 200" : undefined;
  const diaErr = !dia || d < 60 || d > 130 ? "Enter 60 to 130" : undefined;

  const save = () => {
    if (!canEdit || !userId || sysErr || diaErr) return;
    updateSettings({ bpRule: { systolicGte: s, diastolicGte: d }, patientVisible: visible }, userId);
    setSaved(true);
  };
  const edit = <T,>(fn: (v: T) => void) => (v: T) => {
    setSaved(false);
    fn(v);
  };

  return (
    <div className="flex flex-col gap-4">
      <BackLink />
      <PageHeader title="Review rules" caption="Practice settings" avatar={me?.avatar} role={roleChip(role)} />
      {!canEdit && <Note>Read-only. Review rules and patient visibility are set by the physician.</Note>}

      <div className="lg:grid lg:grid-cols-2 lg:gap-6 lg:items-start space-y-4 lg:space-y-0">
        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Icon name="monitor_heart" className="text-accent-fill" />
            <h2 className="text-title-md font-semibold">Blood pressure review rule</h2>
          </div>
          <p className="text-caption-sm text-text-secondary">A reading is flagged for physician review when either value is at or above:</p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Systolic at or above" error={canEdit ? sysErr : undefined}>
              <UnitInput value={sys} onChange={edit(setSys)} unit="mmHg" disabled={!canEdit} invalid={canEdit && !!sysErr} />
            </Field>
            <Field label="Diastolic at or above" error={canEdit ? diaErr : undefined}>
              <UnitInput value={dia} onChange={edit(setDia)} unit="mmHg" disabled={!canEdit} invalid={canEdit && !!diaErr} />
            </Field>
          </div>
          <p className="flex items-start gap-2 rounded-xl bg-accent-tint/60 p-3 text-caption-sm text-text-secondary">
            <Icon name="info" size={18} className="text-accent-fill shrink-0" />
            Rules are set by the physician. A flag means please review, not a diagnosis.
          </p>
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-1">
              <Icon name="visibility" className="text-accent-fill" />
              <h2 className="text-title-md font-semibold">Patient portal visibility</h2>
            </div>
            <p className="text-caption-sm text-text-secondary mb-2">Choose which values patients can see in their portal.</p>
            <ul className="divide-y divide-border">
              {VISIBILITY.map((v) => (
                <li key={v.key} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <p className="text-[15px] font-medium">{v.label}</p>
                    <p className="text-caption-sm text-text-tertiary">{v.sub}</p>
                  </div>
                  <span className={canEdit ? "" : "pointer-events-none opacity-60"}>
                    <Toggle on={visible[v.key]} label={`Show ${v.label.toLowerCase()} to patients`} onChange={edit((on: boolean) => setVisible({ ...visible, [v.key]: on }))} />
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Icon name="schedule" className="text-accent-fill" />
              <div>
                <p className="text-[15px] font-medium">Practice time zone</p>
                <p className="text-caption-sm text-text-tertiary">All timestamps use this zone</p>
              </div>
            </div>
            <span className="text-label-md text-text-primary">{settings.timezone.replace("_", " ")}</span>
          </Card>

          {saved && <Confirmation>Settings saved and recorded in the audit log.</Confirmation>}
          {canEdit && (
            <Button full icon="save" onClick={save} disabled={!!sysErr || !!diaErr}>
              Save settings
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
