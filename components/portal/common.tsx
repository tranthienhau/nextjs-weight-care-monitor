"use client";

import type { ReactNode } from "react";
import { useCurrentUser } from "@/components/shell";
import { PRACTICE_NAME } from "@/lib/data";
import type { Measurement } from "@/lib/types";

/** The signed-in patient. The PatientShell gate guarantees a patient session. */
export function usePortalPatient() {
  return useCurrentUser().patient;
}

/** Patient-facing source label, e.g. "Clinic - Hume Body Pod". Never exposes staff notes. */
export const sourceLabel = (m: Pick<Measurement, "source" | "patientReported">) =>
  m.patientReported ? "Home - reported by you" : `Clinic - ${m.source.split(" - ")[0]}`;

/** Long month name for an ISO date, e.g. "October". */
export const monthName = (iso: string) => new Date(iso.length === 10 ? iso + "T12:00:00" : iso).toLocaleDateString("en-US", { month: "long" });

/** Portal header: practice caption, Bodoni title, avatar with active dot (avatar hidden on desktop). */
export function PortalHeader({ title, avatar, left }: { title: string; avatar?: string; left?: ReactNode }) {
  return (
    <header className="flex items-start justify-between gap-4 pt-4 pb-4">
      <div className="min-w-0">
        {left}
        <p className="text-caption-sm text-text-secondary tracking-wide">{PRACTICE_NAME}</p>
        <h1 className="font-serif text-headline-lg-mobile lg:text-headline-lg text-text-primary mt-0.5">{title}</h1>
      </div>
      {avatar && (
        <div className="relative shrink-0 lg:hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={avatar} alt="Your profile photo" className="w-11 h-11 rounded-full object-cover shadow-sm ring-2 ring-surface" />
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full ring-2 ring-surface" />
        </div>
      )}
    </header>
  );
}
