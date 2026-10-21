"use client";

import clsx from "clsx";
import Link from "next/link";
import { useApp } from "@/lib/store";
import { DEMO_TODAY } from "@/lib/data";
import { fmtDay } from "@/lib/format";
import { getPatient, whoName } from "@/lib/selectors";
import type { Task } from "@/lib/types";
import { Avatar, Icon } from "@/components/ui";

export const TODAY = DEMO_TODAY.slice(0, 10);

export const dueLabel = (t: Task) => (t.due === TODAY ? "Due today" : t.due < TODAY ? `Overdue - ${fmtDay(t.due)}` : `Due ${fmtDay(t.due)}`);

export function TaskRow({ task, showAssignee }: { task: Task; showAssignee?: boolean }) {
  const toggleTask = useApp((s) => s.toggleTask);
  const staff = useApp((s) => s.staff);
  const p = task.patientId ? getPatient(task.patientId) : undefined;
  const urgent = !task.done && task.due <= TODAY;
  const automated = task.createdBy === "system" || task.tag === "Automated";
  const assignee = staff.find((s) => s.id === task.assigneeId);

  return (
    <article className={clsx("bg-surface rounded-card p-4 shadow-clinical border border-border", urgent && "border-l-4 border-l-warning")}>
      <div className="flex items-start gap-3.5">
        <button
          type="button"
          onClick={() => toggleTask(task.id)}
          aria-label={task.done ? `Reopen task: ${task.title}` : `Mark task complete: ${task.title}`}
          aria-pressed={task.done}
          className="-m-2.5 p-2.5 shrink-0 group"
        >
          <span
            className={clsx(
              "w-6 h-6 rounded-full border-2 grid place-items-center transition-colors",
              task.done ? "bg-accent-fill border-accent-fill text-white" : urgent ? "border-warning group-hover:bg-warning-tint" : "border-outline-variant group-hover:border-accent-fill",
            )}
          >
            <Icon name="check" size={16} className={task.done ? "" : "text-transparent group-hover:text-accent-fill"} />
          </span>
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            {p ? (
              <Link href={`/patients/${p.id}`} className="flex items-center gap-2 min-w-0 hover:underline">
                <Avatar src={p.avatar} alt="" size={28} className="ring-1 ring-border" />
                <span className="text-label-md font-semibold text-text-primary truncate">{p.name}</span>
              </Link>
            ) : (
              <span className="text-label-md font-semibold text-text-secondary">Practice task</span>
            )}
            {urgent ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-warning-tint text-warning shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-warning" aria-hidden />
                {task.due === TODAY ? "Due today" : "Overdue"}
              </span>
            ) : (
              task.tag && (
                <span
                  className={clsx(
                    "text-[11px] px-2 py-0.5 rounded-full border shrink-0",
                    automated ? "bg-[#EEF0F6] text-text-tertiary border-border" : task.tag === "Lab entry" ? "bg-accent-tint text-accent-fill border-border" : "bg-surface-alt text-text-secondary border-border",
                  )}
                >
                  {task.tag}
                </span>
              )
            )}
          </div>
          <h2 className={clsx("text-body-md font-medium leading-snug", task.done ? "text-text-tertiary line-through" : "text-text-primary")}>{task.title}</h2>
          <p className="mt-2 flex items-center flex-wrap text-caption-sm text-text-secondary gap-x-1.5">
            <Icon name={urgent ? "schedule" : "event"} size={15} className={urgent ? "text-warning" : "text-text-tertiary"} />
            <span className={urgent ? "font-medium text-text-primary" : ""}>{dueLabel(task)}</span>
            <span className="text-text-tertiary">-</span>
            <span className="truncate">from {whoName(task.createdBy, staff)}</span>
            {showAssignee && assignee && (
              <>
                <span className="text-text-tertiary">-</span>
                <span className="truncate">for {assignee.shortName}</span>
              </>
            )}
          </p>
        </div>
      </div>
    </article>
  );
}
