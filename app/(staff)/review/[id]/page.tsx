"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import { DEMO_TODAY } from "@/lib/data";
import { fmtDate, fmtDay, fmtVal } from "@/lib/format";
import { bpFor, getPatient, latest } from "@/lib/selectors";
import { roleChip, useCurrentUser } from "@/components/shell";
import { Avatar, BackHeader, Button, Card, Icon, inputCls } from "@/components/ui";
import { planMed } from "@/components/review/queue";
import { reviewItems } from "@/components/review/items";
import { CardHead, FollowUpCard, ItemsCard, MessageCard, type TaskDraft } from "@/components/review/parts";

const MARIA_NOTE =
  "Steady weight trend on the current plan. Check-in notes mild nausea on dose day, no other concerns. Continue current plan and revisit nausea at the next office visit.";
const MARIA_MESSAGE =
  "Hi Maria, I reviewed your recent weight readings and your October check-in today. Mild nausea after a dose is common. Try smaller meals on dose day and message us if it lasts more than 3 days.";

export default function DocumentReviewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const p = getPatient(id);
  const { staff: me, role, userId } = useCurrentUser();
  const measurements = useApp((s) => s.measurements);
  const bpReadings = useApp((s) => s.bpReadings);
  const labResults = useApp((s) => s.labResults);
  const checkIns = useApp((s) => s.checkIns);
  const staff = useApp((s) => s.staff);
  const reviews = useApp((s) => s.reviews);
  const signReview = useApp((s) => s.signReview);

  const items = useMemo(() => reviewItems(id, { measurements, bpReadings, labResults, checkIns, staff }), [id, measurements, bpReadings, labResults, checkIns, staff]);
  const mas = staff.filter((s) => s.role === "ma" && s.status === "active");
  const isMaria = id === "p-alvarez";

  const [checked, setChecked] = useState(() => new Set(items.map((i) => i.id)));
  const [note, setNote] = useState(isMaria ? MARIA_NOTE : "");
  const [task, setTask] = useState<TaskDraft>({
    on: isMaria,
    assigneeId: mas.find((m) => m.id === p?.maId)?.id ?? mas[0]?.id ?? "",
    due: "2026-10-29",
    title: isMaria ? "Call patient about nausea after dose" : "",
  });
  const [msgOn, setMsgOn] = useState(isMaria);
  const [msg, setMsg] = useState(isMaria ? MARIA_MESSAGE : "");
  const [error, setError] = useState("");

  if (!p) {
    return (
      <div className="py-16 text-center">
        <p className="text-title-md font-semibold mb-2">Patient not found</p>
        <Link href="/review" className="text-accent-fill font-semibold">
          Back to review queue
        </Link>
      </div>
    );
  }

  const signer = role === "physician" ? me : staff.find((s) => s.role === "physician");
  const canSign = role === "physician";
  const signerName = (me?.name ?? "").replace(/^Dr\.\s*/, "");
  const w = latest(measurements, p.id, "weight");
  const bp = bpFor(bpReadings, p.id).at(-1);
  const lastReview = reviews.filter((r) => r.patientId === p.id).sort((a, b) => b.at.localeCompare(a.at))[0];
  const toggle = (itemId: string) =>
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });

  const sign = () => {
    if (!canSign || !userId) return;
    if (!checked.size) return setError("Select at least one item to sign.");
    if (!note.trim()) return setError("Add an assessment before signing.");
    if (task.on && (!task.title.trim() || !task.assigneeId || !task.due)) return setError("Complete the follow-up task or turn it off.");
    if (msgOn && !msg.trim()) return setError("Write the patient message or turn it off.");
    signReview({
      patientId: p.id,
      by: userId,
      note: note.trim(),
      itemLabels: items.filter((i) => checked.has(i.id)).map((i) => i.label),
      itemIds: items.filter((i) => checked.has(i.id)).flatMap((i) => i.recordIds),
      task: task.on ? { title: task.title.trim(), assigneeId: task.assigneeId, due: task.due } : undefined,
      messageToPatient: msgOn ? msg.trim() : undefined,
    });
    router.push(`/review?signed=${encodeURIComponent(p.name)}`);
  };

  return (
    <div className="pb-48 lg:pb-10">
      <BackHeader
        title="Review"
        subtitle={`${p.name} - ${p.mrn}`}
        right={
          me && (
            <span className="flex items-center gap-2 pl-1 pr-2 py-1 bg-surface rounded-full border border-border shadow-card-sm">
              <Avatar src={me.avatar} alt="" size={28} />
              <span className="text-[12px] font-semibold text-accent-fill bg-accent-tint px-1.5 py-0.5 rounded-full">{roleChip(role)}</span>
            </span>
          )
        }
      />

      <div className="pt-4 space-y-4 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0 lg:items-start">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 bg-surface rounded-control border border-border shadow-card-sm text-[13px]">
            <Link href={`/patients/${p.id}`} className="flex items-center gap-2.5 min-w-0 hover:underline">
              <Avatar src={p.avatar} alt="" size={28} />
              <span className="font-medium text-text-primary truncate">
                {p.name}, {p.age}y
              </span>
              <span className="text-text-secondary truncate hidden sm:inline">- Wk {p.programWeek} - {planMed(p.id)}</span>
            </Link>
            <span className="text-[12px] font-semibold text-warning bg-warning-tint px-2 py-0.5 rounded-full shrink-0">{items.length ? "Awaiting MD" : "Up to date"}</span>
          </div>

          <ItemsCard items={items} checked={checked} onToggle={toggle} />

          <Card className="p-4">
            <CardHead icon="history_edu" title="Context" />
            <dl className="grid grid-cols-2 gap-3 text-caption-sm">
              <div>
                <dt className="text-text-tertiary">Current plan</dt>
                <dd className="text-text-primary font-medium">{planMed(p.id)}</dd>
              </div>
              <div>
                <dt className="text-text-tertiary">Latest weight</dt>
                <dd className="text-text-primary font-medium">{fmtVal(w?.value ?? null, "lb")}</dd>
              </div>
              <div>
                <dt className="text-text-tertiary">Latest BP</dt>
                <dd className="text-text-primary font-medium">{bp ? `${bp.systolic}/${bp.diastolic} mmHg, ${fmtDay(bp.measuredAt)}` : "No reading"}</dd>
              </div>
              <div>
                <dt className="text-text-tertiary">Last review</dt>
                <dd className="text-text-primary font-medium">{lastReview ? fmtDay(lastReview.at) : "No review yet"}</dd>
              </div>
            </dl>
            {lastReview && <p className="mt-3 pt-3 border-t border-border text-caption-sm text-text-secondary">&quot;{lastReview.note}&quot;</p>}
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-4">
            <CardHead icon="edit_note" title="Assessment and follow-up note" />
            <label className="block">
              <span className="sr-only">Assessment (required)</span>
              <textarea
                rows={5}
                required
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Enter clinical assessment (required)"
                className={`${inputCls} h-auto py-3 resize-none bg-surface-bright`}
              />
            </label>
            <div className="flex items-center justify-between mt-2 text-[12px] text-text-tertiary">
              <span className="flex items-center gap-1">
                <Icon name="lock" size={14} />
                Required for signing
              </span>
              <span>{note.length} chars</span>
            </div>
          </Card>

          <FollowUpCard draft={task} onChange={setTask} mas={mas} />
          <MessageCard on={msgOn} onToggle={setMsgOn} body={msg} onBody={setMsg} signer={signer} patientFirst={p.firstName} />

          <div className="p-3 bg-accent-tint/60 rounded-control border border-[#D5DDFB] flex items-start gap-2.5 text-[12px] text-text-secondary">
            <Icon name="verified_user" size={17} className="text-accent-fill" />
            <span>Your signature and timestamp are recorded in the Steadfast audit log.</span>
          </div>

          <footer className="fixed bottom-0 inset-x-0 z-40 bg-surface-alt/95 backdrop-blur border-t border-border shadow-sticky px-5 pt-3.5 pb-[max(env(safe-area-inset-bottom),20px)] lg:static lg:bg-transparent lg:border-0 lg:shadow-none lg:p-0">
            <div className="max-w-xl mx-auto lg:max-w-none">
              {error && (
                <p role="alert" className="text-[13px] text-danger text-center mb-2">
                  {error}
                </p>
              )}
              <p className="flex items-center justify-center gap-1.5 text-[12px] text-text-secondary mb-2.5 text-center">
                <Icon name="draw" size={15} className="text-accent-fill" />
                {canSign ? (
                  <span>
                    Signing as <strong className="text-text-primary font-semibold">{signerName}, MD</strong> - {fmtDate(DEMO_TODAY)}
                  </span>
                ) : (
                  <span>Only a physician can sign reviews. You are signed in as {me?.name} ({me?.title}).</span>
                )}
              </p>
              <Button full icon="check_circle" onClick={sign} disabled={!canSign || items.length === 0}>
                Sign and mark reviewed
              </Button>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
