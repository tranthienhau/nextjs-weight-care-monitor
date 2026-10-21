"use client";

import { C, Sparkline } from "@/components/charts";
import { Card, Icon, ReviewBadge } from "@/components/ui";
import { fmtDate, fmtDay, signed } from "@/lib/format";
import { whoName } from "@/lib/selectors";
import { useApp } from "@/lib/store";
import type { LabResult } from "@/lib/types";

/** Reference range with the unit appended (as the lab reported it). */
const ref = (l: LabResult) => (l.refRange === "Not reported" ? "Not reported" : `${l.refRange} ${l.unit}`);

export function HbA1cCard({ results }: { results: LabResult[] }) {
  const asc = [...results].sort((a, b) => a.collectedOn.localeCompare(b.collectedOn));
  const last = asc[asc.length - 1];
  const change = asc.length > 1 ? Math.round((last.value - asc[0].value) * 10) / 10 : null;
  return (
    <Card as="article" className="p-5">
      <div className="flex justify-between items-start gap-2">
        <div>
          <span className="text-caption-sm text-text-secondary tracking-wide uppercase">Biomarker</span>
          <h2 className="font-serif text-[22px] leading-7 font-bold mt-0.5">HbA1c</h2>
        </div>
        {change != null && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent-tint text-accent-fill text-caption-sm">
            {signed(change)} {last.unit} since {fmtDay(asc[0].collectedOn)}
          </span>
        )}
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-4xl font-bold tracking-tight">{last.value}</span>
        <span className="text-title-md text-text-secondary">{last.unit}</span>
        {last.flag && <FlagChip flag={last.flag} />}
      </div>
      <p className="text-caption-sm text-text-secondary mt-1">
        Ref {ref(last)} (lab reported) - {last.lab}, {fmtDate(last.collectedOn)}
      </p>
      {asc.length > 1 && (
        <div className="mt-4 pt-3 border-t border-border/80">
          <Sparkline values={asc.map((l) => l.value)} color={C.fill} height={72} />
          <div className="flex justify-between text-caption-sm mt-1 px-1">
            {asc.map((l, i) => (
              <div key={l.id} className={i === 0 ? "text-left" : i === asc.length - 1 ? "text-right" : "text-center"}>
                <span className={`block font-semibold text-[12px] ${i === asc.length - 1 ? "text-accent-fill" : ""}`}>
                  {l.value} {l.unit}
                </span>
                <span className="text-[11px] text-text-tertiary">{fmtDay(l.collectedOn)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

function FlagChip({ flag }: { flag: "H" | "L" }) {
  return (
    <span
      aria-label={`Lab flag ${flag}`}
      title="Flag as printed on the lab report"
      className="inline-flex items-center justify-center min-w-6 h-6 px-1.5 rounded-full bg-warning-tint text-[#92400E] text-[11px] font-bold"
    >
      {flag}
    </span>
  );
}

export interface LabGroup {
  key: string;
  collectedOn: string;
  lab: string;
  items: LabResult[];
}

export const groupLabs = (labs: LabResult[]): LabGroup[] => {
  const map = new Map<string, LabGroup>();
  for (const l of labs) {
    const key = `${l.collectedOn}|${l.lab}`;
    const g = map.get(key) ?? { key, collectedOn: l.collectedOn, lab: l.lab, items: [] };
    g.items.push(l);
    map.set(key, g);
  }
  return [...map.values()].sort((a, b) => b.collectedOn.localeCompare(a.collectedOn));
};

function ReviewBlock({ items }: { items: LabResult[] }) {
  const staff = useApp((s) => s.staff);
  const pending = items.some((l) => l.reviewStatus !== "reviewed");
  const signed = items.find((l) => l.reviewStatus === "reviewed" && l.reviewedBy);
  const note = items.find((l) => l.reviewNote)?.reviewNote;
  const enteredBy = [...new Set(items.map((l) => whoName(l.enteredBy, staff)))].join(", ");
  return (
    <div className="p-4 space-y-3 bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-medium inline-flex items-center gap-1.5">
          <Icon name={pending ? "pending_actions" : "verified"} size={20} className={pending ? "text-accent-fill" : "text-success"} />
          Physician review
        </span>
        {pending ? (
          <ReviewBadge status="ready" />
        ) : (
          <ReviewBadge status="reviewed" by={whoName(signed?.reviewedBy, staff)} on={signed?.reviewedAt ? fmtDay(signed.reviewedAt) : undefined} />
        )}
      </div>
      {!pending && note && (
        <blockquote className="p-3 rounded-xl bg-surface-alt border-l-2 border-accent-fill text-caption-sm leading-relaxed">&ldquo;{note}&rdquo;</blockquote>
      )}
      <p className="text-[11px] text-text-tertiary">Entered by {enteredBy}</p>
    </div>
  );
}

export function LabGroupCard({ g }: { g: LabGroup }) {
  const report = g.items.find((l) => l.reportFile)?.reportFile;
  return (
    <section className="space-y-2.5">
      <div className="flex items-center gap-1.5 px-1 text-caption-sm font-medium">
        <Icon name="science" size={18} className="text-accent-fill" />
        Collected {fmtDate(g.collectedOn)} - {g.lab}
      </div>
      <Card className="divide-y divide-border overflow-hidden">
        <ul className="divide-y divide-border">
          {g.items.map((l) => (
            <li key={l.id} className="p-3.5 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="font-medium">{l.test}</span>
                <p className="text-[12px] text-text-tertiary">Ref: {ref(l)}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-title-md font-semibold">{l.value}</span>
                <span className="text-caption-sm text-text-secondary">{l.unit}</span>
                {l.flag ? <FlagChip flag={l.flag} /> : <span className="min-w-6" aria-hidden />}
              </div>
            </li>
          ))}
        </ul>
        {report && (
          <div className="p-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-danger-tint text-danger grid place-items-center shrink-0">
              <Icon name="picture_as_pdf" size={22} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-medium truncate">{report.name}</span>
                <Icon name="lock" size={14} className="text-text-tertiary" />
              </div>
              <p className="text-[12px] text-text-secondary">
                {report.pages} {report.pages === 1 ? "page" : "pages"} - {(report.sizeKb / 1000).toFixed(1)} MB - Encrypted
              </p>
            </div>
          </div>
        )}
        <ReviewBlock items={g.items} />
      </Card>
    </section>
  );
}
