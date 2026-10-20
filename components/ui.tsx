"use client";

import clsx from "clsx";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import type { ReviewStatus } from "@/lib/types";

/** Material Symbols Outlined icon (self-hosted font), same set as the design. */
export function Icon({ name, className, filled, size }: { name: string; className?: string; filled?: boolean; size?: number }) {
  return (
    <span aria-hidden className={clsx("material-symbols-outlined", filled && "filled", className)} style={size ? { fontSize: size } : undefined}>
      {name}
    </span>
  );
}

export function Avatar({ src, alt, size = 40, ring, className }: { src: string; alt: string; size?: number; ring?: boolean; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={clsx("rounded-full object-cover shrink-0 bg-accent-tint", ring && "ring-2 ring-white shadow-card-sm", className)}
      style={{ width: size, height: size }}
    />
  );
}

export function Card({ children, className, as: As = "section" }: { children: ReactNode; className?: string; as?: "section" | "div" | "article" }) {
  return <As className={clsx("bg-surface rounded-2xl shadow-card border border-border/60", className)}>{children}</As>;
}

/** Soft accent -> support gradient hero card (one focal element per screen). */
export function HeroCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <section
      className={clsx("rounded-2xl p-5 text-white shadow-hero relative overflow-hidden", className)}
      style={{ background: "linear-gradient(135deg, #5B78FE 0%, #7F8CF5 55%, #F7979A 130%)" }}
    >
      {children}
    </section>
  );
}

export function Chip({ children, selected, onClick, className }: { children: ReactNode; selected?: boolean; onClick?: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "h-8 px-3.5 rounded-full text-label-md whitespace-nowrap border transition-colors inline-flex items-center gap-1",
        selected ? "bg-accent-tint text-accent-fill border-accent-tint" : "bg-surface text-text-secondary border-border hover:bg-surface-alt",
        className,
      )}
    >
      {children}
    </button>
  );
}

type BtnProps = {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  icon?: string;
  type?: "button" | "submit";
  full?: boolean;
};

export function Button({ children, variant = "primary", href, onClick, disabled, className, icon, type = "button", full }: BtnProps) {
  const cls = clsx(
    "h-[52px] px-6 rounded-full inline-flex items-center justify-center gap-2 text-[16px] font-semibold transition-colors active:scale-[0.99]",
    variant === "primary" && "bg-accent-fill text-white hover:bg-accent-pressed disabled:bg-[#C9D2F7]",
    variant === "secondary" && "bg-surface text-accent-fill border-[1.5px] border-accent-fill hover:bg-accent-tint",
    variant === "ghost" && "text-accent-fill hover:bg-accent-tint h-11",
    full && "w-full",
    className,
  );
  const inner = (
    <>
      {icon && <Icon name={icon} size={20} />}
      {children}
    </>
  );
  if (href) return <Link href={href} className={cls}>{inner}</Link>;
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls}>
      {inner}
    </button>
  );
}

const reviewStyles: Record<ReviewStatus, string> = {
  unreviewed: "bg-warning-tint text-[#92400E]",
  flagged: "bg-warning-tint text-[#92400E]",
  ready: "bg-accent-tint text-accent-fill",
  reviewed: "bg-success-tint text-[#15803D]",
};

/** Review status chip. "Reviewed" is only shown with who signed it. */
export function ReviewBadge({ status, by, on, short }: { status: ReviewStatus; by?: string; on?: string; short?: boolean }) {
  const text =
    status === "reviewed"
      ? `Reviewed${by ? ` by ${by}` : ""}${on ? ` - ${on}` : ""}`
      : status === "ready"
        ? short ? "Ready for MD" : "Ready for MD review"
        : status === "flagged"
          ? short ? "Flagged" : "Flagged - awaiting clinician review"
          : "Unreviewed";
  return (
    <span className={clsx("inline-flex items-center gap-1 h-6 px-2.5 rounded-full text-[12px] font-medium whitespace-nowrap", reviewStyles[status])}>
      {status === "flagged" && <Icon name="warning" size={14} />}
      {status === "reviewed" && <Icon name="verified" size={14} />}
      {text}
    </span>
  );
}

