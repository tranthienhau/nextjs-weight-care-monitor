import type {
  Adherence,
  AuditEvent,
  BpReading,
  CheckIn,
  CheckInQuestion,
  ClinicalReview,
  LabResult,
  Measurement,
  Medication,
  Message,
  Patient,
  PermissionRow,
  Settings,
  Staff,
  Task,
} from "./types";

/** Fixed demo "today" so every screen tells the same story. */
export const DEMO_TODAY = "2026-10-22T09:00:00";
export const PRACTICE_NAME = "Northside Metabolic Health";

const img = (n: string) => `/images/${n}.jpg`;

/** Local wall-clock ISO string without a zone ("2026-10-22T09:30:00"), matching how dates are displayed. */
export const localIso = (d: Date) => {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
};

export const staff: Staff[] = [
  { id: "s-marsh", name: "Dr. Elena Marsh", shortName: "Dr. Marsh", role: "physician", title: "Physician, MD", avatar: img("avatar-elena-marsh"), status: "active" },
  { id: "s-lee", name: "Jordan Lee", shortName: "J. Lee, MA", role: "ma", title: "Medical Assistant", avatar: img("avatar-jordan-lee"), status: "active" },
  { id: "s-nair", name: "Priya Nair", shortName: "P. Nair, MA", role: "ma", title: "Medical Assistant", avatar: img("avatar-priya-nair"), status: "active" },
  { id: "s-becker", name: "Tom Becker", shortName: "T. Becker", role: "admin", title: "Practice Admin", avatar: img("avatar-tom-becker"), status: "active" },
  { id: "s-diaz", name: "Rachel Diaz", shortName: "R. Diaz, MA", role: "ma", title: "Medical Assistant", avatar: img("avatar-rachel-diaz"), status: "removed", removedOn: "2026-10-03" },
];

export const patients: Patient[] = [
  { id: "p-alvarez", mrn: "NMH-00412", name: "Maria Alvarez", firstName: "Maria", dob: "1979-03-14", age: 47, avatar: img("avatar-maria-alvarez"), status: "active", membership: "active", programWeek: 18, enrolledOn: "2026-06-18", startWeightLb: 222.0, clinicianId: "s-marsh", maId: "s-lee", consent: "signed", nextVisit: { at: "2026-10-22T09:30:00", kind: "Office visit", note: "Weight + BP due" }, checkInDue: "2026-11-01" },
  { id: "p-brooks", mrn: "NMH-00388", name: "Kevin Brooks", firstName: "Kevin", dob: "1974-08-02", age: 52, avatar: img("avatar-kevin-brooks"), status: "active", membership: "active", programWeek: 24, enrolledOn: "2026-05-07", startWeightLb: 262.4, clinicianId: "s-marsh", maId: "s-lee", consent: "signed", nextVisit: { at: "2026-10-22T10:15:00", kind: "Remote check-in", note: "Check-in review" }, checkInDue: "2026-11-05" },
  { id: "p-patel", mrn: "NMH-00431", name: "Aisha Patel", firstName: "Aisha", dob: "1988-01-23", age: 38, avatar: img("avatar-aisha-patel"), status: "active", membership: "active", programWeek: 12, enrolledOn: "2026-07-30", startWeightLb: 186.0, clinicianId: "s-marsh", maId: "s-nair", consent: "signed", nextVisit: { at: "2026-10-22T11:00:00", kind: "Office visit", note: "Labs to enter (A1c)" }, checkInDue: "2026-11-08" },
  { id: "p-chen", mrn: "NMH-00297", name: "Robert Chen", firstName: "Robert", dob: "1965-11-30", age: 60, avatar: img("avatar-robert-chen"), status: "active", membership: "active", programWeek: 28, enrolledOn: "2026-04-06", startWeightLb: 214.6, clinicianId: "s-marsh", maId: "s-lee", consent: "signed", checkInDue: "2026-10-15" },
  { id: "p-okafor", mrn: "NMH-00356", name: "Linda Okafor", firstName: "Linda", dob: "1972-04-17", age: 54, avatar: img("avatar-linda-okafor"), status: "active", membership: "paused", programWeek: 16, enrolledOn: "2026-07-02", startWeightLb: 199.8, clinicianId: "s-marsh", maId: "s-nair", consent: "signed", checkInDue: "2026-10-12" },
  { id: "p-whitaker", mrn: "NMH-00402", name: "James Whitaker", firstName: "James", dob: "1983-09-09", age: 43, avatar: img("avatar-james-whitaker"), status: "active", membership: "active", programWeek: 20, enrolledOn: "2026-06-04", startWeightLb: 241.2, clinicianId: "s-marsh", maId: "s-lee", consent: "signed", checkInDue: "2026-11-03" },
  { id: "p-romano", mrn: "NMH-00419", name: "Sofia Romano", firstName: "Sofia", dob: "1991-06-28", age: 35, avatar: img("avatar-sofia-romano"), status: "inactive", membership: "ended", programWeek: 14, enrolledOn: "2026-06-25", startWeightLb: 172.4, clinicianId: "s-marsh", maId: "s-nair", consent: "signed", checkInDue: "2026-10-18" },
  { id: "p-kim", mrn: "NMH-00447", name: "Daniel Kim", firstName: "Daniel", dob: "1990-02-11", age: 36, avatar: img("avatar-daniel-kim"), status: "new", membership: "active", programWeek: 0, enrolledOn: "2026-10-20", startWeightLb: 0, clinicianId: "s-marsh", maId: "s-lee", consent: "pending", nextVisit: { at: "2026-10-28T10:00:00", kind: "Intake visit", note: "First measurements" } },
];

