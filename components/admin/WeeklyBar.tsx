"use client";

import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { C } from "@/components/charts";

export function WeeklyBar({ data, height = 180 }: { data: { week: string; count: number }[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 18, right: 4, left: -24, bottom: 0 }}>
        <CartesianGrid stroke={C.grid} strokeDasharray="4 4" vertical={false} />
        <XAxis dataKey="week" stroke={C.text} fontSize={11} tickLine={false} axisLine={false} />
        <YAxis stroke={C.text} fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip cursor={{ fill: "#E9EDFF" }} contentStyle={{ borderRadius: 12, border: `1px solid ${C.grid}`, fontSize: 12 }} formatter={(v) => [`${v} check-ins`, ""]} separator="" />
        <Bar dataKey="count" fill={C.accent} radius={[8, 8, 0, 0]} maxBarSize={36}>
          <LabelList dataKey="count" position="top" fill={C.text} fontSize={11} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
