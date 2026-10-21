"use client";

import clsx from "clsx";
import { useState } from "react";
import { checkInQuestions } from "@/lib/data";
import { fmtDate, fmtDayTime } from "@/lib/format";
import { whoName } from "@/lib/selectors";
import { useApp } from "@/lib/store";
import type { CheckIn } from "@/lib/types";
import { Card, Icon, ReviewBadge, StatusPill } from "@/components/ui";

const monthName = (m: string) => new Date(`${m}-01T12:00:00`).toLocaleDateString("en-US", { month: "long", year: "numeric" });

const isTrigger = (questionId: string, answer: string) => !!checkInQuestions.find((q) => q.id === questionId)?.taskOn.includes(answer);

/** Signed review covering this check-in: the first one signed after it was submitted. */
function useSigner(ci: CheckIn) {
  const reviews = useApp((s) => s.reviews);
  const staff = useApp((s) => s.staff);
  const r = reviews
    .filter((x) => x.patientId === ci.patientId && x.at >= ci.submittedAt)
    .sort((a, b) => a.at.localeCompare(b.at))[0];
  return r ? { by: whoName(r.by, staff), on: fmtDate(r.at) } : null;
}

function Status({ ci }: { ci: CheckIn }) {
  const signer = useSigner(ci);
  if (ci.reviewStatus !== "reviewed") return <ReviewBadge status={ci.reviewStatus} short />;
  if (signer) return <ReviewBadge status="reviewed" by={signer.by} on={signer.on} short />;
  return <StatusPill tone="muted">Closed, signer not on file</StatusPill>;
}

export function CheckInCard({ ci, defaultOpen }: { ci: CheckIn; defaultOpen?: boolean }) {
  const staff = useApp((s) => s.staff);
  const [open, setOpen] = useState(!!defaultOpen);
  const triggers = ci.answers.filter((a) => isTrigger(a.questionId, a.answer)).length;
  const panelId = `ci-${ci.id}`;

  return (
    <Card as="article" className="p-4 lg:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-[17px] font-semibold">{monthName(ci.month)} check-in</h2>
          <p className="text-caption-sm text-text-secondary">Submitted {fmtDayTime(ci.submittedAt)}</p>
        </div>
        <Status ci={ci} />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {ci.wantsContact && (
          <span className="inline-flex items-center gap-1 h-6 px-2.5 rounded-full text-[12px] font-medium bg-warning-tint text-[#92400E]">
            <Icon name="call" size={14} />
            Asked to be contacted
          </span>
        )}
        {triggers > 0 && (
          <StatusPill tone="warning">
            {triggers} {triggers === 1 ? "answer" : "answers"} triggered a staff task
          </StatusPill>
        )}
        {ci.assignedTo && <StatusPill tone="accent">Assigned to {whoName(ci.assignedTo, staff)}</StatusPill>}
      </div>

      {ci.comment && (
        <blockquote className="mt-3 p-3 rounded-xl bg-surface-alt border-l-2 border-accent-fill text-caption-sm leading-relaxed">
          <span className="block text-[11px] text-text-tertiary mb-0.5">Patient comment</span>&ldquo;{ci.comment}&rdquo;
        </blockquote>
      )}

      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
        className="mt-3 h-11 -mx-2 px-2 rounded-xl inline-flex items-center gap-1 text-accent-fill font-semibold text-[14px] hover:bg-accent-tint"
      >
        <Icon name={open ? "expand_less" : "expand_more"} size={20} />
        {open ? "Hide answers" : `Show ${ci.answers.length} answers`}
      </button>

      {open && (
        <ol id={panelId} className="mt-2 divide-y divide-border/60 border-t border-border/60">
          {ci.answers.map((a) => {
            const q = checkInQuestions.find((x) => x.id === a.questionId);
            const hit = isTrigger(a.questionId, a.answer);
            return (
              <li key={a.questionId} className={clsx("py-3 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4", hit && "bg-warning-tint/40 -mx-4 px-4 lg:-mx-5 lg:px-5")}>
                <p className="text-[13px] text-text-secondary sm:max-w-[60%]">{q?.text ?? a.questionId}</p>
                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  <span className={clsx("text-[14px] font-semibold", hit && "text-[#92400E]")}>{a.answer}</span>
                  {hit && (
                    <span className="inline-flex items-center gap-1 h-6 px-2 rounded-full text-[11px] font-semibold bg-warning-tint text-[#92400E] border border-warning/30">
                      <Icon name="task_alt" size={13} />
                      Triggered staff task
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </Card>
  );
}