const HUME = "Hume Body Pod - Clinic Room 2";
const SCALE = "Clinic scale - Seca 703";

let mid = 0;
const m = (
  patientId: string,
  type: Measurement["type"],
  value: number | null,
  measuredAt: string,
  extra: Partial<Measurement> = {},
): Measurement => ({
  id: `m-${++mid}`,
  patientId,
  type,
  value,
  unit: type === "weight" || type === "muscleMass" || type === "fatFreeMass" ? "lb" : type === "bodyFat" ? "%" : "level",
  measuredAt,
  source: HUME,
  enteredBy: "s-lee",
  patientReported: false,
  isEstimate: type !== "weight",
  reviewStatus: "reviewed",
  reviewedBy: "s-marsh",
  history: [],
  ...extra,
});

/** Maria Alvarez - rich 18-week history, with a missed visit in August and one corrected entry. */
const mariaVisits: { at: string; w: number; bf: number; mm: number; by?: string; edited?: boolean; status?: Measurement["reviewStatus"] }[] = [
  { at: "2026-06-18T09:20:00", w: 222.0, bf: 42.1, mm: 70.2 },
  { at: "2026-07-02T09:10:00", w: 220.4, bf: 41.6, mm: 70.4 },
  { at: "2026-07-16T09:15:00", w: 218.1, bf: 41.0, mm: 70.6, by: "s-nair" },
  { at: "2026-07-30T09:05:00", w: 215.8, bf: 40.5, mm: 70.9 },
  { at: "2026-09-03T09:25:00", w: 209.9, bf: 39.6, mm: 71.0 },
  { at: "2026-09-17T09:12:00", w: 207.2, bf: 39.1, mm: 71.2, edited: true },
  { at: "2026-10-01T09:18:00", w: 205.0, bf: 38.6, mm: 71.3, by: "s-nair" },
  { at: "2026-10-15T09:12:00", w: 203.4, bf: 38.2, mm: 71.4, status: "unreviewed" },
];

const measurementsSeed: Measurement[] = [];
for (const v of mariaVisits) {
  const base = { enteredBy: v.by ?? "s-lee", reviewStatus: v.status ?? "reviewed", reviewedBy: v.status ? undefined : "s-marsh" } as Partial<Measurement>;
  measurementsSeed.push(
    m("p-alvarez", "weight", v.w, v.at, {
      ...base,
      history: v.edited ? [{ at: "2026-09-17T16:12:00", by: "s-lee", from: 207.9, to: 207.2, reason: "Transcription error" }] : [],
    }),
    m("p-alvarez", "bodyFat", v.bf, v.at, base),
    m("p-alvarez", "muscleMass", v.mm, v.at, base),
    m("p-alvarez", "fatFreeMass", Math.round((v.w * (1 - v.bf / 100)) * 10) / 10, v.at, base),
    m("p-alvarez", "visceralFat", null, v.at, base),
  );
}

