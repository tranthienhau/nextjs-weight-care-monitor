"use client";

import clsx from "clsx";
import type { ReactNode } from "react";
import type { Staff } from "@/lib/types";
import { Avatar, Card, Icon, ReviewBadge, StatusPill, Toggle, inputCls } from "@/components/ui";
import type { ReviewItem } from "./items";

export function CardHead({ icon, title, right }: { icon: string; title: string; right?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2 mb-3">
      <div className="flex items-center gap-2">
        <Icon name={icon} size={20} className="text-accent-fill" />
        <h2 className="text-[15px] font-semibold text-text-primary">{title}</h2>
      </div>
      {right}
    </div>
  );
}

export function ItemsCard({ items, checked, onToggle }: { items: ReviewItem[]; checked: Set<string>; onToggle: (id: string) => void }) {
  return (
    <Card className="p-4">
      <CardHead
        icon="checklist"
        title="Items in this review"
        right={<span className="text-[12px] text-text-secondary bg-surface-alt px-2 py-0.5 rounded-full border border-border">{checked.size} selected</span>}
      />
      {items.length === 0 ? (
        <p className="text-caption-sm text-text-tertiary py-2">Nothing is awaiting review for this patient.</p>
      ) : (
        <ul className="space-y-2.5">
          {items.map((it) => {
            const warn = it.status === "flagged";
            return (
              <li key={it.id}>
                <label
                  className={clsx(
                    "flex items-start gap-3 p-3 rounded-control border cursor-pointer transition-colors min-h-11",
                    warn ? "bg-[#FFFDF7] border-[#FDE68A] hover:bg-[#FEF9E7]" : "bg-surface-alt/70 border-border hover:bg-surface-alt",
                  )}
                >
                  <input type="checkbox" checked={checked.has(it.id)} onChange={() => onToggle(it.id)} className="mt-1 w-4 h-4 accent-[#3451D1]" />
                  <span className="flex-1 min-w-0">
                    <span className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-[14px] font-semibold text-text-primary">{it.title}</span>
                      <span className="flex items-center gap-1.5">
                        {it.extra && <StatusPill tone={it.extra.tone}>{it.extra.text}</StatusPill>}
                        <ReviewBadge status={it.status} short />
                      </span>
                    </span>
                    <span className="block text-[12px] text-text-secondary mt-0.5">{it.sub}</span>
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

function ToggleHead({ icon, title, sub, on, onChange }: { icon: string; title: string; sub: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <span className="w-8 h-8 rounded-full bg-accent-tint grid place-items-center text-accent-fill shrink-0">
          <Icon name={icon} size={18} />
        </span>
        <div>
          <h3 className="text-[14px] font-semibold text-text-primary">{title}</h3>
          <p className="text-[12px] text-text-secondary">{sub}</p>
        </div>
      </div>
      <Toggle on={on} onChange={onChange} label={title} />
    </div>
  );
}

export interface TaskDraft {
  on: boolean;
  assigneeId: string;
  due: string;
  title: string;
}

export function FollowUpCard({ draft, onChange, mas }: { draft: TaskDraft; onChange: (d: TaskDraft) => void; mas: Staff[] }) {
  const assignee = mas.find((m) => m.id === draft.assigneeId);
  return (
    <Card className="p-4">
      <ToggleHead icon="add_task" title="Create follow-up task" sub="Assign follow-up to the care team" on={draft.on} onChange={(on) => onChange({ ...draft, on })} />
      {draft.on && (
        <div className="mt-3.5 pt-3.5 border-t border-border space-y-3">
          <label className="block">
            <span className="block text-caption-sm text-text-secondary mb-1.5">Assignee</span>
            <span className="flex items-center gap-2">
              {assignee && <Avatar src={assignee.avatar} alt="" size={36} />}
              <select className={inputCls} value={draft.assigneeId} onChange={(e) => onChange({ ...draft, assigneeId: e.target.value })}>
                {mas.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}, MA
                  </option>
                ))}
              </select>
            </span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <label className="block">
              <span className="block text-caption-sm text-text-secondary mb-1.5">Due date</span>
              <input type="date" className={inputCls} value={draft.due} min="2026-10-22" onChange={(e) => onChange({ ...draft, due: e.target.value })} />
            </label>
            <label className="block">
              <span className="block text-caption-sm text-text-secondary mb-1.5">Task title</span>
              <input className={inputCls} value={draft.title} onChange={(e) => onChange({ ...draft, title: e.target.value })} placeholder="e.g. Collect home BP log" />
            </label>
          </div>
        </div>
      )}
    </Card>
  );
}

export function MessageCard({
  on,
  onToggle,
  body,
  onBody,
  signer,
  patientFirst,
}: {
  on: boolean;
  onToggle: (v: boolean) => void;
  body: string;
  onBody: (v: string) => void;
  signer?: Staff;
  patientFirst: string;
}) {
  return (
    <Card className="p-4">
      <ToggleHead icon="chat_bubble" title="Send clinician-reviewed message to patient" sub="Delivered to the patient portal" on={on} onChange={onToggle} />
      {on && (
        <div className="mt-3.5 pt-3.5 border-t border-border space-y-3">
          <label className="block">
            <span className="block text-caption-sm text-text-secondary mb-1.5">Message to {patientFirst}</span>
            <textarea rows={3} className={clsx(inputCls, "h-auto py-3 resize-none")} value={body} onChange={(e) => onBody(e.target.value)} placeholder={`Hi ${patientFirst}, ...`} />
          </label>
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-wider text-text-tertiary mb-2">Patient preview</p>
            <div className="bg-surface-alt rounded-control p-3 border border-border space-y-2">
              <div className="flex items-center gap-2">
                {signer && <Avatar src={signer.avatar} alt="" size={20} />}
                <span className="text-[12px] font-medium text-text-primary">{signer?.name ?? "Physician"}</span>
                <span className="text-[12px] text-text-tertiary ml-auto">Just now</span>
              </div>
              <div className="bg-surface rounded-lg p-3 text-[13px] leading-relaxed text-text-primary border border-border/80 shadow-card-sm">
                {body || <span className="text-text-tertiary">Your message will appear here.</span>}
              </div>
              <span className="inline-flex items-center gap-1 text-[12px] font-medium text-[#15803D] bg-success-tint rounded-full px-2 py-0.5">
                <Icon name="verified" size={13} />
                Reviewed and sent by {signer?.shortName ?? "the physician"}
              </span>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
