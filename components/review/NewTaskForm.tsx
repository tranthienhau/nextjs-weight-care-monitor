"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import { patients } from "@/lib/data";
import { Button, Card, Field, inputCls } from "@/components/ui";
import { TODAY } from "./TaskRow";

export function NewTaskForm({ userId, onDone }: { userId: string; onDone: (msg: string) => void }) {
  const staff = useApp((s) => s.staff);
  const addTask = useApp((s) => s.addTask);
  const active = staff.filter((s) => s.status === "active" && s.role !== "admin");
  const [title, setTitle] = useState("");
  const [patientId, setPatientId] = useState(patients[0].id);
  const [assigneeId, setAssigneeId] = useState(active.find((s) => s.id === userId)?.id ?? active.find((s) => s.role === "ma")?.id ?? "");
  const [due, setDue] = useState(TODAY);
  const [error, setError] = useState("");

  const save = () => {
    if (!title.trim()) return setError("Add a task title.");
    addTask({ title: title.trim(), patientId, assigneeId, createdBy: userId, due, tag: "Follow-up" });
    onDone(`Task added for ${staff.find((s) => s.id === assigneeId)?.shortName ?? "the care team"}.`);
  };

  return (
    <Card className="p-4 space-y-3">
      <h2 className="text-title-md font-semibold">New task</h2>
      <Field label="Task title" error={error}>
        <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Call patient about home BP log" />
      </Field>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Field label="Patient">
          <select className={inputCls} value={patientId} onChange={(e) => setPatientId(e.target.value)}>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Assignee">
          <select className={inputCls} value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
            {active.map((s) => (
              <option key={s.id} value={s.id}>
                {s.shortName}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Due date">
          <input type="date" className={inputCls} value={due} min={TODAY} onChange={(e) => setDue(e.target.value)} />
        </Field>
      </div>
      <Button full onClick={save} icon="add_task">
        Add task
      </Button>
    </Card>
  );
}
