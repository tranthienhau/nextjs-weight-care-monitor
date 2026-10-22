"use client";

import Link from "next/link";
import { DEMO_TODAY, patients, PRACTICE_NAME } from "@/lib/data";
import { latest } from "@/lib/selectors";
import { fmtTime, fmtWeekday } from "@/lib/format";
import type { Patient } from "@/lib/types";
import { Avatar, Card, HeroCard, Icon, ReviewBadge, StatusPill } from "@/components/ui";
import { roleChip, useCurrentUser } from "@/components/shell";
import { addDays, awaitingMd, checkInOverdue, greetingName, pendingStatus, TODAY, useReviewItems, type ReviewItems } from "@/components/ma/status";

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

export default function TodayPage() {
  const { staff, role } = useCurrentUser();
  const items = useReviewItems();

  const visits = patients.filter((p) => p.nextVisit?.at.startsWith(TODAY)).sort((a, b) => a.nextVisit!.at.localeCompare(b.nextVisit!.at));
  const cutoff = addDays(TODAY, -21);
  const missing = patients.filter((p) => p.status === "active" && (latest(items.measurements, p.id, "weight")?.measuredAt.slice(0, 10) ?? "") < cutoff).length;
  const ready = patients.filter((p) => awaitingMd(p.id, items)).length;
  const overdue = patients.filter((p) => p.status === "active" && checkInOverdue(p)).length;

  const office = visits.filter((p) => p.nextVisit!.kind === "Office visit").length;
  const remote = visits.length - office;
  const morningLeft = visits.filter((p) => p.nextVisit!.at > DEMO_TODAY && p.nextVisit!.at.slice(11) < "12:00").length;

  return (
    <div className="flex flex-col gap-5 lg:gap-6 pb-4">
      <header className="flex items-center justify-between gap-3 pt-2">
        <div className="min-w-0">
          <h1 className="font-serif text-[26px] leading-8 lg:text-[36px] lg:leading-[44px] font-bold tracking-[-0.02em] text-text-primary">Good morning, {greetingName(staff)}</h1>
          <p className="text-caption-sm text-text-secondary mt-0.5">{PRACTICE_NAME} - Pod B</p>
        </div>
        {staff && (
          <div className="flex items-center gap-2 bg-surface pl-1.5 pr-2 py-1 rounded-full shadow-clinical border border-border shrink-0 lg:hidden">
            <Avatar src={staff.avatar} alt={staff.name} size={36} />
            <span className="px-2 py-0.5 rounded-full bg-accent-tint text-accent-fill text-[12px] font-semibold tracking-wide">{roleChip(role)}</span>
          </div>
        )}
      </header>

      <div className="flex flex-col gap-5 lg:grid lg:grid-cols-[1.25fr_1fr] lg:gap-6">
        <HeroCard className="rounded-[20px]">
          <div className="absolute -right-10 -bottom-10 w-36 h-36 rounded-full bg-white/10 blur-xl pointer-events-none" />
          <div className="relative">
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/20 backdrop-blur-md">
                <Icon name="calendar_today" size={15} />
                <span className="text-[12px] uppercase tracking-wider font-semibold">Today&apos;s schedule</span>
              </span>
              <span className="text-xs text-white/90 font-medium">8:00 AM - 4:30 PM</span>
            </div>
            <div className="flex items-baseline gap-2.5 my-1">
              <span className="text-[42px] leading-none font-bold tracking-tight">{visits.length}</span>
              <span className="text-[18px] font-medium text-white/95">{visits.length === 1 ? "patient" : "patients"} due today</span>
            </div>
            <div className="mt-3 pt-3 border-t border-white/20 flex items-center justify-between text-white/90">
              <p className="text-caption-sm">
                {fmtWeekday(DEMO_TODAY)} • {plural(remote, "check-in")}, {plural(office, "office visit")}
              </p>
              <Icon name="arrow_forward" size={18} className="text-white/80" />
            </div>
          </div>
        </HeroCard>

        <div className="grid grid-cols-3 gap-2.5 lg:gap-4">
          <Tile icon="monitor_weight" iconCls="text-text-tertiary" valueCls="text-text-primary" value={missing} label="Missing measurements" href="/patients" />
          <Tile icon="verified" iconCls="text-accent-fill" valueCls="text-accent-fill" value={ready} label="Ready for MD review" href="/review" />
          <Tile icon="warning" iconCls="text-warning" valueCls="text-warning" value={overdue} label="Overdue check-ins" href="/patients?filter=due" />
        </div>
      </div>

      <div className="flex flex-col gap-5 lg:grid lg:grid-cols-[1.6fr_1fr] lg:items-start lg:gap-6">
        <section className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between px-0.5">
            <h2 className="text-[18px] font-semibold text-text-primary">Up next</h2>
            <span className="text-caption-sm text-text-secondary">{morningLeft} remaining this morning</span>
          </div>
          {visits.length === 0 ? (
            <Card className="p-5 text-body-md text-text-secondary">No visits scheduled today.</Card>
          ) : (
            <div className="bg-surface rounded-[20px] shadow-clinical divide-y divide-border border border-border/70 overflow-hidden">
              {visits.map((p) => (
                <VisitRow key={p.id} p={p} items={items} />
              ))}
            </div>
          )}
        </section>

        <QuickEntry />
      </div>
    </div>
  );
}

