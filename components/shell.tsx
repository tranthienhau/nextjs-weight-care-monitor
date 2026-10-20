"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useApp } from "@/lib/store";
import { getPatient, getStaff, PRACTICE_NAME, roleOf } from "@/lib/selectors";
import { Avatar, Icon } from "./ui";

/** True once the persisted demo state has loaded from localStorage (avoids hydration mismatch). */
export function useHydrated() {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    if (useApp.persist.hasHydrated()) setOk(true);
    return useApp.persist.onFinishHydration(() => setOk(true));
  }, []);
  return ok;
}

/** Current signed-in demo user (staff or patient). */
export function useCurrentUser() {
  const userId = useApp((s) => s.userId);
  const staffList = useApp((s) => s.staff);
  const role = roleOf(userId);
  const staff = userId && !userId.startsWith("p-") ? getStaff(userId, staffList) : undefined;
  const patient = userId?.startsWith("p-") ? getPatient(userId) : undefined;
  return { userId, role, staff, patient };
}

export const roleChip = (role: string | null) => (role === "physician" ? "MD" : role === "ma" ? "MA" : role === "admin" ? "Admin" : "");

type Tab = { label: string; href: string; icon: string; match: (p: string) => boolean };

export const STAFF_TABS: Tab[] = [
  { label: "Today", href: "/today", icon: "calendar_today", match: (p) => p.startsWith("/today") },
  { label: "Patients", href: "/patients", icon: "group", match: (p) => p.startsWith("/patients") },
  { label: "Review", href: "/review", icon: "rate_review", match: (p) => p.startsWith("/review") },
  { label: "Tasks", href: "/tasks", icon: "checklist", match: (p) => p.startsWith("/tasks") },
  { label: "More", href: "/more", icon: "more_horiz", match: (p) => p.startsWith("/more") },
];

export const PATIENT_TABS: Tab[] = [
  { label: "Home", href: "/portal", icon: "home", match: (p) => p === "/portal" },
  { label: "Trends", href: "/portal/trends", icon: "trending_down", match: (p) => p.startsWith("/portal/trends") },
  { label: "Check-in", href: "/portal/check-in", icon: "assignment", match: (p) => p.startsWith("/portal/check-in") },
  { label: "Messages", href: "/portal/messages", icon: "chat_bubble", match: (p) => p.startsWith("/portal/messages") },
];

/** Screens that are full-screen forms / modals: no bottom tab bar (per design nav: "none"). */
const NO_TAB_BAR = [/^\/patients\/[^/]+\/measure/, /^\/patients\/[^/]+\/bp\/new/, /^\/review\/[^/]+/];