/** Simple series for the other enrolled patients. */
const series: { id: string; start: string; first: number; steps: number[]; source?: string; lastStatus?: Measurement["reviewStatus"] }[] = [
  { id: "p-brooks", start: "2026-05-07", first: 262.4, steps: [-3.1, -2.8, -2.6, -2.9, -2.2, -2.4, -2.0, -1.8, -2.1, -1.7, -1.9, -1.4], lastStatus: "ready" },
  { id: "p-patel", start: "2026-07-30", first: 186.0, steps: [-2.6, -2.4, -2.0, -1.8, -1.6, -1.4], lastStatus: "ready" },
  { id: "p-chen", start: "2026-04-06", first: 214.6, steps: [-2.4, -2.2, -2.0, -1.8, -1.6, -1.2, -1.0, -0.6, -0.4, -0.2, 0.1, -0.1, -0.1, 0.0], source: SCALE, lastStatus: "ready" },
  { id: "p-okafor", start: "2026-07-02", first: 199.8, steps: [-2.1, -1.9, -1.6, -1.8, -1.5, -1.3], lastStatus: "reviewed" },
  { id: "p-whitaker", start: "2026-06-04", first: 241.2, steps: [-3.0, -2.7, -2.5, -2.2, -2.4, -2.0, -1.9, -1.6, -1.5, -1.3], lastStatus: "reviewed" },
  { id: "p-romano", start: "2026-06-25", first: 172.4, steps: [-1.8, -1.6, -1.5, -1.2, -1.0], lastStatus: "reviewed" },
];
for (const s of series) {
  let w = s.first;
  const d0 = new Date(s.start + "T09:30:00").getTime();
  const all = [0, ...s.steps];
  all.forEach((step, i) => {
    w = Math.round((w + step) * 10) / 10;
    const at = localIso(new Date(d0 + i * 14 * 864e5));
    const last = i === all.length - 1;
    measurementsSeed.push(
      m(s.id, "weight", w, at, {
        source: s.source ?? HUME,
        enteredBy: i % 2 ? "s-nair" : "s-lee",
        reviewStatus: last ? s.lastStatus ?? "reviewed" : "reviewed",
        reviewedBy: last && s.lastStatus !== "reviewed" ? undefined : "s-marsh",
        isEstimate: false,
      }),
    );
  });
}

export const measurements = measurementsSeed;

