import { patients, staff as seedStaff, PRACTICE_NAME } from "./data";
import type { BpReading, LabResult, Measurement, MeasurementType, Patient, ReviewStatus, Role, Staff } from "./types";

export { PRACTICE_NAME };

export const getPatient = (id: string): Patient | undefined => patients.find((p) => p.id === id);
export const getStaff = (id: string, list: Staff[] = seedStaff): Staff | undefined => list.find((s) => s.id === id);

/** Display name for "entered by" / "reviewed by" ids, including "patient" and "system". */
export const whoName = (id: string | undefined, list: Staff[] = seedStaff): string => {
  if (!id) return "";
  if (id === "patient") return "Patient-reported";
  if (id === "system") return "Automated";
  if (id.startsWith("p-")) return getPatient(id)?.name ?? "Patient";
  return getStaff(id, list)?.shortName ?? id;
};

export const roleOf = (userId: string | null): Role | null => {
  if (!userId) return null;
  if (userId.startsWith("p-")) return "patient";
  return getStaff(userId)?.role ?? null;
};

export const byTimeAsc = <T extends { measuredAt: string }>(a: T, b: T) => a.measuredAt.localeCompare(b.measuredAt);

export const seriesFor = (all: Measurement[], patientId: string, type: MeasurementType) =>
  all.filter((m) => m.patientId === patientId && m.type === type).sort(byTimeAsc);

export const latest = (all: Measurement[], patientId: string, type: MeasurementType): Measurement | undefined => {
  const s = seriesFor(all, patientId, type);
  return s[s.length - 1];
};

export const bpFor = (all: BpReading[], patientId: string) => all.filter((b) => b.patientId === patientId).sort(byTimeAsc);

export const labsFor = (all: LabResult[], patientId: string) =>
  all.filter((l) => l.patientId === patientId).sort((a, b) => b.collectedOn.localeCompare(a.collectedOn));

/** Weight change since enrollment (negative = loss). */
export const weightChange = (all: Measurement[], p: Patient) => {
  const w = latest(all, p.id, "weight");
  if (!w || w.value == null || !p.startWeightLb) return null;
  return Math.round((w.value - p.startWeightLb) * 10) / 10;
};

export const statusLabel: Record<ReviewStatus, string> = {
  unreviewed: "Unreviewed",
  ready: "Ready for MD review",
  flagged: "Flagged - awaiting clinician review",
  reviewed: "Reviewed",
};

/** Items awaiting physician review, per patient (what the review queue shows). */
export interface QueueEntry {
  patient: Patient;
  reasons: string[];
  kind: "bp" | "labs" | "checkin" | "measurement";
  flagged: boolean;
  oldest: string;
}
