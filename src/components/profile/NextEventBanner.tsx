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
    <div className="mx-4 flex min-h-14 items-center gap-3 rounded-xl bg-amber-50 px-4 py-3 text-amber-800">
      <Icon className="size-4.5 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{label}</p>
        <p className="truncate text-sm text-amber-700">{relativeDayLabel(when)}</p>
      </div>
    </div>
  );
}
