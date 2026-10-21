import { DEMO_TODAY, medications, patients } from "@/lib/data";
import { fmtDay, fmtVal } from "@/lib/format";
import { whoName } from "@/lib/selectors";
import type { BpReading, CheckIn, LabResult, Measurement, Patient, ReviewStatus, Staff } from "@/lib/types";

export type QueueKind = "bp" | "labs" | "checkin" | "measurement";

export interface QueueCard {
  patient: Patient;
  kinds: QueueKind[];
  flagged: boolean;
  /** headline reason (shown in the reason box) */
  reason: { kind: QueueKind; text: string; strong: string };
  /** other pending reasons, short form */
  more: string[];
  oldest: string;
  itemCount: number;
}

export interface QueueSource {
  measurements: Measurement[];
  bpReadings: BpReading[];
  labResults: LabResult[];
  checkIns: CheckIn[];
  staff: Staff[];
}

const waiting = (s: ReviewStatus) => s === "ready" || s === "flagged";

export const planMed = (patientId: string) => {
  const m = medications.find((x) => x.patientId === patientId && x.kind === "plan" && x.status === "current");
  return m ? `${m.name} ${m.dose}` : "No current plan medication";
};

/** Short plain-language summary of a check-in, built from its answers and comment. */
export function checkInSummary(ci: CheckIn) {
  const answer = (q: string) => ci.answers.find((a) => a.questionId === q)?.answer;
  const parts: string[] = [];
  if (ci.wantsContact || answer("q8") === "Yes") parts.push("asks to be contacted");
  const side = answer("q2");
  if (side && side !== "No") parts.push(/nausea/i.test(ci.comment ?? "") ? "reports nausea" : "reports side effects");
  if (answer("q7") === "Yes" && !parts.includes("asks to be contacted")) parts.push("has a question for the care team");
  if (!parts.length) parts.push("no concerns reported");
  return parts.join(", ");
}

export function buildQueue(src: QueueSource): QueueCard[] {
  const cards: QueueCard[] = [];
  for (const p of patients) {
    const ms = src.measurements.filter((m) => m.patientId === p.id && waiting(m.reviewStatus));
    const bps = src.bpReadings.filter((b) => b.patientId === p.id && waiting(b.reviewStatus));
    const labs = src.labResults.filter((l) => l.patientId === p.id && waiting(l.reviewStatus));
    const cis = src.checkIns.filter((c) => c.patientId === p.id && waiting(c.reviewStatus));
    if (!ms.length && !bps.length && !labs.length && !cis.length) continue;

    const flaggedBp = bps.find((b) => b.reviewStatus === "flagged" || b.flagged);
    const readyBp = bps.find((b) => b !== flaggedBp);
    const reasons: QueueCard["reason"][] = [];
    if (flaggedBp)
      reasons.push({ kind: "bp", strong: `BP ${flaggedBp.systolic}/${flaggedBp.diastolic} flagged`, text: ` - entered by ${whoName(flaggedBp.enteredBy, src.staff)}` });
    if (cis.length) reasons.push({ kind: "checkin", strong: "Check-in:", text: ` ${checkInSummary(cis[cis.length - 1])}` });
    if (labs.length)
      reasons.push({
        kind: "labs",
        strong: `New labs: ${labs.map((l) => `${l.test} ${fmtVal(l.value, l.unit)}`).join(", ")}`,
        text: ` (entered ${fmtDay(labs[0].resultOn)})`,
      });
    if (readyBp) reasons.push({ kind: "bp", strong: `BP ${readyBp.systolic}/${readyBp.diastolic}`, text: ` ready for review - entered by ${whoName(readyBp.enteredBy, src.staff)}` });
    if (ms.length) reasons.push({ kind: "measurement", strong: ms.some((m) => m.type === "weight") ? "Weight entries" : "Measurements", text: " ready for review" });

    const dates = [
      ...ms.map((m) => m.measuredAt),
      ...bps.map((b) => b.measuredAt),
      ...labs.map((l) => l.resultOn),
      ...cis.map((c) => c.submittedAt),
    ].sort();
    const kinds = [...new Set(reasons.map((r) => r.kind))];
    cards.push({
      patient: p,
      kinds,
      flagged: !!flaggedBp,
      reason: reasons[0],
      more: reasons.slice(1).map((r) => (r.strong + r.text).replace(/ - entered by .*/, "").replace(/ \(entered .*\)/, "")),
      oldest: dates[0],
      itemCount: ms.length + bps.length + labs.length + cis.length,
    });
  }
  return cards.sort((a, b) => Number(b.flagged) - Number(a.flagged) || a.oldest.localeCompare(b.oldest));
}

export const daysSince = (iso: string) => {
  const ms = new Date(DEMO_TODAY).getTime() - new Date(iso.length === 10 ? iso + "T12:00:00" : iso).getTime();
  return Math.max(0, Math.floor(ms / 864e5));
};