function Tile({ icon, iconCls, valueCls, value, label, href }: { icon: string; iconCls: string; valueCls: string; value: number; label: string; href: string }) {
  return (
    <Link href={href} className="bg-surface rounded-2xl p-[14px_12px] lg:p-4 shadow-clinical flex flex-col justify-between border border-border/60 hover:border-accent/50 transition-colors">
      <Icon name={icon} size={20} className={iconCls} />
      <div className="mt-2">
        <div className={`text-[24px] lg:text-[30px] font-bold leading-tight ${valueCls}`}>{value}</div>
        <div className="text-[12px] leading-[15px] text-text-secondary mt-1 font-medium">{label}</div>
      </div>
    </Link>
  );
}

function VisitRow({ p, items }: { p: Patient; items: ReviewItems }) {
  const v = p.nextVisit!;
  const pending = pendingStatus(p.id, items);
  return (
    <Link href={`/patients/${p.id}`} className="p-4 flex items-center justify-between hover:bg-surface-alt transition-colors group">
      <div className="flex items-center gap-3 min-w-0 pr-2">
        <Avatar src={p.avatar} alt={p.name} size={44} className="ring-1 ring-border" />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-[16px] font-bold text-text-primary truncate">{p.name}</span>
            {pending ? <ReviewBadge status={pending} short={pending === "flagged"} /> : <StatusPill tone="success">No open items</StatusPill>}
          </div>
          <p className="text-caption-sm text-text-secondary truncate mt-0.5">
            {fmtTime(v.at)} • {v.kind} • {v.note}
          </p>
        </div>
      </div>
      <Icon name="chevron_right" size={20} className="text-text-tertiary group-hover:text-text-secondary shrink-0" />
    </Link>
  );
}

function QuickEntry() {
  return (
    <Card className="p-3.5 lg:p-5 flex items-center justify-between gap-3 lg:flex-col lg:items-stretch">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-accent-tint grid place-items-center text-accent-fill shrink-0">
          <Icon name="add" size={20} />
        </div>
        <div>
          <div className="text-[14px] font-semibold text-text-primary">Quick entry</div>
          <div className="text-[12px] text-text-secondary">Add weight or BP</div>
          <div className="hidden lg:block text-[12px] text-text-tertiary mt-0.5">Maria Alvarez - 9:30 AM office visit</div>
        </div>
      </div>
      <div className="flex gap-2 shrink-0">
        <Link href="/patients/p-alvarez/measure" className="min-h-11 px-4 rounded-full bg-accent-fill hover:bg-accent-pressed text-white text-caption-sm font-semibold inline-flex items-center justify-center gap-1 lg:flex-1">
          <span className="lg:hidden">Add</span>
          <span className="hidden lg:inline-flex items-center gap-1">
            <Icon name="monitor_weight" size={18} /> Weight
          </span>
        </Link>
        <Link href="/patients/p-alvarez/bp/new" className="hidden lg:inline-flex min-h-11 px-4 rounded-full border-[1.5px] border-accent-fill text-accent-fill hover:bg-accent-tint text-caption-sm font-semibold items-center justify-center gap-1 flex-1">
          <Icon name="favorite" size={18} /> Blood pressure
        </Link>
      </div>
    </Card>
  );
}
