"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { Avatar, Icon } from "@/components/ui";
import { DEMO_ACCOUNTS, type DemoAccount } from "@/components/portal/accounts";
import { SignInForm } from "@/components/portal/sign-in-form";
import { images, PRACTICE_NAME } from "@/lib/data";
import { useApp } from "@/lib/store";

function DemoAccounts({ onPick }: { onPick: (a: DemoAccount) => void }) {
  return (
    <section aria-labelledby="demo-title" className="mt-5 rounded-2xl border border-dashed border-accent/60 bg-accent-tint/40 p-4">
      <div className="flex items-center gap-2 mb-1">
        <Icon name="science" size={18} className="text-accent-fill" />
        <h2 id="demo-title" className="text-label-md font-semibold text-text-primary">
          Demo accounts
        </h2>
      </div>
      <p className="text-[12px] text-text-secondary mb-3">Demo only, mock data. Tap an account to sign in instantly.</p>
      <ul className="space-y-1.5">
        {DEMO_ACCOUNTS.map((a) => (
          <li key={a.id}>
            <button
              type="button"
              onClick={() => onPick(a)}
              className="w-full min-h-[52px] flex items-center gap-3 rounded-xl bg-surface border border-border px-3 py-2 text-left hover:border-accent/60 transition-colors"
            >
              <Avatar src={a.avatar} alt="" size={36} />
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-semibold text-text-primary truncate">{a.name}</span>
                <span className="block text-[12px] text-text-tertiary">{a.label}</span>
              </span>
              <Icon name="chevron_right" size={20} className="text-text-tertiary" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Demo deep link: /sign-in?as=<demo account id>&next=/route (used to drive simulator demos). */
function DemoDeepLink() {
  const params = useSearchParams();
  const router = useRouter();
  const signIn = useApp((s) => s.signIn);
  useEffect(() => {
    const a = DEMO_ACCOUNTS.find((x) => x.id === params.get("as"));
    if (!a) return;
    const next = params.get("next");
    signIn(a.id);
    router.replace(next && next.startsWith("/") && !next.startsWith("//") ? next : a.route);
  }, [params, router, signIn]);
  if (!params.get("as")) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/icon-192.png" alt="" className="w-16 h-16 rounded-2xl animate-pulse" />
    </div>
  );
}

export default function SignInPage() {
  const router = useRouter();
  const signIn = useApp((s) => s.signIn);

  const enter = (a: DemoAccount) => {
    signIn(a.id);
    router.push(a.route);
  };

  return (
    <div className="min-h-dvh bg-surface lg:grid lg:grid-cols-2">
      <Suspense fallback={null}>
        <DemoDeepLink />
      </Suspense>
      <div className="relative w-full h-[320px] lg:h-dvh lg:sticky lg:top-0 shrink-0 bg-surface-alt overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={images.hero} alt={`${PRACTICE_NAME} consultation room`} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-black/15 lg:from-black/25 pointer-events-none" />
        <div className="absolute top-[max(env(safe-area-inset-top),20px)] left-5 lg:top-8 lg:left-8 flex items-center gap-1.5 bg-surface/90 backdrop-blur-md px-2.5 py-1 rounded-full shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-support" />
          <span className="text-[12px] leading-tight text-text-secondary">Clinic Portal</span>
        </div>
      </div>

      <main className="relative -mt-6 lg:mt-0 bg-surface rounded-t-[20px] lg:rounded-none shadow-elevated-sheet lg:shadow-none px-5 pt-6 pb-8 flex flex-col lg:justify-center z-10">
        <div className="w-full max-w-md mx-auto">
          <div className="flex items-center justify-between mb-1">
            <span className="text-caption-sm text-primary font-medium tracking-wide">{PRACTICE_NAME}</span>
            <span className="flex items-center gap-1 bg-surface-alt px-2 py-0.5 rounded-full">
              <Icon name="verified" size={14} className="text-primary" />
              <span className="text-[12px] text-text-secondary font-medium">MD Monitored</span>
            </span>
          </div>
          <h1 className="font-serif text-headline-lg text-text-primary leading-tight">Steadfast</h1>
          <p className="text-label-md text-text-secondary mt-0.5">Physician-led weight care</p>

          <SignInForm onDone={enter} />
          <DemoAccounts onPick={enter} />

          <footer className="pt-5 mt-6 border-t border-border/50 space-y-1.5 text-center">
            <p className="flex items-center justify-center gap-1.5 text-text-secondary text-[12px]">
              <Icon name="lock" size={14} className="text-text-tertiary" />
              HIPAA-secured, encrypted session
              <span className="inline-block w-1 h-1 rounded-full bg-success" />
            </p>
            <p className="text-[12px] leading-tight text-text-tertiary">Not for emergencies. If this is an emergency, call 911.</p>
          </footer>
        </div>
      </main>
    </div>
  );
}
