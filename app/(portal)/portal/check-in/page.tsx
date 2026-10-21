"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckInNotice, Confirmation, ExtrasCard, Progress, QuestionCard } from "@/components/portal/check-in-parts";
import { monthName, usePortalPatient } from "@/components/portal/common";
import { Button, Card, Icon } from "@/components/ui";
import { checkInQuestions, DEMO_TODAY, PRACTICE_NAME } from "@/lib/data";
import { fmtDay } from "@/lib/format";
import { useApp } from "@/lib/store";

export default function CheckInPage() {
  const router = useRouter();
  const patient = usePortalPatient();
  const checkIns = useApp((s) => s.checkIns);
  const submitCheckIn = useApp((s) => s.submitCheckIn);
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [comment, setComment] = useState("");
  const [contact, setContact] = useState(false);
  const [result, setResult] = useState<{ tasksCreated: number } | null>(null);
  if (!patient) return null;

  const month = monthName(DEMO_TODAY);
  const prior = checkIns.find((c) => c.patientId === patient.id && c.month === DEMO_TODAY.slice(0, 7));
  const total = checkInQuestions.length;
  const q = checkInQuestions[step];
  const last = step === total - 1;
  const active = started || !prior;

  const answer = (v: string) => {
    setAnswers({ ...answers, [q.id]: v });
    if (q.id === "q8") setContact(v === "Yes");
  };

  const submit = () => {
    const list = checkInQuestions.map((x) => ({ questionId: x.id, answer: answers[x.id] }));
    setResult(submitCheckIn(patient.id, list, comment.trim(), contact));
    window.scrollTo({ top: 0 });
  };

  const next = () => {
    if (last) return submit();
    setStep(step + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="max-w-2xl mx-auto pb-4">
      <header className="pt-4 pb-3 flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <button
            type="button"
            aria-label="Close check-in"
            onClick={() => router.push("/portal")}
            className="w-11 h-11 rounded-full bg-surface border border-border grid place-items-center text-text-primary shadow-sm active:scale-95"
          >
            <Icon name="close" size={20} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={patient.avatar} alt="Your profile photo" className="w-10 h-10 rounded-full object-cover border border-border ring-2 ring-accent-tint lg:hidden" />
        </div>
        <div>
          <p className="text-caption-sm text-text-secondary">{PRACTICE_NAME}</p>
          <h1 className="font-serif text-headline-lg-mobile lg:text-headline-lg text-text-primary mt-0.5">{month} check-in</h1>
        </div>
        {active && !result && <Progress n={step + 1} total={total} />}
      </header>

      {result ? (
        <Confirmation contacted={result.tasksCreated > 0} />
      ) : !active && prior ? (
        <div className="space-y-4 mt-2">
          <Card className="p-5">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-full bg-success-tint text-success grid place-items-center shrink-0">
                <Icon name="task_alt" />
              </div>
              <div>
                <h2 className="text-title-md text-text-primary leading-tight">{month} check-in submitted</h2>
                <p className="text-caption-sm text-text-secondary mt-1">
                  You sent it on {fmtDay(prior.submittedAt)}. You can send an update if something has changed since then.
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <Button onClick={() => setStarted(true)} full>
                Send an update
              </Button>
              <Button href="/portal" variant="secondary" full>
                Back to home
              </Button>
            </div>
          </Card>
          <CheckInNotice />
        </div>
      ) : (
        <div className="flex flex-col gap-4 mt-2">
          <CheckInNotice />
          <QuestionCard key={q.id} q={q} value={answers[q.id]} onChange={answer} />
          <ExtrasCard comment={comment} setComment={setComment} contact={contact} setContact={setContact} />
          <div className="flex items-center gap-3 mt-2">
            <Button variant="secondary" className="flex-1 disabled:opacity-40" disabled={step === 0} onClick={() => setStep(step - 1)}>
              Back
            </Button>
            <Button className="flex-1" disabled={!answers[q.id]} onClick={next}>
              {last ? "Submit check-in" : "Next"}
              <Icon name={last ? "send" : "arrow_forward"} size={18} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
