"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import { PRACTICE_NAME } from "@/lib/data";
import { roleChip, useCurrentUser } from "@/components/shell";
import { Avatar, Card, PageHeader } from "@/components/ui";
import { Confirmation, MenuRow } from "@/components/admin/common";

export default function MorePage() {
  const router = useRouter();
  const { userId, role, staff: me } = useCurrentUser();
  const resetDemo = useApp((s) => s.resetDemo);
  const signIn = useApp((s) => s.signIn);
  const signOut = useApp((s) => s.signOut);
  const [resetDone, setResetDone] = useState(false);

  const reset = () => {
    if (!window.confirm("Reset all demo data to the starting story? Entries made in this browser will be cleared.")) return;
    resetDemo();
    if (userId) signIn(userId);
    setResetDone(true);
  };

  return (
    <div className="flex flex-col gap-4 lg:max-w-2xl">
      <PageHeader title="More" caption={PRACTICE_NAME} avatar={me?.avatar} role={roleChip(role)} />

      {me && (
        <Card className="p-4 flex items-center gap-3">
          <Avatar src={me.avatar} alt="" size={56} />
          <div className="min-w-0 flex-1">
            <p className="text-title-md font-semibold truncate">{me.name}</p>
            <p className="text-caption-sm text-text-secondary">{me.title}</p>
          </div>
          <span className="text-[12px] font-semibold text-accent-fill bg-accent-tint rounded-full px-2.5 py-1">{roleChip(role)}</span>
        </Card>
      )}

      {resetDone && <Confirmation>Demo data reset. You are still signed in.</Confirmation>}

      <Card className="overflow-hidden divide-y divide-border">
        <MenuRow href="/more/reports" icon="monitoring" label="Reports" sub="Census, check-ins, exports" />
        <MenuRow href="/more/users" icon="manage_accounts" label="Users and roles" sub={role === "admin" ? "Invite, remove access, permissions" : "Admin only, view permissions"} />
        <MenuRow href="/more/settings" icon="tune" label="Review rules and settings" sub="BP review rule, patient visibility" />
        <MenuRow href="/more/audit" icon="history" label="Audit log" sub="Append-only record of every action" />
      </Card>

      <Card className="overflow-hidden divide-y divide-border">
        <MenuRow onClick={reset} icon="restart_alt" label="Reset demo data" sub="Return to the Oct 22 starting story" />
        <MenuRow
          onClick={() => {
            signOut();
            router.push("/sign-in");
          }}
          icon="logout"
          label="Sign out"
          tone="danger"
        />
      </Card>
    </div>
  );
}