/** Source + entered-by tag. Patient-reported values use a dashed border. */
export function SourceTag({ children, patient, className }: { children: ReactNode; patient?: boolean; className?: string }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] leading-tight text-text-tertiary bg-surface border",
        patient ? "border-dashed border-text-tertiary" : "border-border",
        className,
      )}
    >
      {patient && <Icon name="home" size={12} />}
      {children}
    </span>
  );
}

export function EstimateTag() {
  return <span className="inline-flex items-center h-5 px-2 rounded-full text-[11px] font-medium bg-accent-tint text-accent-fill">Estimate</span>;
}

export function StatusPill({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "success" | "warning" | "accent" | "muted" }) {
  const t = {
    neutral: "bg-surface-alt text-text-secondary",
    success: "bg-success-tint text-[#15803D]",
    warning: "bg-warning-tint text-[#92400E]",
    accent: "bg-accent-tint text-accent-fill",
    muted: "bg-[#EEF0F6] text-text-tertiary",
  }[tone];
  return <span className={clsx("inline-flex items-center h-6 px-2.5 rounded-full text-[12px] font-medium whitespace-nowrap", t)}>{children}</span>;
}

/** Not-an-emergency banner (required by the clinical safety rules). */
export function SafetyBanner({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <div className={clsx("flex gap-3 items-start rounded-2xl bg-accent-tint/70 border border-accent-tint p-4 text-[13px] leading-[18px] text-text-secondary", className)}>
      <Icon name="info" className="text-accent-fill" size={20} />
      <p>{children ?? "Not monitored 24/7. For emergencies call 911."}</p>
    </div>
  );
}

/** Top header used by tab screens: optional caption, Bodoni title, avatar + role chip. */
export function PageHeader({
  title,
  caption,
  subtitle,
  avatar,
  role,
  right,
}: {
  title: string;
  caption?: string;
  subtitle?: string;
  avatar?: string;
  role?: string;
  right?: ReactNode;
}) {
  return (
    <header className="flex items-start justify-between gap-4 pt-2 pb-4">
      <div className="min-w-0">
        {caption && <p className="text-caption-sm text-text-secondary mb-1">{caption}</p>}
        <h1 className="font-serif text-[30px] leading-[36px] lg:text-[36px] lg:leading-[44px] font-bold tracking-[-0.02em] text-text-primary">{title}</h1>
        {subtitle && <p className="text-label-md text-text-secondary mt-1">{subtitle}</p>}
      </div>
      {right}
      {avatar && (
        <div className="flex items-center gap-2 bg-surface rounded-full pl-1 pr-3 py-1 shadow-card-sm border border-border shrink-0 lg:hidden">
          <Avatar src={avatar} alt="" size={36} />
          {role && <span className="text-[12px] font-semibold text-accent-fill bg-accent-tint rounded-full px-2 py-0.5">{role}</span>}
        </div>
      )}
    </header>
  );
}

/** Header for full-screen forms / detail screens without a tab bar. */
export function BackHeader({ title, subtitle, close, right }: { title: string; subtitle?: string; close?: boolean; right?: ReactNode }) {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-20 -mx-5 px-5 lg:-mx-8 lg:px-8 py-3 bg-surface/95 backdrop-blur border-b border-border flex items-center gap-3">
      <button onClick={() => router.back()} aria-label={close ? "Close" : "Back"} className="w-10 h-10 -ml-2 rounded-full grid place-items-center hover:bg-surface-alt">
        <Icon name={close ? "close" : "arrow_back"} />
      </button>
      <div className="min-w-0 flex-1">
        <h1 className="font-serif text-[22px] leading-7 font-bold truncate">{title}</h1>
        {subtitle && <p className="text-caption-sm text-text-secondary truncate">{subtitle}</p>}
      </div>
      {right}
    </header>
  );
}

