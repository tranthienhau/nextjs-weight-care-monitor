import clsx from "clsx";
import { Icon } from "@/components/ui";

/** Taken / scheduled dose dots (patient-reported). */
export function AdherenceDots({ taken, scheduled }: { taken: number; scheduled: number }) {
  return (
    <ol className="mt-3 flex flex-wrap gap-3 pt-1 pb-2" aria-label={`${taken} of ${scheduled} doses reported taken`}>
      {Array.from({ length: scheduled }, (_, i) => {
        const done = i < taken;
        return (
          <li key={i} className="flex flex-col items-center w-14">
            <span
              className={clsx(
                "flex h-9 w-9 items-center justify-center rounded-full",
                done ? "bg-primary-container text-white" : "border-2 border-dashed border-border text-text-tertiary",
              )}
            >
              <Icon name={done ? "check" : "remove"} size={18} />
            </span>
            <span className="mt-1.5 text-[11px] text-text-secondary">
              Dose {i + 1}
              <span className="sr-only">{done ? ", taken" : ", not reported taken"}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
