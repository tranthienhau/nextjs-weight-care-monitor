"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useApp } from "@/lib/store";
import { images } from "@/lib/data";
import { fmtTime } from "@/lib/format";
import { roleChip, useCurrentUser } from "@/components/shell";
import { Button, Chip, EmptyState, HeroCard, Icon, PageHeader } from "@/components/ui";
import { buildQueue, daysSince, type QueueKind } from "@/components/review/queue";
import { QueueCard } from "@/components/review/QueueCard";

type Filter = "all" | "flaggedBp" | "labs" | "checkin";

function SignedBanner() {
  const signed = useSearchParams().get("signed");
  if (!signed) return null;
  return (
    <div role="status" className="flex items-center gap-2 rounded-2xl bg-success-tint text-[#15803D] p-3.5 text-label-md">
      <Icon name="check_circle" size={20} />
      Review signed for {signed}. Saved to the audit log.
    </div>
  );
}

export default function ReviewQueuePage() {
  const { staff: me, role } = useCurrentUser();
  const measurements = useApp((s) => s.measurements);
  const bpReadings = useApp((s) => s.bpReadings);
  const labResults = useApp((s) => s.labResults);
  const checkIns = useApp((s) => s.checkIns);
  const staff = useApp((s) => s.staff);
  const reviews = useApp((s) => s.reviews);
  const [filter, setFilter] = useState<Filter>("all");

  const queue = useMemo(
    () => buildQueue({ measurements, bpReadings, labResults, checkIns, staff }),
    [measurements, bpReadings, labResults, checkIns, staff],
  );
  const has = (k: QueueKind) => queue.filter((c) => c.kinds.includes(k));
  const counts = { all: queue.length, flaggedBp: queue.filter((c) => c.flagged).length, labs: has("labs").length, checkin: has("checkin").length };
  const shown = queue.filter((c) =>
    filter === "all" ? true : filter === "flaggedBp" ? c.flagged : filter === "labs" ? c.kinds.includes("labs") : c.kinds.includes("checkin"),
  );
  const oldestDays = queue.length ? Math.max(...queue.map((c) => daysSince(c.oldest))) : 0;
  const lastReview = [...reviews].sort((a, b) => b.at.localeCompare(a.at))[0];
  const readOnly = role !== "physician";

  const chips: { key: Filter; label: string; dot?: boolean }[] = [
    { key: "all", label: "All" },
    { key: "flaggedBp", label: "Flagged BP", dot: true },
    { key: "labs", label: "Labs" },
    { key: "checkin", label: "Check-ins" },
  ];

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Review" caption="Physician-led triage queue" avatar={me?.avatar} role={roleChip(role)} />
      <Suspense fallback={null}>
        <SignedBanner />
      </Suspense>

      {readOnly && (
        <div className="flex items-start gap-2.5 rounded-2xl bg-accent-tint/60 p-3.5 text-caption-sm text-text-secondary">
          <Icon name="lock" size={18} className="text-accent-fill shrink-0" />
          <p>
            <strong className="text-text-primary font-semibold">Read-only.</strong> Only a physician can sign reviews.
          </p>
        </div>
      )}

      {queue.length > 0 && (
        <HeroCard>
          <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-white/10 blur-xl pointer-events-none" />
          <div className="relative">
            <span className="inline-flex items-center gap-1.5 bg-black/20 border border-white/25 rounded-full px-3 py-1 text-[12px] font-semibold tracking-wide uppercase">
              <Icon name="flag" size={14} />
              Clinician queue
            </span>
            <div className="flex items-baseline gap-2 mt-3 mb-1 flex-wrap">
              <span className="text-5xl font-bold leading-none">{queue.length}</span>
              <span className="text-lg font-semibold text-white/95">{queue.length === 1 ? "record" : "records"} awaiting your review</span>
            </div>
            <p className="text-caption-sm text-white/90 flex items-center gap-1.5 mt-1">
              <Icon name="schedule" size={15} />
              Oldest waiting {oldestDays} {oldestDays === 1 ? "day" : "days"}
            </p>
          </div>
        </HeroCard>
      )}

      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar -mx-5 px-5 lg:mx-0 lg:px-0 py-1" role="group" aria-label="Filter queue">
        {chips.map((c) => (
          <Chip key={c.key} selected={filter === c.key} onClick={() => setFilter(c.key)}>
            {c.dot && <span className="w-2 h-2 rounded-full bg-warning" aria-hidden />}
            {c.key === "all" ? `All (${counts.all})` : `${c.label} ${counts[c.key]}`}
          </Chip>
        ))}
      </div>

      {queue.length === 0 ? (
        <div className="lg:max-w-xl">
          <EmptyState
            image={images.emptyDesk}
            title="All records reviewed"
            body="New entries from your care team will appear here."
            action={
              <>
                {lastReview && (
                  <p className="flex items-center justify-center gap-1.5 -mt-4 mb-6 text-caption-sm text-text-tertiary">
                    <Icon name="check_circle" size={16} className="text-success" />
                    Last review signed {fmtTime(lastReview.at)}
                  </p>
                )}
                <Button variant="secondary" href="/more/audit" icon="history" full>
                  View recent reviews
                </Button>
              </>
            }
          />
        </div>
      ) : shown.length === 0 ? (
        <p className="text-center text-text-tertiary py-10">Nothing in this filter.</p>
      ) : (
        <div className="flex flex-col gap-3.5 lg:grid lg:grid-cols-2 lg:gap-4">
          {shown.map((c) => (
            <QueueCard key={c.patient.id} card={c} />
          ))}
        </div>
      )}

      <div className="flex items-start gap-2.5 rounded-2xl bg-accent-tint/60 p-3.5 text-[12px] leading-[17px] text-text-secondary">
        <Icon name="info" size={18} className="text-accent-fill shrink-0" />
        <p>Flags come from practice review rules and mean please review, not a diagnosis.</p>
      </div>
    </div>
  );
}