export function SectionTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="flex items-center justify-between mt-6 mb-3">
      <h2 className="text-title-md font-semibold text-text-primary">{children}</h2>
      {right}
    </div>
  );
}

export function StatTile({ icon, value, label, tone = "accent", href }: { icon: string; value: ReactNode; label: string; tone?: "accent" | "warning" | "neutral"; href?: string }) {
  const color = tone === "warning" ? "text-warning" : tone === "accent" ? "text-accent-fill" : "text-text-primary";
  const body = (
    <Card className="p-4 h-full hover:border-accent/50 transition-colors">
      <Icon name={icon} className={clsx(color, "mb-2")} />
      <div className={clsx("text-[30px] leading-9 font-semibold", color)}>{value}</div>
      <div className="text-caption-sm text-text-secondary mt-1">{label}</div>
    </Card>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}

export function EmptyState({ image, title, body, action }: { image: string; title: string; body: string; action?: ReactNode }) {
  return (
    <Card className="p-5 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image} alt="" className="w-full aspect-[4/3] object-cover rounded-2xl mb-6" />
      <h2 className="font-serif text-[28px] leading-9 font-bold mb-2">{title}</h2>
      <p className="text-body-md text-text-secondary mb-6">{body}</p>
      {action}
    </Card>
  );
}

/** Segmented control (e.g. Overview / Body / BP / Labs / Meds). */
export function Segmented({ items, active }: { items: { label: string; href: string }[]; active: string }) {
  return (
    <nav className="flex gap-6 overflow-x-auto no-scrollbar border-b border-border -mx-5 px-5 lg:mx-0 lg:px-0">
      {items.map((it) => (
        <Link
          key={it.href}
          href={it.href}
          className={clsx(
            "pb-3 pt-1 text-[15px] whitespace-nowrap border-b-2 -mb-px transition-colors",
            it.label === active ? "border-accent-fill text-accent-fill font-semibold" : "border-transparent text-text-tertiary hover:text-text-secondary",
          )}
        >
          {it.label}
        </Link>
      ))}
    </nav>
  );
}

export function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={clsx("w-12 h-7 rounded-full p-0.5 transition-colors shrink-0", on ? "bg-accent-fill" : "bg-[#D5DAE8]")}
    >
      <span className={clsx("block w-6 h-6 rounded-full bg-white shadow transition-transform", on && "translate-x-5")} />
    </button>
  );
}

export function Field({ label, children, hint, error }: { label: string; children: ReactNode; hint?: ReactNode; error?: string }) {
  return (
    <label className="block">
      <span className="block text-caption-sm text-text-secondary mb-1.5">{label}</span>
      {children}
      {error ? <span className="block text-[12px] text-danger mt-1">{error}</span> : hint ? <span className="block text-[12px] text-text-tertiary mt-1">{hint}</span> : null}
    </label>
  );
}

export const inputCls =
  "w-full h-12 px-4 rounded-xl bg-surface border border-border text-body-md text-text-primary placeholder:text-text-tertiary outline-none focus:ring-2 focus:ring-accent focus:border-transparent";

/** Number input with a unit suffix chip. */
export function UnitInput({
  value,
  onChange,
  unit,
  placeholder,
  disabled,
  big,
  invalid,
}: {
  value: string;
  onChange: (v: string) => void;
  unit: string;
  placeholder?: string;
  disabled?: boolean;
  big?: boolean;
  invalid?: boolean;
}) {
  return (
    <div className={clsx("relative", disabled && "opacity-50")}>
      <input
        inputMode="decimal"
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value.replace(/[^0-9.]/g, ""))}
        className={clsx(inputCls, "pr-16", big && "h-16 text-[32px] font-semibold", invalid && "border-danger focus:ring-danger")}
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] font-medium text-text-secondary bg-surface-alt border border-border rounded-md px-2 py-0.5">{unit}</span>
    </div>
  );
}