export const bpReadings: BpReading[] = [
  { id: "bp-1", patientId: "p-alvarez", systolic: 134, diastolic: 86, pulse: 80, measuredAt: "2026-06-18T09:25:00", method: "Automated cuff", arm: "Left", position: "Seated, 5 min rest", source: "Clinic cuff", enteredBy: "s-lee", patientReported: false, flagged: false, reviewStatus: "reviewed", reviewedBy: "s-marsh", reviewedAt: "2026-06-19T12:00:00" },
  { id: "bp-2", patientId: "p-alvarez", systolic: 130, diastolic: 84, pulse: 76, measuredAt: "2026-07-16T09:20:00", method: "Automated cuff", arm: "Left", position: "Seated, 5 min rest", source: "Clinic cuff", enteredBy: "s-nair", patientReported: false, flagged: false, reviewStatus: "reviewed", reviewedBy: "s-marsh" },
  { id: "bp-3", patientId: "p-alvarez", systolic: 126, diastolic: 82, pulse: 74, measuredAt: "2026-09-03T09:30:00", method: "Automated cuff", arm: "Left", position: "Seated, 5 min rest", source: "Clinic cuff", enteredBy: "s-lee", patientReported: false, flagged: false, reviewStatus: "reviewed", reviewedBy: "s-marsh" },
  { id: "bp-4", patientId: "p-alvarez", systolic: 124, diastolic: 80, pulse: 72, measuredAt: "2026-09-17T09:15:00", method: "Automated cuff", arm: "Left", position: "Seated, 5 min rest", source: "Clinic cuff", enteredBy: "s-lee", patientReported: false, flagged: false, reviewStatus: "reviewed", reviewedBy: "s-marsh" },
  { id: "bp-5", patientId: "p-alvarez", systolic: 132, diastolic: 84, pulse: 70, measuredAt: "2026-10-01T08:20:00", method: "Patient home cuff", arm: "Left", position: "Seated", source: "Patient home cuff", enteredBy: "patient", patientReported: true, flagged: false, reviewStatus: "reviewed", reviewedBy: "s-marsh" },
  { id: "bp-6", patientId: "p-alvarez", systolic: 128, diastolic: 82, pulse: 74, measuredAt: "2026-10-15T09:12:00", method: "Automated cuff", arm: "Left", position: "Seated, 5 min rest", source: "Clinic cuff", enteredBy: "s-lee", patientReported: false, flagged: false, reviewStatus: "unreviewed" },
  { id: "bp-7", patientId: "p-brooks", systolic: 138, diastolic: 88, pulse: 82, measuredAt: "2026-10-19T10:00:00", method: "Automated cuff", arm: "Right", position: "Seated, 5 min rest", source: "Clinic cuff", enteredBy: "s-lee", patientReported: false, flagged: false, reviewStatus: "ready" },
  { id: "bp-8", patientId: "p-chen", systolic: 144, diastolic: 92, pulse: 68, measuredAt: "2026-10-20T09:40:00", method: "Automated cuff", arm: "Left", position: "Seated, 5 min rest", source: "Clinic cuff", enteredBy: "s-lee", patientReported: false, flagged: true, reviewStatus: "flagged" },
];

export const labResults: LabResult[] = [
  { id: "lab-1", patientId: "p-alvarez", test: "HbA1c", value: 6.3, unit: "%", refRange: "4.0 - 5.6", flag: "H", collectedOn: "2026-02-10", resultOn: "2026-02-12", lab: "Quest Diagnostics", enteredBy: "s-nair", reviewStatus: "reviewed", reviewedBy: "s-marsh", reviewedAt: "2026-06-18T12:00:00", reviewNote: "Baseline before program." },
  { id: "lab-2", patientId: "p-alvarez", test: "HbA1c", value: 6.1, unit: "%", refRange: "4.0 - 5.6", flag: "H", collectedOn: "2026-05-28", resultOn: "2026-05-30", lab: "Quest Diagnostics", enteredBy: "s-nair", reviewStatus: "reviewed", reviewedBy: "s-marsh" },
  { id: "lab-3", patientId: "p-alvarez", test: "HbA1c", value: 5.9, unit: "%", refRange: "4.0 - 5.6", flag: "H", collectedOn: "2026-10-08", resultOn: "2026-10-09", lab: "Quest Diagnostics", enteredBy: "s-nair", reportFile: { name: "Quest report - Oct 8.pdf", pages: 2, sizeKb: 1430 }, reviewStatus: "reviewed", reviewedBy: "s-marsh", reviewedAt: "2026-10-10T15:20:00", reviewNote: "A1c improving. Recheck in 3 months with fasting lipid panel." },
  { id: "lab-4", patientId: "p-alvarez", test: "Fasting glucose", value: 104, unit: "mg/dL", refRange: "70 - 99", flag: "H", collectedOn: "2026-10-08", resultOn: "2026-10-09", lab: "Quest Diagnostics", enteredBy: "s-nair", reviewStatus: "reviewed", reviewedBy: "s-marsh", reviewedAt: "2026-10-10T15:20:00" },
  { id: "lab-5", patientId: "p-alvarez", test: "LDL cholesterol", value: 118, unit: "mg/dL", refRange: "< 100", flag: "H", collectedOn: "2026-10-08", resultOn: "2026-10-09", lab: "Quest Diagnostics", enteredBy: "s-nair", reviewStatus: "reviewed", reviewedBy: "s-marsh", reviewedAt: "2026-10-10T15:20:00" },
  { id: "lab-6", patientId: "p-alvarez", test: "ALT", value: 24, unit: "U/L", refRange: "7 - 35", flag: null, collectedOn: "2026-10-08", resultOn: "2026-10-09", lab: "Quest Diagnostics", enteredBy: "s-nair", reviewStatus: "reviewed", reviewedBy: "s-marsh", reviewedAt: "2026-10-10T15:20:00" },
  { id: "lab-7", patientId: "p-alvarez", test: "TSH", value: 2.1, unit: "mIU/L", refRange: "0.4 - 4.0", flag: null, collectedOn: "2026-10-08", resultOn: "2026-10-09", lab: "Quest Diagnostics", enteredBy: "s-nair", reviewStatus: "reviewed", reviewedBy: "s-marsh", reviewedAt: "2026-10-10T15:20:00" },
  { id: "lab-8", patientId: "p-patel", test: "HbA1c", value: 6.4, unit: "%", refRange: "4.0 - 5.6", flag: "H", collectedOn: "2026-10-19", resultOn: "2026-10-21", lab: "Quest Diagnostics", enteredBy: "s-nair", reportFile: { name: "Quest report - Oct 19.pdf", pages: 1, sizeKb: 820 }, reviewStatus: "ready" },
];

