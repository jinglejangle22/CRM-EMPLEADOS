"use client";

import { useMemo, useState } from "react";
import {
  addDays,
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks,
} from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAppState, ALL_COMPANIES_ID } from "@/lib/app-state";
import type { Interview } from "@/types";
import { InterviewCard } from "@/components/agenda/InterviewCard";
import { formatDayLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

type ViewMode = "dia" | "semana" | "mes";

function sortByStart(items: Interview[]) {
  return [...items].sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
}

export function AgendaPageClient({ interviews }: { interviews: Interview[] }) {
  const { activeCompanyId } = useAppState();
  const [view, setView] = useState<ViewMode>("dia");
  const [cursor, setCursor] = useState<Date>(new Date());
  const [selectedDay, setSelectedDay] = useState<Date>(new Date());

  const scoped = useMemo(
    () => interviews.filter((i) => activeCompanyId === ALL_COMPANIES_ID || i.companyId === activeCompanyId),
    [interviews, activeCompanyId]
  );

  const countByDay = useMemo(() => {
    const map = new Map<string, number>();
    for (const i of scoped) {
      const key = format(new Date(i.startsAt), "yyyy-MM-dd");
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return map;
  }, [scoped]);

  function goPrev() {
    if (view === "dia") {
      const d = subDays(selectedDay, 1);
      setSelectedDay(d);
      setCursor(d);
    } else if (view === "semana") {
      setCursor((c) => subWeeks(c, 1));
    } else {
      setCursor((c) => subMonths(c, 1));
    }
  }

  function goNext() {
    if (view === "dia") {
      const d = addDays(selectedDay, 1);
      setSelectedDay(d);
      setCursor(d);
    } else if (view === "semana") {
      setCursor((c) => addWeeks(c, 1));
    } else {
      setCursor((c) => addMonths(c, 1));
    }
  }

  function goToday() {
    const now = new Date();
    setCursor(now);
    setSelectedDay(now);
  }

  function selectDay(day: Date) {
    setSelectedDay(day);
    setCursor(day);
    setView("dia");
  }

  const headerLabel = useMemo(() => {
    if (view === "dia") return format(selectedDay, "EEEE d 'de' MMMM", { locale: es });
    if (view === "semana") {
      const start = startOfWeek(cursor, { locale: es, weekStartsOn: 1 });
      const end = endOfWeek(cursor, { locale: es, weekStartsOn: 1 });
      return `${format(start, "d MMM", { locale: es })} - ${format(end, "d MMM", { locale: es })}`;
    }
    return format(cursor, "MMMM yyyy", { locale: es });
  }, [view, cursor, selectedDay]);

  const dayInterviews = useMemo(
    () => sortByStart(scoped.filter((i) => isSameDay(new Date(i.startsAt), selectedDay))),
    [scoped, selectedDay]
  );

  const weekDays = useMemo(
    () =>
      eachDayOfInterval({
        start: startOfWeek(cursor, { locale: es, weekStartsOn: 1 }),
        end: endOfWeek(cursor, { locale: es, weekStartsOn: 1 }),
      }),
    [cursor]
  );

  const weekGrouped = useMemo(() => {
    if (view !== "semana") return [];
    const map = new Map<string, Interview[]>();
    for (const day of weekDays) {
      const items = sortByStart(scoped.filter((i) => isSameDay(new Date(i.startsAt), day)));
      if (items.length > 0) map.set(formatDayLabel(day.toISOString()), items);
    }
    return Array.from(map.entries());
  }, [scoped, view, weekDays]);

  const monthDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor), { locale: es, weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(cursor), { locale: es, weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [cursor]);

  return (
    <div className="mx-auto flex w-full max-w-[1000px] flex-col gap-3 px-4 pt-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">Agenda</h1>
      </div>

      <div className="flex h-12 gap-1 rounded-xl bg-neutral-100 p-1">
        {(["dia", "semana", "mes"] as ViewMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => setView(mode)}
            className={cn(
              "flex-1 rounded-lg text-sm font-semibold capitalize",
              view === mode ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500"
            )}
          >
            {mode === "dia" ? "Día" : mode === "semana" ? "Semana" : "Mes"}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={goPrev}
          aria-label="Anterior"
          className="flex size-11 shrink-0 items-center justify-center rounded-full text-neutral-500 active:bg-neutral-100"
        >
          <ChevronLeft className="size-5" />
        </button>
        <button
          type="button"
          onClick={goToday}
          className="min-h-11 flex-1 truncate px-2 text-center text-[15px] font-semibold capitalize text-neutral-900"
        >
          {headerLabel}
        </button>
        <button
          type="button"
          onClick={goNext}
          aria-label="Siguiente"
          className="flex size-11 shrink-0 items-center justify-center rounded-full text-neutral-500 active:bg-neutral-100"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>

      {view === "mes" && (
        <div className="flex flex-col gap-1">
          <div className="grid grid-cols-7 text-center text-[11px] font-semibold text-neutral-400">
            {["L", "M", "X", "J", "V", "S", "D"].map((d, idx) => (
              <span key={`${d}-${idx}`}>{d}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {monthDays.map((day) => {
              const key = format(day, "yyyy-MM-dd");
              const count = countByDay.get(key) ?? 0;
              const inMonth = isSameMonth(day, cursor);
              const today = isToday(day);
              const selected = isSameDay(day, selectedDay);
              return (
                <button
                  type="button"
                  key={key}
                  onClick={() => selectDay(day)}
                  className={cn(
                    "flex aspect-square flex-col items-center justify-center gap-0.5 rounded-xl text-sm",
                    inMonth ? "text-neutral-900" : "text-neutral-300",
                    !selected && today && "ring-1 ring-violet-500",
                    selected && "bg-violet-600 text-white"
                  )}
                >
                  <span className="font-medium">{format(day, "d")}</span>
                  {count > 0 && (
                    <span className={cn("size-1 rounded-full", selected ? "bg-white" : "bg-violet-500")} />
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex flex-col gap-2.5 pb-4">
            <p className="px-1 text-xs font-semibold tracking-wide text-neutral-400">
              {formatDayLabel(selectedDay.toISOString())}
            </p>
            {dayInterviews.length === 0 ? (
              <p className="py-6 text-center text-sm text-neutral-400">No hay entrevistas este día.</p>
            ) : (
              dayInterviews.map((interview) => <InterviewCard key={interview.id} interview={interview} />)
            )}
          </div>
        </div>
      )}

      {view === "semana" && (
        <div className="flex flex-col gap-3 pb-4">
          <div className="grid grid-cols-7 gap-1">
            {weekDays.map((day) => {
              const key = format(day, "yyyy-MM-dd");
              const count = countByDay.get(key) ?? 0;
              const today = isToday(day);
              return (
                <button
                  type="button"
                  key={key}
                  onClick={() => selectDay(day)}
                  className="flex min-h-16 min-w-10 flex-col items-center gap-1 rounded-xl py-2 text-xs font-medium text-neutral-500"
                >
                  <span className="uppercase">{format(day, "EEEEE", { locale: es })}</span>
                  <span
                    className={cn(
                      "flex size-9 items-center justify-center rounded-full text-[15px] font-semibold text-neutral-900",
                      today && "bg-violet-600 text-white"
                    )}
                  >
                    {format(day, "d")}
                  </span>
                  <span className={cn("size-1.5 rounded-full", count > 0 ? "bg-violet-500" : "bg-transparent")} />
                </button>
              );
            })}
          </div>

          {weekGrouped.length === 0 && (
            <p className="py-10 text-center text-sm text-neutral-400">No hay entrevistas agendadas.</p>
          )}
          {weekGrouped.map(([day, dayItems]) => (
            <div key={day} className="flex flex-col gap-2.5">
              <p className="px-1 text-xs font-semibold tracking-wide text-neutral-400">{day}</p>
              {dayItems.map((interview) => (
                <InterviewCard key={interview.id} interview={interview} />
              ))}
            </div>
          ))}
        </div>
      )}

      {view === "dia" && (
        <div className="flex flex-col gap-2.5 pb-4">
          {dayInterviews.length === 0 ? (
            <p className="py-10 text-center text-sm text-neutral-400">No hay entrevistas agendadas.</p>
          ) : (
            dayInterviews.map((interview) => <InterviewCard key={interview.id} interview={interview} />)
          )}
        </div>
      )}
    </div>
  );
}
