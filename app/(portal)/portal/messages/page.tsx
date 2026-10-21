"use client";

import { Fragment, useEffect, useRef, useState, type FormEvent } from "react";
import { PortalHeader, usePortalPatient } from "@/components/portal/common";
import { DateDivider, MessageBubble } from "@/components/portal/message-bubbles";
import { Icon } from "@/components/ui";
import { useApp } from "@/lib/store";

const dayLabel = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

export default function PortalMessages() {
  const patient = usePortalPatient();
  const allMessages = useApp((s) => s.messages);
  const staff = useApp((s) => s.staff);
  const sendMessage = useApp((s) => s.sendMessage);
  const [body, setBody] = useState("");
  const [sent, setSent] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  // Patients only ever see their own thread.
  const thread = allMessages.filter((m) => m.patientId === patient?.id).sort((a, b) => a.at.localeCompare(b.at));

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [thread.length]);

  if (!patient) return null;

  const send = (e?: FormEvent) => {
    e?.preventDefault();
    const text = body.trim();
    if (!text) return;
    sendMessage(patient.id, "patient", text);
    setBody("");
    setSent(true);
  };

  return (
    <div className="lg:max-w-3xl">
      <PortalHeader title="Messages" avatar={patient.avatar} />
      <div className="flex flex-col gap-4">
        <div className="w-full bg-accent-tint border border-border rounded-xl p-3 flex items-start gap-2.5">
          <Icon name="info" size={20} className="text-accent-fill shrink-0 mt-0.5" />
          <p className="text-caption-sm text-text-secondary leading-[19px]">
            For non-urgent questions. Replies within 2 business days. Emergencies: <span className="font-semibold text-text-primary">call 911</span>.
          </p>
        </div>

        <div className="flex flex-col gap-4 pt-1" aria-live="polite">
          {thread.length === 0 && <p className="text-center text-caption-sm text-text-tertiary py-8">No messages yet. Your care team will reply here.</p>}
          {thread.map((m, i) => {
            const day = dayLabel(m.at);
            const newDay = i === 0 || dayLabel(thread[i - 1].at) !== day;
            return (
              <Fragment key={m.id}>
                {newDay && <DateDivider label={day} />}
                <MessageBubble m={m} staff={staff} />
              </Fragment>
            );
          })}
          {sent && <p className="self-end text-[12px] text-text-tertiary">Sent. Your care team replies within 2 business days.</p>}
          <div ref={endRef} />
        </div>

        <form onSubmit={send} className="sticky bottom-[80px] lg:bottom-6 z-20 -mx-5 lg:mx-0 px-4 py-2.5 bg-surface border-t lg:border border-border lg:rounded-2xl shadow-sticky flex items-end gap-2">
          <span aria-hidden className="w-11 h-11 grid place-items-center text-text-tertiary shrink-0">
            <Icon name="attach_file" size={22} />
          </span>
          <label htmlFor="composer" className="sr-only">
            Write a non-urgent message
          </label>
          <textarea
            id="composer"
            rows={1}
            value={body}
            onChange={(e) => {
              setBody(e.target.value);
              setSent(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Write a non-urgent message"
            className="flex-1 min-h-11 max-h-32 bg-surface-alt border border-border rounded-xl px-3.5 py-2.5 text-[14px] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-fill focus:ring-2 focus:ring-accent-tint resize-none"
          />
          <button
            type="submit"
            aria-label="Send message"
            disabled={!body.trim()}
            className="w-11 h-11 rounded-full bg-accent-fill hover:bg-accent-pressed disabled:bg-[#C9D2F7] text-white grid place-items-center shrink-0"
          >
            <Icon name="send" size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
