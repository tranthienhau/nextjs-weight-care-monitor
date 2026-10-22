"use client";

import { useState } from "react";
import { downloadText, toCsv } from "@/lib/format";
import { useApp } from "@/lib/store";
import { Icon } from "@/components/ui";
import { useCurrentUser } from "@/components/shell";
import { can } from "./PatientTabs";

type Row = Record<string, string | number | null | undefined>;

/** Permission-checked CSV export that records an audit event. */
export function ExportButton({ dataset, fileName, rows }: { dataset: string; fileName: string; rows: () => Row[] }) {
  const { userId, role } = useCurrentUser();
  const recordExport = useApp((s) => s.recordExport);
  const [done, setDone] = useState<number | null>(null);
  const allowed = can(role, "export");

  const run = () => {
    if (!userId || !allowed) return;
    const data = rows();
    downloadText(fileName, toCsv(data));
    recordExport(userId, dataset, data.length);
    setDone(data.length);
  };

  return (
    <div className="flex flex-col items-end">
      <button
        type="button"
        onClick={run}
        disabled={!allowed}
        title={allowed ? undefined : "Export needs physician or admin permission"}
        className="h-9 px-3 rounded-full border border-accent-fill text-accent-fill hover:bg-accent-tint/50 text-[12px] font-semibold inline-flex items-center gap-1 disabled:border-border disabled:text-text-tertiary disabled:hover:bg-transparent"
      >
        <Icon name={allowed ? "download" : "lock"} size={16} />
        Export CSV
      </button>
      {!allowed && <span className="text-[12px] text-text-tertiary mt-1">Physician or admin only</span>}
      {done != null && (
        <span role="status" className="text-[12px] text-success mt-1">
          {done} rows exported, audit logged
        </span>
      )}
    </div>
  );
}
