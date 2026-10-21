"use client";

import clsx from "clsx";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { roleChip, useCurrentUser } from "@/components/shell";
import { Card, Icon, PageHeader } from "@/components/ui";
import { TODAY, TaskRow } from "@/components/review/TaskRow";
import { NewTaskForm } from "@/components/review/NewTaskForm";

type Seg = "mine" | "team" | "done";

export default function TasksPage() {
  const { userId, role, staff: me } = useCurrentUser();
  const tasks = useApp((s) => s.tasks);
  const mine = tasks.filter((t) => !t.done && t.assigneeId === userId);
  const [seg, setSeg] = useState<Seg>(mine.length ? "mine" : "team");
  const [adding, setAdding] = useState(false);
  const [note, setNote] = useState("");

  const team = tasks.filter((t) => !t.done);
  const done = tasks.filter((t) => t.done);
  const list = (seg === "mine" ? mine : seg === "team" ? team : done).slice().sort((a, b) => a.due.localeCompare(b.due));
  const dueToday = list.filter((t) => !t.done && t.due <= TODAY).length;

  const segs: { key: Seg; label: string; count: number }[] = [
    { key: "mine", label: "Mine", count: mine.length },
    { key: "team", label: "Team", count: team.length },
    { key: "done", label: "Done", count: done.length },
  ];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Tasks" caption="Care team follow-ups" avatar={me?.avatar} role={roleChip(role)} />

      <div className="flex items-center gap-2" role="tablist" aria-label="Task lists">
        {segs.map((s) => (
          <button
            key={s.key}
            role="tab"
            aria-selected={seg === s.key}
            onClick={() => setSeg(s.key)}
            className={clsx(
              "h-11 px-5 rounded-full text-label-md flex items-center gap-1.5 transition-all active:scale-95",
              seg === s.key ? "bg-accent-tint text-accent-fill font-semibold shadow-card-sm" : "bg-surface text-text-secondary border border-border hover:bg-surface-container-low",
            )}
          >
            {s.label}
            {seg === s.key && <span className="min-w-5 h-5 px-1 rounded-full bg-accent-fill text-white grid place-items-center text-[11px] font-bold">{s.count}</span>}
          </button>
        ))}
      </div>

      <div className="lg:grid lg:grid-cols-[1fr_340px] lg:gap-6 lg:items-start space-y-4 lg:space-y-0">
        <div className="space-y-3">
          <Card className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-[44px] leading-tight font-bold tracking-tight">{list.length}</span>
                  <span className="text-title-md font-semibold">{seg === "done" ? "completed tasks" : list.length === 1 ? "open task" : "open tasks"}</span>
                </div>
                {seg !== "done" && (
                  <span className={clsx("inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full text-caption-sm font-semibold", dueToday ? "bg-warning-tint text-warning" : "bg-surface-alt text-text-tertiary")}>
                    {dueToday > 0 && <span className="w-2 h-2 rounded-full bg-warning" aria-hidden />}
                    {dueToday} due today
                  </span>
                )}
              </div>
              <span className="w-12 h-12 rounded-2xl bg-surface-alt border border-border grid place-items-center text-accent-fill">
                <Icon name="checklist" size={26} />
              </span>
            </div>
          </Card>

          {note && (
            <p role="status" className="flex items-center gap-2 rounded-2xl bg-success-tint text-[#15803D] p-3 text-label-md">
              <Icon name="check_circle" size={18} />
              {note}
            </p>
          )}

          <div className="flex items-center justify-between px-1">
            <span className="text-label-md font-semibold text-text-secondary">{seg === "done" ? "Completed" : "Assigned priorities"}</span>
            <span className="text-caption-sm text-text-tertiary">Tap circle to {seg === "done" ? "reopen" : "resolve"}</span>
          </div>

          {list.length === 0 ? (
            <Card className="p-6 text-center text-text-secondary">
              {seg === "mine" ? "No open tasks assigned to you. Check the Team list." : seg === "team" ? "The care team has no open tasks." : "No completed tasks yet."}
            </Card>
          ) : (
            list.map((t) => <TaskRow key={t.id} task={t} showAssignee={seg !== "mine"} />)
          )}
        </div>

        <div className="space-y-3">
          {adding && userId ? (
            <NewTaskForm
              userId={userId}
              onDone={(m) => {
                setNote(m);
                setAdding(false);
              }}
            />
          ) : (
            <button
              type="button"
              onClick={() => {
                setNote("");
                setAdding(true);
              }}
              className="w-full h-[52px] rounded-full bg-surface border border-accent-fill text-accent-fill text-label-md font-semibold flex items-center justify-center gap-2 hover:bg-accent-tint/40 transition-colors"
            >
              <Icon name="add" size={20} />
              New task
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
