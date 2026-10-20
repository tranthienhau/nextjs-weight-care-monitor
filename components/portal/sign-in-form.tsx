"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { Button, Icon } from "@/components/ui";
import { accountForEmail, DEFAULT_EMAIL, type DemoAccount } from "./accounts";

function IconInput({ id, label, icon, children }: { id: string; label: string; icon: string; children: ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="block text-caption-sm text-text-secondary" htmlFor={id}>
        {label}
      </label>
      <div className="relative rounded-[12px] border border-border bg-surface transition-all focus-within:ring-2 focus-within:ring-accent-fill/30 focus-within:border-accent-fill">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-tertiary">
          <Icon name={icon} size={19} />
        </div>
        {children}
      </div>
    </div>
  );
}

const fieldCls = "w-full h-12 pl-10 bg-transparent border-0 rounded-[12px] text-label-md text-text-primary focus:outline-none placeholder:text-text-tertiary";

/** Email + password, then a 6-digit MFA step. Calls onDone with the matching demo account. */
export function SignInForm({ onDone }: { onDone: (a: DemoAccount) => void }) {
  const [email, setEmail] = useState(DEFAULT_EMAIL);
  const [password, setPassword] = useState("steadfast-demo");
  const [showPw, setShowPw] = useState(false);
  const [forgot, setForgot] = useState(false);
  const [error, setError] = useState("");
  const [mfaFor, setMfaFor] = useState<DemoAccount | null>(null);
  const [code, setCode] = useState("246810");
  const [codeError, setCodeError] = useState("");

  const resolve = () => {
    const a = accountForEmail(email);
    if (!a) setError("No demo account uses this email. Try one of the demo accounts below.");
    return a;
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const a = resolve();
    if (!a) return;
    if (!password) return setError("Enter your password.");
    setError("");
    setMfaFor(a);
  };

  const verify = (e: FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(code)) return setCodeError("Enter the 6-digit code from your authenticator app.");
    if (mfaFor) onDone(mfaFor);
  };

  if (mfaFor)
    return (
      <form className="mt-5 space-y-4" onSubmit={verify}>
        <div className="p-3 bg-surface-alt rounded-[12px] flex items-center gap-2.5 border border-border/70">
          <div className="shrink-0 w-8 h-8 rounded-full bg-accent-tint grid place-items-center text-accent-fill">
            <Icon name="shield" size={18} />
          </div>
          <p className="text-[13px] leading-snug text-text-secondary">A verification code was sent to your authenticator app.</p>
        </div>
        <div className="space-y-1">
          <label htmlFor="mfa" className="block text-caption-sm text-text-secondary">
            6-digit code for {mfaFor.email}
          </label>
          <input
            id="mfa"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            onChange={(e) => {
              setCode(e.target.value.replace(/\D/g, "").slice(0, 6));
              setCodeError("");
            }}
            className="w-full h-14 px-4 rounded-[12px] border border-border bg-surface text-center text-[26px] font-semibold tracking-[0.5em] text-text-primary outline-none focus:ring-2 focus:ring-accent-fill/30 focus:border-accent-fill"
          />
          {codeError && <p className="text-[12px] text-danger">{codeError}</p>}
        </div>
        <Button type="submit" full icon="verified_user">
          Verify and continue
        </Button>
        <button type="button" onClick={() => setMfaFor(null)} className="w-full h-11 text-label-md text-accent-fill font-medium rounded-full hover:bg-accent-tint">
          Use a different account
        </button>
      </form>
    );

  return (
    <form className="mt-5 space-y-3.5" onSubmit={submit}>
      <IconInput id="email" label="Email address" icon="mail">
        <input
          id="email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError("");
          }}
          className={`${fieldCls} pr-3.5`}
        />
      </IconInput>
      <div className="space-y-1">
        <IconInput id="password" label="Password" icon="lock">
          <input
            id="password"
            type={showPw ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`${fieldCls} pr-11 tracking-widest`}
          />
          <button
            type="button"
            aria-label={showPw ? "Hide password" : "Show password"}
            onClick={() => setShowPw((v) => !v)}
            className="absolute inset-y-0 right-0 w-11 grid place-items-center text-text-tertiary hover:text-text-primary"
          >
            <Icon name={showPw ? "visibility" : "visibility_off"} size={20} />
          </button>
        </IconInput>
        <div className="flex justify-end">
          <button type="button" onClick={() => setForgot((v) => !v)} className="h-8 text-caption-sm text-accent-fill hover:text-accent-pressed font-medium">
            Forgot password?
          </button>
        </div>
        {forgot && (
          <p className="text-[12.5px] leading-snug text-text-secondary bg-accent-tint/70 rounded-[12px] p-3">
            Password resets are handled by your practice. Contact the front desk to receive a secure reset link. In this demo any password works.
          </p>
        )}
      </div>
      {error && (
        <p role="alert" className="text-[13px] text-danger">
          {error}
        </p>
      )}
      <div className="pt-1.5 space-y-2.5">
        <Button type="submit" full>
          Sign in
          <Icon name="arrow_forward" size={18} />
        </Button>
        <Button
          variant="secondary"
          full
          icon="key"
          onClick={() => {
            const a = resolve();
            if (a) onDone(a);
          }}
        >
          Use passkey
        </Button>
      </div>
      <div className="p-2.5 bg-surface-alt rounded-[12px] flex items-center gap-2.5 border border-border/70">
        <div className="shrink-0 w-7 h-7 rounded-full bg-accent-tint grid place-items-center text-accent-fill">
          <Icon name="shield" size={17} />
        </div>
        <p className="text-[12.5px] leading-snug text-text-secondary">A verification code will be sent to your authenticator app</p>
      </div>
    </form>
  );
}