export const medications: Medication[] = [
  { id: "med-1", patientId: "p-alvarez", name: "Semaglutide", dose: "1.0 mg", route: "Subcutaneous", frequency: "Once weekly", start: "2026-07-16", prescriberId: "s-marsh", status: "current", kind: "plan" },
  { id: "med-2", patientId: "p-alvarez", name: "Metformin", dose: "500 mg", route: "By mouth", frequency: "Twice daily", start: "2025-11-02", prescriberId: "s-marsh", status: "current", kind: "list" },
  { id: "med-3", patientId: "p-alvarez", name: "Phentermine", dose: "37.5 mg", route: "By mouth", frequency: "Once daily", start: "2026-06-18", stop: "2026-06-30", prescriberId: "s-marsh", status: "discontinued", kind: "list" },
  { id: "med-4", patientId: "p-brooks", name: "Tirzepatide", dose: "7.5 mg", route: "Subcutaneous", frequency: "Once weekly", start: "2026-05-07", prescriberId: "s-marsh", status: "current", kind: "plan" },
  { id: "med-5", patientId: "p-patel", name: "Semaglutide", dose: "0.5 mg", route: "Subcutaneous", frequency: "Once weekly", start: "2026-07-30", prescriberId: "s-marsh", status: "current", kind: "plan" },
  { id: "med-6", patientId: "p-chen", name: "Tirzepatide", dose: "10 mg", route: "Subcutaneous", frequency: "Once weekly", start: "2026-04-06", prescriberId: "s-marsh", status: "current", kind: "plan" },
  { id: "med-7", patientId: "p-okafor", name: "Semaglutide", dose: "0.5 mg", route: "Subcutaneous", frequency: "Once weekly", start: "2026-07-02", prescriberId: "s-marsh", status: "current", kind: "plan" },
  { id: "med-8", patientId: "p-whitaker", name: "Semaglutide", dose: "1.7 mg", route: "Subcutaneous", frequency: "Once weekly", start: "2026-06-04", prescriberId: "s-marsh", status: "current", kind: "plan" },
];

export const adherence: Adherence[] = [
  { patientId: "p-alvarez", month: "2026-10", taken: 4, scheduled: 4, sideEffects: "Mild nausea on dose day", reportedAt: "2026-10-20T19:40:00" },
  { patientId: "p-brooks", month: "2026-10", taken: 3, scheduled: 4, sideEffects: "Nausea, reduced appetite", reportedAt: "2026-10-19T08:15:00" },
];

export const reviews: ClinicalReview[] = [
  { id: "rv-1", patientId: "p-alvarez", at: "2026-10-01T16:40:00", by: "s-marsh", note: "Steady progress, tolerating semaglutide. Continue current dose. Recheck labs in October.", items: ["Weight Oct 1", "BP Oct 1", "Check-in Sep"] },
  { id: "rv-2", patientId: "p-alvarez", at: "2026-10-10T15:20:00", by: "s-marsh", note: "A1c improving. Recheck in 3 months with fasting lipid panel.", items: ["Labs Oct 8"] },
];

