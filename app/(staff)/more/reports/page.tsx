"use client";

import { localIso } from "@/lib/data";
import { useMemo, type ReactNode } from "react";
import { useApp } from "@/lib/store";
import { DEMO_TODAY, patients } from "@/lib/data";
import { roleChip, useCurrentUser } from "@/components/shell";
import { Card, Icon, PageHeader } from "@/components/ui";
import { buildQueue } from "@/components/review/queue";
import { BackLink } from "@/components/admin/common";
import { ExportCard } from "@/components/admin/ExportCard";
import { WeeklyBar } from "@/components/admin/WeeklyBar";

const TODAY = DEMO_TODAY.slice(0, 10);
const MONTH = DEMO_TODAY.slice(0, 7);
/** Demo baseline for weeks before this POC's seed data; live check-ins are added on top. */
const WEEKS = [
  { week: "Oct 1-7", from: "2026-10-01", to: "2026-10-07", base: 3 },
  { week: "Oct 8-14", from: "2026-10-08", to: "2026-10-14", base: 4 },
  { week: "Oct 15-21", from: "2026-10-15", to: "2026-10-21", base: 3 },
  { week: "Oct 22-28", from: "2026-10-22", to: "2026-10-28", base: 0 },
];

function Tile({ label, icon, value, foot }: { label: string; icon: string; value: string | number; foot: ReactNode }) {
  return (
    <Card className="p-4 flex flex-col justify-between">
      <div className="flex items-start justify-between gap-2">
        <span className="text-caption-sm text-text-secondary leading-tight">{label}</span>
        <Icon name={icon} size={18} className="text-text-tertiary" />
      </div>
      <div className="my-3 text-3xl font-bold text-text-primary">{value}</div>
      <div className="text-[12px] text-text-secondary">{foot}</div>
    </Card>
  );
}

export default function ReportsPage() {
  const { userId, role, staff: me } = useCurrentUser();
  const measurements = useApp((s) => s.measurements);
  const bpReadings = useApp((s) => s.bpReadings);
  const labResults = useApp((s) => s.labResults);
  const checkIns = useApp((s) => s.checkIns);
  const staff = useApp((s) => s.staff);
  const tasks = useApp((s) => s.tasks);

  const queue = useMemo(() => buildQueue({ measurements, bpReadings, labResults, checkIns, staff }), [measurements, bpReadings, labResults, checkIns, staff]);
  const active = patients.filter((p) => p.status === "active" || p.status === "new");
  const inactive = patients.length - active.length;
  const monthCheckIns = checkIns.filter((c) => c.month === MONTH);
  const overdue = active.filter((p) => p.checkInDue && p.checkInDue < TODAY && !monthCheckIns.some((c) => c.patientId === p.id)).length;
  const openTasks = tasks.filter((t) => !t.done);
  const measurable = active.filter((p) => p.status !== "new");
  const since = localIso(new Date(new Date(DEMO_TODAY).getTime() - 30 * 864e5)).slice(0, 10);
  const measured = measurable.filter((p) => measurements.some((m) => m.patientId === p.id && m.type === "weight" && m.value != null && m.measuredAt.slice(0, 10) >= since));
  const pct = measurable.length ? Math.round((measured.length / measurable.length) * 100) : 0;
  const weekly = WEEKS.map((w) => ({ week: w.week, count: w.base + checkIns.filter((c) => c.submittedAt.slice(0, 10) >= w.from && c.submittedAt.slice(0, 10) <= w.to).length }));
  const weeklyTotal = weekly.reduce((n, w) => n + w.count, 0);
  const activePct = (active.length / patients.length) * 100;

  return (
    <div className="flex flex-col gap-4">
      <BackLink />
      <PageHeader title="Reports" caption="Practice operations, October 2026" avatar={me?.avatar} role={roleChip(role)} />

      <div className="lg:grid lg:grid-cols-2 lg:gap-6 space-y-4 lg:space-y-0 lg:items-start">
        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-caption-sm text-text-secondary uppercase tracking-wider">Patient census</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-5xl font-bold tracking-tight">{patients.length}</span>
                  <span className="text-label-md text-text-secondary">enrolled patients</span>
                </div>
              </div>
              <span className="p-2.5 rounded-full bg-accent-tint text-accent-fill">
                <Icon name="monitoring" size={24} />
              </span>
            </div>
            <div className="mt-5 w-full h-3 rounded-full bg-surface-alt p-0.5 flex gap-1 overflow-hidden" role="img" aria-label={`${active.length} active, ${inactive} inactive`}>
              <div className="h-full bg-[#6784FE] rounded-l-full" style={{ width: `${activePct}%` }} />
              <div className="h-full bg-support rounded-r-full" style={{ width: `${100 - activePct}%` }} />
            </div>
            <div className="mt-4 flex items-center gap-4 pt-2 border-t border-border/70 text-caption-sm">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#6784FE]" />
                <span className="font-medium">{active.length}</span>
                <span className="text-text-secondary">Active</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-support" />
                <span className="font-medium">{inactive}</span>
                <span className="text-text-secondary">Inactive</span>
              </span>
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-3">
            <Tile
              label="Check-ins completed"
              icon="assignment_turned_in"
              value={monthCheckIns.length}
              foot={
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[12px] font-medium bg-warning-tint text-warning">
                  <span className="w-1.5 h-1.5 rounded-full bg-warning" />
                  {overdue} overdue
                </span>
              }
            />
            <Tile label="Awaiting MD review" icon="stethoscope" value={queue.length} foot="Patient records in queue" />
            <Tile label="Due for follow-up" icon="event_repeat" value={openTasks.length} foot="Open care team tasks" />
            <Tile label="Measurement completion" icon="straighten" value={`${pct}%`} foot="Weight entered in last 30 days" />
          </div>
        </div>

        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-[16px] font-semibold">Check-ins per week</h2>
                <p className="text-caption-sm text-text-secondary">October 2026</p>
              </div>
              <span className="text-title-md text-accent-fill font-bold">{weeklyTotal} total</span>
            </div>
            <WeeklyBar data={weekly} />
          </Card>

          {userId && <ExportCard userId={userId} role={role} />}
        </div>
      </div>
    </div>
  );
}
