"use client";

import { localIso } from "@/lib/data";
import { C, TrendChart, type Point } from "@/components/charts";
import { Card, EstimateTag } from "@/components/ui";
import { fmtDay, fmtVal } from "@/lib/format";
import type { Measurement } from "@/lib/types";

const GAP_DAYS = 21;

/** Numeric y-domain around the series values. */
const pad = (series: Measurement[], by: number): [number, number] | undefined => {
  const v = series.map((m) => m.value).filter((x): x is number => x != null);
  return v.length ? [Math.floor(Math.min(...v) - by), Math.ceil(Math.max(...v) + by)] : undefined;
};
const day = 864e5;

/** Series to chart points, inserting a null point for gaps > 21 days so the chart breaks. */
export function withGaps(series: Measurement[]): { points: Point[]; gaps: { from: string; to: string }[] } {
  const points: Point[] = [];
  const gaps: { from: string; to: string }[] = [];
  series.forEach((m, i) => {
    const prev = series[i - 1];
    if (prev) {
      const a = new Date(prev.measuredAt).getTime();
      const b = new Date(m.measuredAt).getTime();
      if (b - a > GAP_DAYS * day) {
        points.push({ at: localIso(new Date((a + b) / 2)), value: null });
        gaps.push({ from: prev.measuredAt, to: m.measuredAt });
      }
    }
    points.push({ at: m.measuredAt, value: m.value });
  });
  return { points, gaps };
}

function GapCaption({ gaps }: { gaps: { from: string; to: string }[] }) {
  if (!gaps.length) return null;
  return (
    <p className="mt-2 flex flex-wrap items-center gap-1.5 text-[12px] text-text-secondary">
      <span className="w-1.5 h-1.5 rounded-full bg-text-tertiary" />
      {gaps.map((g) => (
        <span key={g.from}>
          No reading between {fmtDay(g.from)} and {fmtDay(g.to)}
        </span>
      ))}
    </p>
  );
}

export function WeightTrendCard({ series }: { series: Measurement[] }) {
  const { points, gaps } = withGaps(series);
  const last = series[series.length - 1];
  return (
    <Card className="p-4 lg:p-5">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent-fill" />
          <h2 className="text-[17px] font-semibold tracking-tight">Weight trend</h2>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-accent-tint text-accent-fill text-caption-sm font-semibold">
          Current: {fmtVal(last?.value, "lb")}
        </span>
      </div>
      {series.length ? (
        <TrendChart data={points} color={C.fill} unit="lb" height={224} />
      ) : (
        <p className="py-10 text-center text-text-tertiary text-body-md">No reading in this range</p>
      )}
      <GapCaption gaps={gaps} />
    </Card>
  );
}

export function BodyFatCard({ series, muscle, fatFree }: { series: Measurement[]; muscle?: Measurement; fatFree?: Measurement }) {
  const { points, gaps } = withGaps(series);
  const last = series[series.length - 1];
  const first = series.find((m) => m.value != null);
  const delta = last?.value != null && first?.value != null ? Math.round((last.value - first.value) * 10) / 10 : null;
  return (
    <Card className="p-4 lg:p-5">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <div className="flex items-center gap-1.5">
            <h2 className="text-[16px] font-semibold tracking-tight">Body fat % (estimate)</h2>
            <EstimateTag />
          </div>
          <p className="text-[12px] text-text-tertiary">Bioimpedance estimate from the body pod</p>
        </div>
        <div className="text-right shrink-0">
          <span className="text-[18px] font-bold">{fmtVal(last?.value, "%")}</span>
          {delta != null && <div className="text-[12px] text-text-secondary">{delta > 0 ? "+" : ""}{delta} % in range</div>}
        </div>
      </div>
      {series.length ? (
        <TrendChart data={points} color={C.support} unit="%" height={160} domain={pad(series, 1)} />
      ) : (
        <p className="py-8 text-center text-text-tertiary text-body-md">No reading in this range</p>
      )}
      <GapCaption gaps={gaps} />
      <div className="grid grid-cols-2 gap-2 pt-3 mt-2 border-t border-border/50">
        {[
          { label: "Muscle mass", m: muscle },
          { label: "Fat-free mass", m: fatFree },
        ].map(({ label, m }) => (
          <div key={label} className="bg-surface-alt p-2.5 rounded-xl border border-border/40">
            <div className="text-[12px] text-text-secondary">{label}</div>
            <div className="text-[15px] font-semibold mt-0.5">
              {fmtVal(m?.value, "lb")} {m?.value != null && <span className="text-[12px] font-normal text-text-tertiary">(Est.)</span>}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
