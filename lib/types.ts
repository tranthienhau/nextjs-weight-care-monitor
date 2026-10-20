export type Role = "physician" | "ma" | "admin" | "patient";

export type ReviewStatus = "unreviewed" | "ready" | "flagged" | "reviewed";

export interface Staff {
  id: string;
  name: string;
  shortName: string;
  role: Exclude<Role, "patient">;
  title: string;
  avatar: string;
  status: "active" | "removed";
  removedOn?: string;
}

export interface Patient {
  id: string;
  mrn: string;
  name: string;
  firstName: string;
  dob: string;
  age: number;
  avatar: string;
  status: "active" | "inactive" | "discharged" | "new";
  membership: "active" | "paused" | "ended";
  programWeek: number;
  enrolledOn: string;
  startWeightLb: number;
  clinicianId: string;
  maId: string;
  consent: "signed" | "pending";
  nextVisit?: { at: string; kind: "Office visit" | "Remote check-in" | "Intake visit"; note: string };
  checkInDue?: string;
}

export interface EditEntry {
  at: string;
  by: string;
  from: number | null;
  to: number | null;
  reason: string;
}

export type MeasurementType = "weight" | "bodyFat" | "muscleMass" | "fatFreeMass" | "visceralFat";

export interface Measurement {
  id: string;
  patientId: string;
  type: MeasurementType;
  /** null means "Not measured" - never stored as 0 */
  value: number | null;
  unit: "lb" | "kg" | "%" | "level";
  measuredAt: string;
  source: string;
  enteredBy: string;
  patientReported: boolean;
  isEstimate: boolean;
  reviewStatus: ReviewStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  notes?: string;
  history: EditEntry[];
}

export interface BpReading {
  id: string;
  patientId: string;
  systolic: number;
  diastolic: number;
  pulse?: number;
  measuredAt: string;
  method: "Automated cuff" | "Manual" | "Patient home cuff";
  arm: "Left" | "Right";
  position: string;
  source: string;
  enteredBy: string;
  patientReported: boolean;
  flagged: boolean;
  reviewStatus: ReviewStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  notes?: string;
}

export interface LabResult {
  id: string;
  patientId: string;
  test: string;
  value: number;
  unit: string;
  refRange: string;
  flag: "H" | "L" | null;
  collectedOn: string;
  resultOn: string;
  lab: string;
  enteredBy: string;
  reportFile?: { name: string; pages: number; sizeKb: number };
  reviewStatus: ReviewStatus;
  reviewNote?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface Medication {
  id: string;
  patientId: string;
  name: string;
  dose: string;
  route: string;
  frequency: string;
  start: string;
  stop?: string;
  prescriberId: string;
  status: "current" | "discontinued";
  /** plan = clinician-authorized treatment plan, list = medication list entry */
  kind: "plan" | "list";
}

export interface Adherence {
  patientId: string;
  month: string;
  taken: number;
  scheduled: number;
  sideEffects: string;
  reportedAt: string;
}

export interface ClinicalReview {
  id: string;
  patientId: string;
  at: string;
  by: string;
  note: string;
  items: string[];
}

export interface CheckInQuestion {
  id: string;
  text: string;
  options: string[];
  /** answers that create a staff task (practice-configured rule) */
  taskOn: string[];
}

export interface CheckIn {
  id: string;
  patientId: string;
  month: string;
  submittedAt: string;
  answers: { questionId: string; answer: string }[];
  comment?: string;
  wantsContact: boolean;
  reviewStatus: ReviewStatus;
  assignedTo?: string;
}

export interface Task {
  id: string;
  title: string;
  patientId?: string;
  assigneeId: string;
  createdBy: string; // staff id or "system"
  due: string;
  done: boolean;
  tag?: string;
}

export interface Message {
  id: string;
  patientId: string;
  from: string; // "patient" | staff id | "system"
  body: string;
  at: string;
  reviewedBy?: string;
}

export interface AuditEvent {
  id: string;
  at: string;
  by: string;
  action: "view" | "create" | "update" | "correct" | "sign" | "export" | "access" | "sign-in";
  target: string;
  detail: string;
}

export interface Settings {
  bpRule: { systolicGte: number; diastolicGte: number };
  timezone: string;
  patientVisible: { bodyFat: boolean; muscleMass: boolean; labs: boolean };
}

export interface PermissionRow {
  key: string;
  label: string;
  physician: boolean;
  ma: boolean;
  admin: boolean;
}
