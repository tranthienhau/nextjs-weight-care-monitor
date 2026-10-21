import { fmtDay, fmtDayTime, fmtVal, signed } from "@/lib/format";
import { whoName } from "@/lib/selectors";
import type { ReviewStatus } from "@/lib/types";
import { checkInSummary, type QueueSource } from "./queue";

export interface ReviewItem {
  id: string;
  /** label stored on the signed review */
  label: string;
  title: string;
  sub: string;
  status: ReviewStatus;
  /** store record ids covered by this item (a visit groups several measurements) */
  recordIds: string[];
  /** extra chip, e.g. weight change */
  extra?: { text: string; tone: "success" | "warning" | "neutral" };
}

const pending = (s: ReviewStatus) => s !== "reviewed";

/** Every ready / flagged / unreviewed item for one patient, flagged first. */
export function reviewItems(patientId: string, src: QueueSource): ReviewItem[] {
  const items: ReviewItem[] = [];

  for (const b of src.bpReadings.filter((x) => x.patientId === patientId && pending(x.reviewStatus))) {
    items.push({
      id: b.id,
      recordIds: [b.id],
      label: `BP ${fmtDay(b.measuredAt)}`,
      title: `BP ${b.systolic}/${b.diastolic} mmHg`,
      sub: `${fmtDayTime(b.measuredAt)} - ${b.source} - entered by ${whoName(b.enteredBy, src.staff)}`,
      status: b.flagged ? "flagged" : b.reviewStatus,
    });
  }

  // Measurements are grouped by visit: one item per measuredAt.
  const ms = src.measurements.filter((m) => m.patientId === patientId && pending(m.reviewStatus));
  const visits = [...new Set(ms.map((m) => m.measuredAt))].sort();
  const allWeights = src.measurements.filter((m) => m.patientId === patientId && m.type === "weight").sort((a, b) => a.measuredAt.localeCompare(b.measuredAt));
  for (const at of visits) {
    const group = ms.filter((m) => m.measuredAt === at);
    const w = group.find((m) => m.type === "weight");
    const bf = group.find((m) => m.type === "bodyFat");
    const idx = w ? allWeights.findIndex((x) => x.id === w.id) : -1;
    const prev = idx > 0 ? allWeights[idx - 1] : undefined;
    const delta = w?.value != null && prev?.value != null ? Math.round((w.value - prev.value) * 10) / 10 : null;
    const first = group[0];
    items.push({
      id: `visit-${at}`,
      recordIds: group.map((m) => m.id),
      label: `${w ? "Weight" : "Measurements"} ${fmtDay(at)}`,
      title: w ? `Weight ${fmtVal(w.value, "lb")}` : `${group.length} measurements`,
      sub: [first.source.split(" - ")[0], fmtDay(at), bf ? `${fmtVal(bf.value, "%")} body fat (Estimate)` : null, first.patientReported ? "Patient-reported" : null]
        .filter(Boolean)
        .join(" - "),
      status: group.some((m) => m.reviewStatus === "flagged") ? "flagged" : group.some((m) => m.reviewStatus === "ready") ? "ready" : "unreviewed",
      extra: delta == null ? undefined : { text: `${signed(delta)} lb`, tone: delta <= 0 ? "success" : "warning" },
    });
  }

  for (const l of src.labResults.filter((x) => x.patientId === patientId && pending(x.reviewStatus))) {
    items.push({
      id: l.id,
      recordIds: [l.id],
      label: `Labs ${fmtDay(l.collectedOn)}: ${l.test}`,
      title: `${l.test} ${fmtVal(l.value, l.unit)}`,
      sub: `Collected ${fmtDay(l.collectedOn)} - ${l.lab} - ref ${l.refRange}${l.flag ? ` (lab flag ${l.flag})` : ""}`,
      status: l.reviewStatus,
    });
  }

  for (const c of src.checkIns.filter((x) => x.patientId === patientId && pending(x.reviewStatus))) {
    const month = new Date(c.month + "-15T12:00:00").toLocaleDateString("en-US", { month: "short" });
    items.push({
      id: c.id,
      recordIds: [c.id],
      label: `Check-in ${month}`,
      title: "Monthly check-in",
      sub: `${fmtDay(c.submittedAt)} - ${checkInSummary(c)}${c.comment ? ` - "${c.comment}"` : ""}`,
      status: c.reviewStatus,
    });
  }

  return items.sort((a, b) => Number(b.status === "flagged") - Number(a.status === "flagged"));
}
