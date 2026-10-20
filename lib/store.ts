"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import * as seed from "./data";
import type {
  AuditEvent,
  BpReading,
  CheckIn,
  LabResult,
  Measurement,
  Message,
  Settings,
  Staff,
  Task,
} from "./types";

/** Demo clock: everything happens on the fixed demo day, advancing per action. */
let tick = 0;
export const nowIso = () => {
  const base = new Date(seed.DEMO_TODAY).getTime() + 30 * 60 * 1000 + tick++ * 60 * 1000;
  return seed.localIso(new Date(base));
};
const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 9)}`;

export interface NewMeasurementInput {
  patientId: string;
  measuredAt: string;
  source: string;
  enteredBy: string;
  patientReported?: boolean;
  notes?: string;
  values: Partial<Record<Measurement["type"], number | null>>;
  unit: "lb" | "kg";
}

export interface NewBpInput {
  patientId: string;
  systolic: number;
  diastolic: number;
  pulse?: number;
  measuredAt: string;
  method: BpReading["method"];
  arm: BpReading["arm"];
  position: string;
  enteredBy: string;
  notes?: string;
}

export interface SignReviewInput {
  patientId: string;
  by: string;
  note: string;
  itemLabels: string[];
  /** ids of the items being signed; when omitted every pending item for the patient is signed */
  itemIds?: string[];
  task?: { title: string; assigneeId: string; due: string };
  messageToPatient?: string;
}

interface AppState {
  /** signed-in demo user: a staff id or a patient id */
  userId: string | null;
  staff: Staff[];
  measurements: Measurement[];
  bpReadings: BpReading[];
  labResults: LabResult[];
  reviews: typeof seed.reviews;
  checkIns: CheckIn[];
  tasks: Task[];
  messages: Message[];
  audit: AuditEvent[];
  settings: Settings;

  signIn: (userId: string) => void;
  signOut: () => void;
  log: (e: Omit<AuditEvent, "id" | "at">) => void;
  addMeasurements: (input: NewMeasurementInput) => string[];
  correctMeasurement: (id: string, to: number | null, reason: string, by: string) => void;
  addBpReading: (input: NewBpInput) => BpReading;
  addLab: (lab: Omit<LabResult, "id" | "reviewStatus">) => void;
  markReadyForReview: (patientId: string, by: string) => void;
  signReview: (input: SignReviewInput) => void;
  submitCheckIn: (patientId: string, answers: CheckIn["answers"], comment: string, wantsContact: boolean) => { tasksCreated: number };
  toggleTask: (id: string) => void;
  addTask: (t: Omit<Task, "id" | "done">) => void;
  sendMessage: (patientId: string, from: string, body: string) => void;
  setStaffStatus: (id: string, status: Staff["status"], by: string) => void;
  updateSettings: (s: Partial<Settings>, by: string) => void;
  recordExport: (by: string, dataset: string, rows: number) => void;
  resetDemo: () => void;
}

const initial = () => ({
  userId: null as string | null,
  staff: seed.staff,
  measurements: seed.measurements,
  bpReadings: seed.bpReadings,
  labResults: seed.labResults,
  reviews: seed.reviews,
  checkIns: seed.checkIns,
  tasks: seed.tasks,
  messages: seed.messages,
  audit: seed.auditSeed,
  settings: seed.settingsSeed,
});

const lbFrom = (v: number, unit: "lb" | "kg") => (unit === "kg" ? Math.round(v * 2.20462 * 10) / 10 : v);

export const useApp = create<AppState>()(
  persist(
    (set, get) => ({
      ...initial(),

      signIn: (userId) => {
        set({ userId });
        get().log({ by: userId, action: "sign-in", target: "Session", detail: "Signed in with MFA (demo)" });
      },
      signOut: () => set({ userId: null }),

      log: (e) => set((s) => ({ audit: [{ id: uid("a"), at: nowIso(), ...e }, ...s.audit] })),

      addMeasurements: (input) => {
        const ids: string[] = [];
        const rows: Measurement[] = [];
        for (const [type, raw] of Object.entries(input.values) as [Measurement["type"], number | null][]) {
          if (raw === undefined) continue;
          const isMass = type === "weight" || type === "muscleMass" || type === "fatFreeMass";
          const value = raw === null ? null : isMass ? lbFrom(raw, input.unit) : raw;
          const id = uid("m");
          ids.push(id);
          rows.push({
            id,
            patientId: input.patientId,
            type,
            value,
            unit: isMass ? "lb" : type === "bodyFat" ? "%" : "level",
            measuredAt: input.measuredAt,
            source: input.source,
            enteredBy: input.enteredBy,
            patientReported: !!input.patientReported,
            isEstimate: type !== "weight",
            reviewStatus: "unreviewed",
            notes: input.notes,
            history: [],
          });
        }
        set((s) => ({ measurements: [...s.measurements, ...rows] }));
        get().log({ by: input.enteredBy, action: "create", target: `Measurements - ${input.patientId}`, detail: `${rows.length} values saved from ${input.source}` });
        return ids;
      },

      correctMeasurement: (id, to, reason, by) => {
        const cur = get().measurements.find((x) => x.id === id);
        if (!cur) return;
        set((s) => ({
          measurements: s.measurements.map((x) =>
            x.id === id ? { ...x, value: to, reviewStatus: "unreviewed", history: [...x.history, { at: nowIso(), by, from: x.value, to, reason }] } : x,
          ),
        }));
        get().log({ by, action: "correct", target: `${cur.type} - ${cur.patientId}`, detail: `${cur.value ?? "Not measured"} to ${to ?? "Not measured"}, reason: ${reason}` });
      },

      addBpReading: (input) => {
        const { systolicGte, diastolicGte } = get().settings.bpRule;
        const flagged = input.systolic >= systolicGte || input.diastolic >= diastolicGte;
        const reading: BpReading = {
          id: uid("bp"),
          ...input,
          source: input.method === "Patient home cuff" ? "Patient home cuff" : "Clinic cuff",
          patientReported: input.method === "Patient home cuff",
          flagged,
          reviewStatus: flagged ? "flagged" : "unreviewed",
        };
        set((s) => ({ bpReadings: [...s.bpReadings, reading] }));
        get().log({ by: input.enteredBy, action: "create", target: `BP - ${input.patientId}`, detail: `${input.systolic}/${input.diastolic}${flagged ? ", flagged by practice rule" : ""}` });
        return reading;
      },

      addLab: (lab) => {
        set((s) => ({ labResults: [...s.labResults, { ...lab, id: uid("lab"), reviewStatus: "ready" }] }));
        get().log({ by: lab.enteredBy, action: "create", target: `Lab - ${lab.patientId}`, detail: `${lab.test} ${lab.value} ${lab.unit}` });
      },

      markReadyForReview: (patientId, by) => {
        set((s) => ({
          measurements: s.measurements.map((x) => (x.patientId === patientId && x.reviewStatus === "unreviewed" ? { ...x, reviewStatus: "ready" } : x)),
          bpReadings: s.bpReadings.map((x) => (x.patientId === patientId && x.reviewStatus === "unreviewed" ? { ...x, reviewStatus: "ready" } : x)),
        }));
        get().log({ by, action: "update", target: `Record - ${patientId}`, detail: "Marked ready for physician review" });
      },

      signReview: ({ patientId, by, note, itemLabels, itemIds, task, messageToPatient }) => {
        const at = nowIso();
        const picked = itemIds ? new Set(itemIds) : null;
        const pending = (st: string, id: string) => st !== "reviewed" && (!picked || picked.has(id));
        set((s) => ({
          measurements: s.measurements.map((x) => (x.patientId === patientId && pending(x.reviewStatus, x.id) ? { ...x, reviewStatus: "reviewed", reviewedBy: by, reviewedAt: at } : x)),
          bpReadings: s.bpReadings.map((x) => (x.patientId === patientId && pending(x.reviewStatus, x.id) ? { ...x, reviewStatus: "reviewed", reviewedBy: by, reviewedAt: at } : x)),
          labResults: s.labResults.map((x) => (x.patientId === patientId && pending(x.reviewStatus, x.id) ? { ...x, reviewStatus: "reviewed", reviewedBy: by, reviewedAt: at } : x)),
          checkIns: s.checkIns.map((x) => (x.patientId === patientId && pending(x.reviewStatus, x.id) ? { ...x, reviewStatus: "reviewed" } : x)),
          reviews: [...s.reviews, { id: uid("rv"), patientId, at, by, note, items: itemLabels }],
          tasks: task ? [...s.tasks, { id: uid("t"), title: task.title, patientId, assigneeId: task.assigneeId, createdBy: by, due: task.due, done: false, tag: "Follow-up" }] : s.tasks,
          messages: messageToPatient ? [...s.messages, { id: uid("msg"), patientId, from: by, body: messageToPatient, at, reviewedBy: by }] : s.messages,
        }));
        get().log({ by, action: "sign", target: `Review - ${patientId}`, detail: `Signed: ${itemLabels.join(", ")}` });
      },

      submitCheckIn: (patientId, answers, comment, wantsContact) => {
        const qs = seed.checkInQuestions;
        const triggers = answers.filter((a) => qs.find((q) => q.id === a.questionId)?.taskOn.includes(a.answer));
        const needsReview = triggers.length > 0 || wantsContact;
        const p = seed.patients.find((x) => x.id === patientId);
        const ci: CheckIn = {
          id: uid("ci"),
          patientId,
          month: seed.DEMO_TODAY.slice(0, 7),
          submittedAt: nowIso(),
          answers,
          comment: comment || undefined,
          wantsContact,
          reviewStatus: needsReview ? "ready" : "unreviewed",
          assignedTo: needsReview ? "s-marsh" : undefined,
        };
        const newTasks: Task[] = needsReview
          ? [{ id: uid("t"), title: wantsContact ? "Patient asked to be contacted" : "Check-in answer needs follow-up", patientId, assigneeId: p?.maId ?? "s-lee", createdBy: "system", due: seed.DEMO_TODAY.slice(0, 10), done: false, tag: "Automated" }]
          : [];
        set((s) => ({ checkIns: [...s.checkIns, ci], tasks: [...s.tasks, ...newTasks] }));
        get().log({ by: patientId, action: "create", target: "Check-in", detail: `Monthly check-in submitted${needsReview ? ", staff task created" : ""}` });
        return { tasksCreated: newTasks.length };
      },

      toggleTask: (id) => {
        const t = get().tasks.find((x) => x.id === id);
        set((s) => ({ tasks: s.tasks.map((x) => (x.id === id ? { ...x, done: !x.done } : x)) }));
        if (t) get().log({ by: get().userId ?? "system", action: "update", target: `Task - ${t.title}`, detail: t.done ? "Reopened" : "Completed" });
      },

      addTask: (t) => {
        set((s) => ({ tasks: [...s.tasks, { ...t, id: uid("t"), done: false }] }));
        get().log({ by: t.createdBy, action: "create", target: `Task - ${t.title}`, detail: `Assigned to ${t.assigneeId}` });
      },

      sendMessage: (patientId, from, body) => {
        set((s) => ({ messages: [...s.messages, { id: uid("msg"), patientId, from, body, at: nowIso(), reviewedBy: from.startsWith("s-") ? from : undefined }] }));
        get().log({ by: from === "patient" ? patientId : from, action: "create", target: `Message - ${patientId}`, detail: "Non-urgent message" });
      },

      setStaffStatus: (id, status, by) => {
        set((s) => ({ staff: s.staff.map((x) => (x.id === id ? { ...x, status, removedOn: status === "removed" ? seed.DEMO_TODAY.slice(0, 10) : undefined } : x)) }));
        get().log({ by, action: "access", target: `User - ${id}`, detail: status === "removed" ? "Access removed, sessions ended" : "Access restored" });
      },

      updateSettings: (patch, by) => {
        set((s) => ({ settings: { ...s.settings, ...patch } }));
        get().log({ by, action: "update", target: "Settings", detail: "Practice rules updated" });
      },

      recordExport: (by, dataset, rows) => get().log({ by, action: "export", target: `Export - ${dataset}`, detail: `CSV, ${rows} rows, permission-checked` }),

      resetDemo: () => set({ ...initial() }),
    }),
    { name: "steadfast-demo-v1", version: 1 },
  ),
);
