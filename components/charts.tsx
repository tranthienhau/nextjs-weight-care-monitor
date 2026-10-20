"use client";

import { Area, AreaChart, CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { fmtDay } from "@/lib/format";

export const C = {
  accent: "#6784FE",
  fill: "#4165FE",
  support: "#F7979A",
  grid: "#E2E6F2",
  text: "#8A90A8",
  warning: "#D97706",
};

const axis = { stroke: C.text, fontSize: 11, tickLine: false, axisLine: false } as const;

export interface Point {
  at: string;
  value: number | null;
}

/**
 * Trend line with a soft area. `null` values render as a visible gap
 * (missing data is never drawn as zero).
 */
export function TrendChart({ data, color = C.accent, unit, height = 220, domain }: { data: Point[]; color?: string; unit?: string; height?: number; domain?: [number | "auto", number | "auto"] }) {
  const rows = data.map((d) => ({ x: fmtDay(d.at), v: d.value }));
  const id = `g-${color.replace("#", "")}`;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={rows} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.28} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={C.grid} vertical={false} />
        <XAxis dataKey="x" {...axis} />
        <YAxis {...axis} domain={domain ?? ["dataMin - 3", "dataMax + 3"]} tickFormatter={(v: number) => String(Math.round(v))} />
        <Tooltip
          contentStyle={{ borderRadius: 12, border: `1px solid ${C.grid}`, boxShadow: "0 2px 10px rgba(65,101,254,.18)", fontSize: 12 }}
          formatter={(v) => [v == null ? "No reading" : `${v}${unit ? " " + unit : ""}`, ""]}
          separator=""
        />
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2.5} fill={`url(#${id})`} connectNulls={false} dot={{ r: 3.5, fill: "#fff", stroke: color, strokeWidth: 2 }} activeDot={{ r: 5 }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/** Systolic + diastolic with the practice review-rule threshold. */
export function BpChart({ data, threshold, height = 220 }: { data: { at: string; sys: number; dia: number }[]; threshold: number; height?: number }) {
  const rows = data.map((d) => ({ x: fmtDay(d.at), sys: d.sys, dia: d.dia }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={rows} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid stroke={C.grid} vertical={false} />
        <XAxis dataKey="x" {...axis} />
        <YAxis {...axis} domain={[60, 160]} />
        <Tooltip contentStyle={{ borderRadius: 12, border: `1px solid ${C.grid}`, fontSize: 12 }} />
        <ReferenceLine y={threshold} stroke={C.warning} strokeDasharray="6 4" label={{ value: `Practice review rule ${threshold}`, position: "insideTopRight", fill: C.warning, fontSize: 11 }} />
        <Line type="monotone" dataKey="sys" name="Systolic" stroke={C.fill} strokeWidth={2.5} dot={{ r: 3.5, fill: "#fff", strokeWidth: 2 }} />
        <Line type="monotone" dataKey="dia" name="Diastolic" stroke={C.support} strokeWidth={2.5} dot={{ r: 3.5, fill: "#fff", strokeWidth: 2 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

/** Tiny sparkline for hero cards (white on gradient by default). */
export function Sparkline({ values, color = "#fff", height = 48 }: { values: number[]; color?: string; height?: number }) {
  const rows = values.map((v, i) => ({ i, v }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={rows} margin={{ top: 6, right: 6, left: 6, bottom: 6 }}>
        <YAxis hide domain={["dataMin", "dataMax"]} />
        <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2.5} dot={false} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
