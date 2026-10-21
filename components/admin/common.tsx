"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { getPatient } from "@/lib/selectors";
import type { Staff } from "@/lib/types";
import { Icon } from "@/components/ui";

/** Avatar image for an audit / task actor id (staff or patient). */
export const avatarFor = (id: string, staff: Staff[]) => staff.find((s) => s.id === id)?.avatar ?? getPatient(id)?.avatar;

export function Note({ children, icon = "lock" }: { children: ReactNode; icon?: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-2xl bg-accent-tint/60 p-3.5 text-caption-sm text-text-secondary">
      <Icon name={icon} size={18} className="text-accent-fill shrink-0" />
      <p>{children}</p>
    </div>
  );
}

export function Confirmation({ children }: { children: ReactNode }) {
  return (
    <p role="status" className="flex items-center gap-2 rounded-2xl bg-success-tint text-[#15803D] p-3 text-label-md">
      <Icon name="check_circle" size={18} />
      {children}
    </p>
  );
}

export function BackLink() {
  return (
    <Link href="/more" className="inline-flex items-center gap-1 h-11 -ml-1 text-label-md text-accent-fill font-semibold">
      <Icon name="arrow_back" size={18} />
      More
    </Link>
  );
}

export function MenuRow({ href, onClick, icon, label, sub, tone }: { href?: string; onClick?: () => void; icon: string; label: string; sub?: string; tone?: "danger" }) {
  const inner = (
    <>
      <span className={tone === "danger" ? "w-10 h-10 rounded-full bg-danger-tint text-danger grid place-items-center shrink-0" : "w-10 h-10 rounded-full bg-accent-tint text-accent-fill grid place-items-center shrink-0"}>
        <Icon name={icon} size={20} />
      </span>
      <span className="flex-1 min-w-0 text-left">
        <span className={tone === "danger" ? "block text-[15px] font-semibold text-danger" : "block text-[15px] font-semibold text-text-primary"}>{label}</span>
        {sub && <span className="block text-caption-sm text-text-secondary truncate">{sub}</span>}
      </span>
      {href && <Icon name="chevron_right" className="text-text-tertiary" />}
    </>
  );
  const cls = "flex items-center gap-3 w-full px-4 py-3 min-h-[60px] hover:bg-surface-alt transition-colors";
  return href ? (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  ) : (
    <button type="button" onClick={onClick} className={cls}>
      {inner}
    </button>
  );
}
