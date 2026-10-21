"use client";

import clsx from "clsx";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { fmtDayTime } from "@/lib/format";
import { whoName } from "@/lib/selectors";
import type { AuditEvent } from "@/lib/types";
import { roleChip, useCurrentUser } from "@/components/shell";
import { Avatar, Card, Chip, Icon, PageHeader } from "@/components/ui";
import { BackLink, Note, avatarFor } from "@/components/admin/common";

type Filter = "all" | "sign" | "correct" | "export" | "access";
const FILTERS: { key: Filter; label: string; match: (a: AuditEvent["action"]) => boolean }[] = [
  { key: "all", label: "All", match: () => true },
  { key: "sign", label: "Sign", match: (a) => a === "sign" },
  { key: "correct", label: "Correct", match: (a) => a === "correct" },
  { key: "export", label: "Export", match: (a) => a === "export" },
  { key: "access", label: "Access", match: (a) => a === "access" || a === "sign-in" || a === "view" },
];

const actionStyle: Record<AuditEvent["action"], string> = {
  sign: "bg-success-tint text-[#15803D]",
  correct: "bg-warning-tint text-[#92400E]",
  export: "bg-accent-tint text-accent-fill",
  access: "bg-danger-tint text-danger",
  "sign-in": "bg-[#EEF0F6] text-text-tertiary",
  view: "bg-[#EEF0F6] text-text-tertiary",
  create: "bg-surface-alt text-text-secondary",
  update: "bg-surface-alt text-text-secondary",
};

export default function AuditPage() {
  const { role, staff: me } = useCurrentUser();
  const audit = useApp((s) => s.audit);
  const staff = useApp((s) => s.staff);
  const [filter, setFilter] = useState<Filter>("all");

  const sorted = [...audit].sort((a, b) => b.at.localeCompare(a.at));
  const f = FILTERS.find((x) => x.key === filter)!;
  const shown = sorted.filter((e) => f.match(e.action));

  return (
    <div className="flex flex-col gap-4">
      <BackLink />
      <PageHeader title="Audit log" caption={`${audit.length} entries`} avatar={me?.avatar} role={roleChip(role)} />
      <Note icon="history">Append-only. Entries cannot be edited or deleted.</Note>

      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5 lg:mx-0 lg:px-0 py-1" role="group" aria-label="Filter by action">
        {FILTERS.map((x) => (
          <Chip key={x.key} selected={filter === x.key} onClick={() => setFilter(x.key)}>
            {x.label} {sorted.filter((e) => x.match(e.action)).length}
          </Chip>
        ))}
      </div>

      <Card className="divide-y divide-border overflow-hidden">
        <div className="hidden lg:grid grid-cols-[150px_200px_100px_1fr] gap-4 px-5 py-3 text-caption-sm text-text-tertiary font-medium bg-surface-alt">
          <span>Time</span>
          <span>Who</span>
          <span>Action</span>
          <span>Target and detail</span>
        </div>
        {shown.length === 0 && <p className="p-6 text-center text-text-tertiary">No entries for this action.</p>}
        {shown.map((e) => {
          const avatar = avatarFor(e.by, staff);
          return (
            <article key={e.id} className="px-4 py-3.5 lg:px-5 flex flex-col gap-1.5 lg:grid lg:grid-cols-[150px_200px_100px_1fr] lg:gap-4 lg:items-center">
              <time dateTime={e.at} className="text-caption-sm text-text-tertiary order-2 lg:order-none">
                {fmtDayTime(e.at)}
              </time>
              <div className="flex items-center justify-between gap-2 lg:contents">
                <span className="flex items-center gap-2 min-w-0">
                  {avatar ? <Avatar src={avatar} alt="" size={28} /> : <Icon name="smart_toy" size={22} className="text-text-tertiary" />}
                  <span className="text-label-md font-semibold truncate">{whoName(e.by, staff)}</span>
                </span>
                <span className={clsx("inline-flex w-fit items-center h-6 px-2.5 rounded-full text-[12px] font-medium capitalize", actionStyle[e.action])}>{e.action}</span>
              </div>
              <div className="min-w-0 order-3 lg:order-none">
                <p className="text-[14px] text-text-primary">{e.target}</p>
                <p className="text-caption-sm text-text-secondary">{e.detail}</p>
              </div>
            </article>
          );
        })}
      </Card>
    </div>
  );
}
