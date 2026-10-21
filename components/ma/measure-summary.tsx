"use client";

import clsx from "clsx";
import type { ReactNode } from "react";
import { fmtDayTime, signed } from "@/lib/format";
import { Card, EstimateTag, Icon, SourceTag } from "@/components/ui";
import { AuditNote } from "./common";
import type { SourceOption } from "./measure-fields";

type Unit = "lb" | "kg";

export function DeltaPill({ delta, unit, prevDate }: { delta: number | null; unit: Unit; prevDate?: string }) {
  if (!prevDate) return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-tint text-accent-fill text-caption-sm font-semibold">First measurement for this patient</span>;
  if (delta == null) return <span className="text-caption-sm text-text-tertiary">Last visit {prevDate} - enter a weight to compare</span>;
  const down = delta < 0;
  return (
    <span className={clsx("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-caption-sm font-semibold", down ? "bg-success-tint text-success" : "bg-surface-alt text-text-secondary")}>
      <Icon name={down ? "trending_down" : delta > 0 ? "trending_up" : "trending_flat"} size={16} />
      Change from last visit: {signed(delta)} {unit}
    </span>
  );
}

export function Summary({
  source,
  at,
  rows,
  delta,
  action,
}: {
  source: SourceOption;
  at: string;
  rows: { label: string; value: string; unit: string; estimate: boolean }[];
  delta: ReactNode;
  action: ReactNode;
}) {
  return (
    <Card className="p-5 rounded-[20px]">
      <h2 className="text-title-md font-semibold mb-1">Summary</h2>
      <p className="text-caption-sm text-text-secondary mb-4">{fmtDayTime(at)}</p>
      <ul className="divide-y divide-border/70 mb-4">
        {rows.map((r) => (
          <li key={r.label} className="flex items-center justify-between py-2.5 gap-2">
            <span className="flex items-center gap-2 text-[14px] text-text-secondary">
              {r.label}
              {r.estimate && <EstimateTag />}
            </span>
            <span className={clsx("text-[15px]", r.value ? "font-semibold text-text-primary" : "text-text-tertiary")}>{r.value ? `${r.value}${r.unit ? (r.unit === "%" ? " %" : ` ${r.unit}`) : ""}` : "Not measured"}</span>
          </li>
        ))}
      </ul>
      <div className="mb-4">{delta}</div>
      <SourceTag patient={source.patient} className="mb-5">
        {source.source}
      </SourceTag>
      {action}
      <AuditNote />
    </Card>
  );
}