export const checkInQuestions: CheckInQuestion[] = [
  { id: "q1", text: "How have you been feeling since your last check-in?", options: ["Much worse", "A bit worse", "About the same", "A bit better", "Much better"], taskOn: ["Much worse"] },
  { id: "q2", text: "Have you had any medication-related concerns or side effects?", options: ["No", "Yes, mild", "Yes, it worries me"], taskOn: ["Yes, it worries me"] },
  { id: "q3", text: "How has your energy level been?", options: ["Much lower", "Lower", "About the same", "Higher", "Much higher"], taskOn: ["Much lower"] },
  { id: "q4", text: "Any changes in appetite?", options: ["Eating much less", "A little less", "No change", "A little more"], taskOn: [] },
  { id: "q5", text: "Any significant changes in activity or sleep?", options: ["No", "Yes, better", "Yes, worse"], taskOn: ["Yes, worse"] },
  { id: "q6", text: "Have you had difficulty following your agreed treatment plan?", options: ["No", "Sometimes", "Often"], taskOn: ["Often"] },
  { id: "q7", text: "Do you have questions or concerns for the care team?", options: ["No", "Yes"], taskOn: ["Yes"] },
  { id: "q8", text: "Would you like the care team to contact you?", options: ["No", "Yes"], taskOn: ["Yes"] },
];

export const checkIns: CheckIn[] = [
  { id: "ci-1", patientId: "p-alvarez", month: "2026-09", submittedAt: "2026-09-29T20:10:00", answers: [{ questionId: "q1", answer: "A bit better" }, { questionId: "q2", answer: "Yes, mild" }, { questionId: "q3", answer: "About the same" }, { questionId: "q4", answer: "A little less" }, { questionId: "q5", answer: "No" }, { questionId: "q6", answer: "No" }, { questionId: "q7", answer: "No" }, { questionId: "q8", answer: "No" }], comment: "Nausea mostly gone by day 2.", wantsContact: false, reviewStatus: "reviewed" },
  { id: "ci-2", patientId: "p-alvarez", month: "2026-10", submittedAt: "2026-10-20T19:40:00", answers: [{ questionId: "q1", answer: "A bit better" }, { questionId: "q2", answer: "Yes, mild" }, { questionId: "q3", answer: "About the same" }, { questionId: "q4", answer: "A little less" }, { questionId: "q5", answer: "No" }, { questionId: "q6", answer: "No" }, { questionId: "q7", answer: "Yes" }, { questionId: "q8", answer: "No" }], comment: "Is mild nausea after my dose normal?", wantsContact: false, reviewStatus: "ready", assignedTo: "s-marsh" },
  { id: "ci-3", patientId: "p-brooks", month: "2026-10", submittedAt: "2026-10-19T08:15:00", answers: [{ questionId: "q1", answer: "About the same" }, { questionId: "q2", answer: "Yes, it worries me" }, { questionId: "q3", answer: "Lower" }, { questionId: "q4", answer: "Eating much less" }, { questionId: "q5", answer: "No" }, { questionId: "q6", answer: "Sometimes" }, { questionId: "q7", answer: "Yes" }, { questionId: "q8", answer: "Yes" }], comment: "Nausea for 3 days after my dose.", wantsContact: true, reviewStatus: "ready", assignedTo: "s-marsh" },
];

