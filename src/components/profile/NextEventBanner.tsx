import { CalendarClock, Clock } from "lucide-react";
import { relativeDayLabel } from "@/lib/format";

export function NextEventBanner({
  kind,
  label,
  when,
}: {
  kind: "interview" | "followup";
  label: string;
  when: string;
}) {
  const Icon = kind === "interview" ? CalendarClock : Clock;
  return (
    <div className="mx-4 flex items-center gap-2.5 rounded-xl bg-amber-50 px-3.5 py-2.5 text-amber-800">
      <Icon className="size-4 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold">{label}</p>
        <p className="truncate text-[11px] text-amber-700">{relativeDayLabel(when)}</p>
      </div>
    </div>
  );
}
