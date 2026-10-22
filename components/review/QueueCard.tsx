"use client";

import clsx from "clsx";
import Link from "next/link";
import { useApp } from "@/lib/store";
import { fmtDay, fmtVal } from "@/lib/format";
import { latest } from "@/lib/selectors";
import { Avatar, Icon, ReviewBadge } from "@/components/ui";
import { planMed, type QueueCard as Q } from "./queue";

const reasonIcon: Record<Q["reason"]["kind"], { icon: string; cls: string }> = {
  bp: { icon: "flag", cls: "text-warning" },
  checkin: { icon: "contact_support", cls: "text-accent-fill" },
  labs: { icon: "science", cls: "text-accent-fill" },
  measurement: { icon: "scale", cls: "text-accent-fill" },
};

export function QueueCard({ card }: { card: Q }) {
  const measurements = useApp((s) => s.measurements);
  const reviews = useApp((s) => s.reviews);
  const { patient: p, reason } = card;
  const w = latest(measurements, p.id, "weight");
  const lastReview = reviews.filter((r) => r.patientId === p.id).sort((a, b) => b.at.localeCompare(a.at))[0];
  const ri = reason.kind === "bp" && !card.flagged ? { icon: "monitor_heart", cls: "text-accent-fill" } : reasonIcon[reason.kind];

  return (
    <Link
      href={`/review/${p.id}`}
      className="block bg-surface rounded-2xl p-4 shadow-card border border-border/70 hover:border-accent/50 transition-all active:scale-[0.99]"
    >
      <article className="flex flex-col gap-2.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar src={p.avatar} alt="" size={48} className="border border-border" />
            <div className="min-w-0">
              <h2 className="text-body-md font-bold text-text-primary leading-snug truncate">{p.name}</h2>
              <p className="text-caption-sm text-text-secondary truncate">
                {p.age}y - Wk {p.programWeek} - {planMed(p.id)}
              </p>
            </div>
          </div>
          <ReviewBadge status={card.flagged ? "flagged" : "ready"} short />
        </div>

        <div className="bg-surface-alt rounded-xl p-2.5 flex items-start gap-2 border border-border/50">
          <Icon name={ri.icon} size={18} className={clsx("shrink-0", ri.cls)} />
          <div className="text-caption-sm text-text-primary leading-snug">
            <p>
              <span className={clsx("font-bold", card.flagged && reason.kind === "bp" ? "text-warning" : "text-accent-fill")}>{reason.strong}</span>
              {reason.text}
            </p>
            {card.more.length > 0 && <p className="text-text-tertiary mt-0.5">Also: {card.more.join(", ")}</p>}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/40 text-text-tertiary text-caption-sm">
          <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
            <Icon name="scale" size={15} />
            <span>
              Latest <strong className="text-text-primary">{fmtVal(w?.value ?? null, "lb")}</strong>
            </span>
            <span aria-hidden>-</span>
            <span>{lastReview ? `Last review ${fmtDay(lastReview.at)}` : "No review yet"}</span>
          </div>
          <span className="flex items-center gap-0.5 text-accent-fill font-semibold shrink-0">
            Review
            <Icon name="chevron_right" size={18} />
          </span>
        </div>
      </article>
    </Link>
  );
}
