"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useApp } from "@/lib/store";

/** Scripted walkthrough used to record the demo GIFs: open any page with ?tour=1. */
const STEPS: { as: string; path: string }[] = [
  { as: "s-lee", path: "/today" },
  { as: "s-lee", path: "/patients" },
  { as: "s-lee", path: "/patients/p-alvarez" },
  { as: "s-lee", path: "/patients/p-alvarez/body" },
  { as: "s-lee", path: "/patients/p-alvarez/bp/new" },
  { as: "s-marsh", path: "/review" },
  { as: "s-marsh", path: "/review/p-alvarez" },
  { as: "s-becker", path: "/more/reports" },
  { as: "p-alvarez", path: "/portal" },
  { as: "p-alvarez", path: "/portal/check-in" },
  { as: "p-alvarez", path: "/portal/messages" },
];
const STEP_MS = 2400;

export function DemoTour() {
  const router = useRouter();
  useEffect(() => {
    if (!new URLSearchParams(window.location.search).has("tour")) return;
    STEPS.forEach((s) => router.prefetch(s.path));
    const timers: ReturnType<typeof setTimeout>[] = [];
    STEPS.forEach((s, i) => {
      timers.push(
        setTimeout(() => {
          const st = useApp.getState();
          if (st.userId !== s.as) st.signIn(s.as);
          router.push(s.path);
          window.scrollTo(0, 0);
        }, 800 + i * STEP_MS),
      );
      timers.push(setTimeout(() => window.scrollBy({ top: 220, behavior: "smooth" }), 800 + i * STEP_MS + 1300));
    });
    return () => timers.forEach(clearTimeout);
  }, [router]);
  return null;
}
