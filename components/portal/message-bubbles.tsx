"use client";

import { Avatar, Icon } from "@/components/ui";
import { fmtDayTime } from "@/lib/format";
import { getStaff, whoName } from "@/lib/selectors";
import type { Message, Staff } from "@/lib/types";

export function DateDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center my-1">
      <span className="bg-surface px-3 py-1 rounded-full border border-border text-caption-sm text-text-tertiary">{label}</span>
    </div>
  );
}

const Time = ({ at, className = "text-text-tertiary" }: { at: string; className?: string }) => (
  <time dateTime={at} className={`text-[11px] ${className}`}>
    {fmtDayTime(at)}
  </time>
);

function SystemBubble({ m }: { m: Message }) {
  return (
    <div className="self-start max-w-[88%] bg-surface-alt border border-border rounded-2xl rounded-tl-sm p-3.5 flex flex-col gap-2">
      <span className="self-start inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EEF0F6] text-text-secondary">
        <Icon name="notifications" size={15} />
        <span className="text-caption-sm font-medium">Automated reminder</span>
      </span>
      <p className="text-[15px] leading-snug text-text-primary">{m.body}</p>
      <span className="self-end">
        <Time at={m.at} />
      </span>
    </div>
  );
}

function PatientBubble({ m }: { m: Message }) {
  return (
    <div className="self-end max-w-[82%] bg-accent-fill text-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-card-sm flex flex-col gap-1.5">
      <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">{m.body}</p>
      <div className="flex items-center justify-end gap-1">
        <Time at={m.at} className="text-white/75" />
        <Icon name="done_all" size={14} className="text-white/80" />
      </div>
    </div>
  );
}

function ClinicianBubble({ m, staff }: { m: Message; staff: Staff[] }) {
  const author = getStaff(m.from, staff);
  return (
    <article className="self-start w-full max-w-xl bg-surface border border-border rounded-2xl rounded-tl-sm p-4 shadow-card flex flex-col gap-3">
      <div className="flex items-center gap-2.5 border-b border-surface-alt pb-3">
        {author && <Avatar src={author.avatar} alt="" size={32} />}
        <div className="flex flex-col min-w-0">
          <span className="text-[15px] font-semibold leading-tight text-text-primary truncate">{author?.name ?? "Care team"}</span>
          <span className="text-[12px] text-text-secondary">{author?.title ?? "Care team"}</span>
        </div>
      </div>
      <p className="text-[15px] text-text-primary leading-relaxed whitespace-pre-wrap break-words">{m.body}</p>
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        {m.reviewedBy ? (
          <span className="inline-flex items-center gap-1 bg-success-tint text-[#15803D] px-2.5 py-1 rounded-full text-[11px] font-semibold">
            <Icon name="verified" size={14} />
            Reviewed and sent by {whoName(m.reviewedBy, staff)}
          </span>
        ) : (
          <span className="text-[11px] text-text-tertiary">Sent by your care team</span>
        )}
        <Time at={m.at} />
      </div>
    </article>
  );
}

export function MessageBubble({ m, staff }: { m: Message; staff: Staff[] }) {
  if (m.from === "system") return <SystemBubble m={m} />;
  if (m.from === "patient") return <PatientBubble m={m} />;
  return <ClinicianBubble m={m} staff={staff} />;
}
