"use client";

import clsx from "clsx";
import { Button, Card, Icon, SafetyBanner, Toggle } from "@/components/ui";
import type { CheckInQuestion } from "@/lib/types";

const CATEGORY: Record<string, string> = {
  q1: "How you feel",
  q2: "Medication and side effects",
  q3: "Energy and daily rhythm",
  q4: "Appetite",
  q5: "Activity and sleep",
  q6: "Your treatment plan",
  q7: "Questions",
  q8: "Staying in touch",
};

export function Progress({ n, total }: { n: number; total: number }) {
  const pct = Math.round((n / total) * 100);
  return (
    <div className="mt-2 flex flex-col gap-1.5">
      <div className="flex justify-between items-center text-caption-sm">
        <span className="text-text-primary font-medium">
          Question {n} of {total}
        </span>
        <span className="text-text-secondary">{pct}% complete</span>
      </div>
      <div className="w-full h-1.5 bg-border rounded-full overflow-hidden" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Check-in progress">
        <div className="h-full bg-accent-fill rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function CheckInNotice() {
  return (
    <section role="note" className="bg-accent-tint rounded-2xl p-3.5 flex items-start gap-2.5 shadow-sm">
      <Icon name="info" size={20} className="text-accent-fill shrink-0 mt-0.5" />
      <p className="text-[13px] text-text-primary leading-relaxed">
        Submitting a check-in does not mean immediate review and is not emergency care. Call 911 for emergencies.
      </p>
    </section>
  );
}

export function QuestionCard({ q, value, onChange }: { q: CheckInQuestion; value?: string; onChange: (v: string) => void }) {
  return (
    <Card className="p-5">
      <span className="inline-flex items-center px-3 py-1 rounded-full text-[12px] bg-accent-tint text-accent-fill mb-3">{CATEGORY[q.id] ?? "Check-in"}</span>
      <h2 id={`${q.id}-text`} className="text-[22px] leading-[28px] text-text-primary font-semibold mb-5">
        {q.text}
      </h2>
      <div role="radiogroup" aria-labelledby={`${q.id}-text`} className="flex flex-col gap-2.5">
        {q.options.map((o) => {
          const on = value === o;
          return (
            <button
              key={o}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onChange(o)}
              className={clsx(
                "w-full min-h-[56px] rounded-xl p-4 flex items-center justify-between text-left transition-colors active:scale-[0.99]",
                on ? "border-2 border-accent-fill bg-accent-tint shadow-sm" : "border border-border bg-surface hover:border-accent-fill/40",
              )}
            >
              <span className={clsx("text-body-md text-text-primary", on && "font-medium")}>{o}</span>
              <span className={clsx("w-5 h-5 rounded-full grid place-items-center", on ? "bg-accent-fill text-white" : "border border-border bg-surface")}>
                {on && <Icon name="check" size={15} />}
              </span>
            </button>
          );
        })}
      </div>
    </Card>
  );
}

export function ExtrasCard({ comment, setComment, contact, setContact }: { comment: string; setComment: (v: string) => void; contact: boolean; setContact: (v: boolean) => void }) {
  return (
    <Card className="p-5 space-y-4">
      <div className="flex flex-col gap-2">
        <label className="text-[14px] text-text-secondary" htmlFor="checkin-notes">
          Anything to add? <span className="text-text-tertiary">(optional)</span>
        </label>
        <textarea
          id="checkin-notes"
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Note changes in sleep, work schedule, or afternoon fatigue..."
          className="w-full rounded-xl border border-border bg-surface p-3 text-[14px] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-fill/70 min-h-[90px] resize-none"
        />
      </div>
      <div className="border-t border-border pt-4 flex items-center justify-between gap-3">
        <div className="flex flex-col pr-2">
          <span className="text-[15px] font-medium text-text-primary leading-snug">I would like the care team to contact me</span>
          <span className="text-[12px] text-text-tertiary mt-0.5">A clinician or medical assistant will reach out within 1-2 business days</span>
        </div>
        <Toggle on={contact} onChange={setContact} label="I would like the care team to contact me" />
      </div>
    </Card>
  );
}

export function Confirmation({ contacted }: { contacted: boolean }) {
  return (
    <div className="space-y-4">
      <Card className="p-6 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-success-tint text-success grid place-items-center mb-4">
          <Icon name="task_alt" size={34} />
        </div>
        <h2 className="font-serif text-[28px] leading-9 font-bold mb-2">Check-in submitted</h2>
        <p className="text-body-md text-text-secondary">Thank you. Your care team will review your answers. This is not monitored 24/7.</p>
        {contacted && (
          <p className="mt-3 text-label-md text-accent-fill bg-accent-tint rounded-xl p-3">We let your care team know you asked to be contacted.</p>
        )}
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Button href="/portal">Back to home</Button>
          <Button href="/portal/messages" variant="secondary">
            Message care team
          </Button>
        </div>
      </Card>
      <SafetyBanner />
    </div>
  );
}
