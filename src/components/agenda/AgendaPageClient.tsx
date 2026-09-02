"use client";

import { useMemo, useState } from "react";
import { isToday, isWithinInterval, startOfWeek, endOfWeek } from "date-fns";
import { es } from "date-fns/locale";
import { useAppState, ALL_COMPANIES_ID } from "@/lib/app-state";
import type { Interview } from "@/types";
import { InterviewCard } from "@/components/agenda/InterviewCard";
import { formatDayLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

type ViewMode = "dia" | "semana";

export function AgendaPageClient({ interviews }: { interviews: Interview[] }) {
  const { activeCompanyId } = useAppState();
  const [view, setView] = useState<ViewMode>("dia");

  const scoped = useMemo(
    () => interviews.filter((i) => activeCompanyId === ALL_COMPANIES_ID || i.companyId === activeCompanyId),
    [interviews, activeCompanyId]
  );

  const grouped = useMemo(() => {
    const now = new Date();
    let list = scoped;
    if (view === "dia") {
      list = list.filter((i) => isToday(new Date(i.startsAt)));
    } else {
      const range = { start: startOfWeek(now, { locale: es, weekStartsOn: 1 }), end: endOfWeek(now, { locale: es, weekStartsOn: 1 }) };
      list = list.filter((i) => isWithinInterval(new Date(i.startsAt), range));
    }
    list = [...list].sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());

    const map = new Map<string, typeof list>();
    for (const interview of list) {
      const label = formatDayLabel(interview.startsAt);
      if (!map.has(label)) map.set(label, []);
      map.get(label)!.push(interview);
    }
    return Array.from(map.entries());
  }, [scoped, view]);

  return (
    <div className="flex flex-col gap-3 px-4 pt-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-neutral-900">Agenda</h1>
      </div>

      <div className="flex gap-2 rounded-xl bg-neutral-100 p-1">
        {(["dia", "semana"] as ViewMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => setView(mode)}
            className={cn(
              "h-9 flex-1 rounded-lg text-sm font-medium capitalize",
              view === mode ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500"
            )}
          >
            {mode === "dia" ? "Día" : "Semana"}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4 pb-4">
        {grouped.length === 0 && (
          <p className="py-10 text-center text-sm text-neutral-400">No hay entrevistas agendadas.</p>
        )}
        {grouped.map(([day, dayInterviews]) => (
          <div key={day} className="flex flex-col gap-2.5">
            <p className="px-1 text-xs font-semibold tracking-wide text-neutral-400">{day}</p>
            {dayInterviews.map((interview) => (
              <InterviewCard key={interview.id} interview={interview} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