function BottomTabs({ tabs, path }: { tabs: Tab[]; path: string }) {
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-surface border-t border-border pb-[env(safe-area-inset-bottom)]">
      <ul className="flex justify-around max-w-xl mx-auto px-2 pt-2 pb-2">
        {tabs.map((t) => {
          const on = t.match(path);
          return (
            <li key={t.href} className="flex-1">
              <Link href={t.href} className="flex flex-col items-center gap-0.5 py-1">
                <span className={clsx("w-14 h-8 rounded-full grid place-items-center transition-colors", on && "bg-accent-tint")}>
                  <Icon name={t.icon} filled={on} className={on ? "text-accent-fill" : "text-text-tertiary"} />
                </span>
                <span className={clsx("text-[12px]", on ? "text-accent-fill font-semibold" : "text-text-tertiary")}>{t.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function SideNav({ tabs, path, footer }: { tabs: Tab[]; path: string; footer: ReactNode }) {
  return (
    <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col bg-surface border-r border-border z-30">
      <div className="flex items-center gap-3 px-6 h-20 border-b border-border">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icon-192.png" alt="" className="w-9 h-9 rounded-xl" />
        <div>
          <div className="font-serif text-[20px] font-bold leading-6">Steadfast</div>
          <div className="text-[11px] text-text-tertiary">{PRACTICE_NAME}</div>
        </div>
      </div>
      <ul className="flex-1 px-3 py-4 space-y-1">
        {tabs.map((t) => {
          const on = t.match(path);
          return (
            <li key={t.href}>
              <Link
                href={t.href}
                className={clsx("flex items-center gap-3 h-11 px-4 rounded-xl text-[15px] transition-colors", on ? "bg-accent-tint text-accent-fill font-semibold" : "text-text-secondary hover:bg-surface-alt")}
              >
                <Icon name={t.icon} filled={on} />
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="p-4 border-t border-border">{footer}</div>
    </aside>
  );
}

function UserFooter() {
  const { staff, patient, role } = useCurrentUser();
  const signOut = useApp((s) => s.signOut);
  const router = useRouter();
  const name = staff?.name ?? patient?.name ?? "";
  const avatar = staff?.avatar ?? patient?.avatar ?? "";
  return (
    <div className="flex items-center gap-3">
      {avatar && <Avatar src={avatar} alt="" size={40} />}
      <div className="min-w-0 flex-1">
        <div className="text-[14px] font-semibold truncate">{name}</div>
        <div className="text-[12px] text-text-tertiary">{role === "patient" ? "Patient" : staff?.title}</div>
      </div>
      <button
        aria-label="Sign out"
        onClick={() => {
          signOut();
          router.push("/sign-in");
        }}
        className="w-9 h-9 rounded-full grid place-items-center hover:bg-surface-alt text-text-tertiary"
      >
        <Icon name="logout" size={20} />
      </button>
    </div>
  );
}

function Gate({ allow, children }: { allow: (role: string | null) => boolean; children: ReactNode }) {
  const hydrated = useHydrated();
  const { role } = useCurrentUser();
  const router = useRouter();
  useEffect(() => {
    if (hydrated && !role) router.replace("/sign-in");
  }, [hydrated, role, router]);
  if (!hydrated) return <div className="min-h-dvh grid place-items-center text-text-tertiary">Loading secure session...</div>;
  if (!role) return null;
  if (!allow(role))
    return (
      <div className="min-h-dvh grid place-items-center p-6 text-center">
        <div>
          <Icon name="lock" size={40} className="text-accent-fill mb-3" />
          <p className="text-title-md font-semibold mb-1">Not available for your role</p>
          <p className="text-text-secondary mb-4">Access is limited by role. This attempt was not shown any data.</p>
          <Link className="text-accent-fill font-semibold" href={role === "patient" ? "/portal" : "/today"}>
            Go to your home
          </Link>
        </div>
      </div>
    );
  return <>{children}</>;
}

/** Staff app shell: bottom tab bar on phone, sidebar on desktop. */
export function StaffShell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const hideTabs = NO_TAB_BAR.some((r) => r.test(path));
  return (
    <Gate allow={(r) => r === "physician" || r === "ma" || r === "admin"}>
      <SideNav tabs={STAFF_TABS} path={path} footer={<UserFooter />} />
      <main className={clsx("lg:pl-64 min-h-dvh", !hideTabs && "pb-24 lg:pb-10")}>
        <div className="mx-auto w-full max-w-xl lg:max-w-6xl px-5 lg:px-8 pt-[max(env(safe-area-inset-top),12px)] lg:pt-8">{children}</div>
      </main>
      {!hideTabs && <BottomTabs tabs={STAFF_TABS} path={path} />}
    </Gate>
  );
}

/** Patient portal shell: same tab bar styling, patient tabs. */
export function PatientShell({ children }: { children: ReactNode }) {
  const path = usePathname();
  return (
    <Gate allow={(r) => r === "patient"}>
      <SideNav tabs={PATIENT_TABS} path={path} footer={<UserFooter />} />
      <main className="lg:pl-64 min-h-dvh pb-24 lg:pb-10">
        <div className="mx-auto w-full max-w-xl lg:max-w-4xl px-5 lg:px-8 pt-[max(env(safe-area-inset-top),12px)] lg:pt-8">{children}</div>
      </main>
      <BottomTabs tabs={PATIENT_TABS} path={path} />
    </Gate>
  );
}
