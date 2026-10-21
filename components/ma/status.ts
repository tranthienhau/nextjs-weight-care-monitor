"use client";

import { DEMO_TODAY, medications } from "@/lib/data";
import { useApp } from "@/lib/store";
import type { BpReading, CheckIn, LabResult, Measurement, Patient, ReviewStatus, Staff } from "@/lib/types";

/** Demo day as "YYYY-MM-DD". */
export const TODAY = DEMO_TODAY.slice(0, 10);

/** Date-only arithmetic in UTC so the result never shifts with the viewer's timezone. */
export const addDays = (isoDate: string, n: number) => {
  const t = new Date(isoDate.slice(0, 10) + "T00:00:00Z").getTime() + n * 864e5;
  return new Date(t).toISOString().slice(0, 10);
};

export interface ReviewItems {
  measurements: Measurement[];
  bpReadings: BpReading[];
  labResults: LabResult[];
  checkIns: CheckIn[];
}

/** Everything that carries a review status, read live from the store. */
export function useReviewItems(): ReviewItems {
  const measurements = useApp((s) => s.measurements);
  const bpReadings = useApp((s) => s.bpReadings);
  const labResults = useApp((s) => s.labResults);
  const checkIns = useApp((s) => s.checkIns);
  return { measurements, bpReadings, labResults, checkIns };
}

const statusesFor = (patientId: string, s: ReviewItems): ReviewStatus[] =>
  [...s.measurements, ...s.bpReadings, ...s.labResults, ...s.checkIns].filter((x) => x.patientId === patientId).map((x) => x.reviewStatus);

export type PendingStatus = Exclude<ReviewStatus, "reviewed">;

/**
 * The patient's open review state, from the MA point of view:
 * flagged first, then unreviewed (MA still has to send it), then ready (waiting on the MD).
 */
export function pendingStatus(patientId: string, s: ReviewItems): PendingStatus | null {
  const all = statusesFor(patientId, s);
  for (const st of ["flagged", "unreviewed", "ready"] as const) if (all.includes(st)) return st;
  return null;
}

/** True when anything for this patient is waiting on the physician. */
export const awaitingMd = (patientId: string, s: ReviewItems) => statusesFor(patientId, s).some((st) => st === "ready" || st === "flagged");

export const checkInOverdue = (p: Patient) => !!p.checkInDue && p.checkInDue < TODAY;

export type Tone = "neutral" | "success" | "warning" | "accent" | "muted";

/** Status chip shown on patient rows. */
export function patientChip(p: Patient, s: ReviewItems): { label: string; tone: Tone } {
  if (p.status === "discharged") return { label: "Discharged", tone: "muted" };
  if (p.status === "inactive") return { label: "Inactive", tone: "muted" };
  const pending = pendingStatus(p.id, s);
  if (pending === "flagged") return { label: "Flagged for review", tone: "warning" };
  if (pending === "unreviewed") return { label: "Unreviewed", tone: "warning" };
  if (pending === "ready") return { label: "Ready for MD review", tone: "accent" };
  if (checkInOverdue(p)) return { label: "Check-in overdue", tone: "warning" };
  if (p.status === "new") return { label: p.nextVisit ? `New - intake ${shortDay(p.nextVisit.at)}` : "New", tone: "accent" };
  return { label: "Active", tone: "success" };
}

export const patientStatusLabel: Record<Patient["status"], { label: string; tone: Tone }> = {
  active: { label: "Active", tone: "success" },
  new: { label: "New", tone: "accent" },
  inactive: { label: "Inactive", tone: "muted" },
  discharged: { label: "Discharged", tone: "muted" },
};

const shortDay = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });

/** Current clinician-authorized treatment plan entry, if any. */
export const currentPlan = (patientId: string) => medications.find((m) => m.patientId === patientId && m.kind === "plan" && m.status === "current");

/** "Jordan Lee, MA" / "Dr. Elena Marsh, MD" / "Tom Becker". */
export const staffLabel = (st: Staff | undefined) => (!st ? "" : st.role === "physician" ? `${st.name}, MD` : st.role === "ma" ? `${st.name}, MA` : st.name);

/** "Jordan" for most staff, "Dr. Marsh" for physicians. */
export const greetingName = (st: Staff | undefined) => (!st ? "" : st.role === "physician" ? st.shortName : st.name.split(" ")[0]);