export const tasks: Task[] = [
  { id: "t-1", title: "Call patient about nausea", patientId: "p-brooks", assigneeId: "s-lee", createdBy: "s-marsh", due: "2026-10-22", done: false, tag: "Follow-up" },
  { id: "t-2", title: "Enter HbA1c from Quest", patientId: "p-patel", assigneeId: "s-lee", createdBy: "system", due: "2026-10-23", done: false, tag: "Lab entry" },
  { id: "t-3", title: "Membership renewal follow-up", patientId: "p-okafor", assigneeId: "s-lee", createdBy: "s-becker", due: "2026-10-30", done: false, tag: "Admin" },
  { id: "t-4", title: "Schedule monthly check-in", patientId: "p-romano", assigneeId: "s-lee", createdBy: "system", due: "2026-10-31", done: false, tag: "Automated" },
  { id: "t-5", title: "Monthly check-in overdue, call patient", patientId: "p-chen", assigneeId: "s-lee", createdBy: "system", due: "2026-10-24", done: false, tag: "Automated" },
  { id: "t-6", title: "Collect intake questionnaire", patientId: "p-kim", assigneeId: "s-nair", createdBy: "s-becker", due: "2026-10-27", done: false, tag: "Intake" },
  { id: "t-7", title: "Upload Sep lab report", patientId: "p-whitaker", assigneeId: "s-lee", createdBy: "s-marsh", due: "2026-10-15", done: true, tag: "Lab entry" },
];

export const messages: Message[] = [
  { id: "msg-1", patientId: "p-alvarez", from: "system", body: "Your monthly check-in opens Nov 1. Please sign in to complete it.", at: "2026-10-18T09:00:00" },
  { id: "msg-2", patientId: "p-alvarez", from: "patient", body: "Is mild nausea after my dose normal?", at: "2026-10-20T20:12:00" },
  { id: "msg-3", patientId: "p-alvarez", from: "s-marsh", body: "Mild nausea is common in the first days after a dose. Try smaller meals. Message us if it lasts more than 3 days.", at: "2026-10-21T10:04:00", reviewedBy: "s-marsh" },
];

export const auditSeed: AuditEvent[] = [
  { id: "a-1", at: "2026-10-22T08:58:00", by: "s-lee", action: "sign-in", target: "Session", detail: "Signed in with MFA" },
  { id: "a-2", at: "2026-10-21T10:04:00", by: "s-marsh", action: "create", target: "Message - Maria Alvarez", detail: "Clinician-reviewed reply sent" },
  { id: "a-3", at: "2026-10-21T09:40:00", by: "s-nair", action: "create", target: "Lab - Aisha Patel", detail: "HbA1c 6.4 % entered, report attached" },
  { id: "a-4", at: "2026-10-20T16:02:00", by: "s-becker", action: "export", target: "Report - Check-ins", detail: "CSV export, 142 rows, admin fields only" },
  { id: "a-5", at: "2026-10-10T15:20:00", by: "s-marsh", action: "sign", target: "Review - Maria Alvarez", detail: "Labs Oct 8 reviewed" },
  { id: "a-6", at: "2026-10-03T17:30:00", by: "s-becker", action: "access", target: "User - Rachel Diaz", detail: "Access removed, 2 sessions ended" },
  { id: "a-7", at: "2026-09-17T16:12:00", by: "s-lee", action: "correct", target: "Weight - Maria Alvarez", detail: "207.9 lb to 207.2 lb, reason: Transcription error" },
];

export const settingsSeed: Settings = {
  bpRule: { systolicGte: 140, diastolicGte: 90 },
  timezone: "America/Chicago",
  patientVisible: { bodyFat: true, muscleMass: false, labs: false },
};

export const permissionMatrix: PermissionRow[] = [
  { key: "viewClinical", label: "View clinical data", physician: true, ma: true, admin: false },
  { key: "enterMeasurements", label: "Enter measurements", physician: true, ma: true, admin: false },
  { key: "signReview", label: "Sign clinical review", physician: true, ma: false, admin: false },
  { key: "billing", label: "Membership and admin records", physician: false, ma: false, admin: true },
  { key: "export", label: "Export data", physician: true, ma: false, admin: true },
  { key: "users", label: "Manage users and roles", physician: false, ma: false, admin: true },
];

export const educationArticles = [
  { id: "edu-1", title: "Protein first: eating well on GLP-1", minutes: 4, image: img("thumb-glp1-balanced-meal"), approvedBy: "s-marsh", tag: "Nutrition and GLP-1" },
];

export const images = {
  hero: img("hero-clinic-room"),
  emptyDesk: img("empty-physician-desk"),
  emptyReception: img("empty-clinic-reception"),
  meal: img("thumb-glp1-balanced-meal"),
};
