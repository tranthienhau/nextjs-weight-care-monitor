const d = (iso: string) => new Date(iso.length === 10 ? iso + "T12:00:00" : iso);

/** "Oct 22" */
export const fmtDay = (iso: string) => d(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
/** "Oct 22, 2026" */
export const fmtDate = (iso: string) => d(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
/** "9:34 AM" */
export const fmtTime = (iso: string) => d(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
/** "Oct 22, 9:34 AM" */
export const fmtDayTime = (iso: string) => `${fmtDay(iso)}, ${fmtTime(iso)}`;
/** "Thu, Oct 22" */
export const fmtWeekday = (iso: string) => d(iso).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

/** Value with unit; null renders "Not measured" (missing is never zero). */
export const fmtVal = (v: number | null | undefined, unit: string) =>
  v == null ? "Not measured" : `${Number.isInteger(v) ? v : v.toFixed(1)}${unit === "%" ? " %" : unit === "level" ? "" : " " + unit}`;

export const signed = (v: number) => `${v > 0 ? "+" : v < 0 ? "-" : ""}${Math.abs(v).toFixed(1)}`;

export const kgToLb = (kg: number) => Math.round(kg * 2.20462 * 10) / 10;
export const lbToKg = (lb: number) => Math.round((lb / 2.20462) * 10) / 10;

export const toCsv = (rows: Record<string, string | number | null | undefined>[]) => {
  if (!rows.length) return "";
  const cols = Object.keys(rows[0]);
  const esc = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
};

export const downloadText = (name: string, text: string, type = "text/csv") => {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
};
