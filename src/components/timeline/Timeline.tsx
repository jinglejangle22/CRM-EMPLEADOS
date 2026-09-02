import {
  FileText,
  ArrowRightLeft,
  Phone,
  MessageCircle,
  Mail,
  Users,
  StickyNote,
  CalendarClock,
  CalendarCheck,
  AlertTriangle,
  Award,
  Briefcase,
  RefreshCw,
  Clock,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import type { TimelineEvent, TimelineEventType } from "@/types";
import { formatDayLabel, formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";

const iconByType: Record<TimelineEventType, LucideIcon> = {
  CV_RECEIVED: FileText,
  STAGE_CHANGE: ArrowRightLeft,
  INTERACTION: MessageCircle,
  NOTE: StickyNote,
  INTERVIEW_SCHEDULED: CalendarClock,
  INTERVIEW_UPDATED: CalendarCheck,
  INCIDENT: AlertTriangle,
  RECOGNITION: Award,
  HIRED: Briefcase,
  STATUS_CHANGE: RefreshCw,
  FOLLOWUP_CREATED: Clock,
  FOLLOWUP_COMPLETED: CalendarCheck,
  FOLLOWUP_CANCELLED: XCircle,
};

const toneByType: Record<TimelineEventType, string> = {
  CV_RECEIVED: "bg-neutral-100 text-neutral-600",
  STAGE_CHANGE: "bg-sky-100 text-sky-700",
  INTERACTION: "bg-emerald-100 text-emerald-700",
  NOTE: "bg-neutral-100 text-neutral-600",
  INTERVIEW_SCHEDULED: "bg-violet-100 text-violet-700",
  INTERVIEW_UPDATED: "bg-violet-100 text-violet-700",
  INCIDENT: "bg-rose-100 text-rose-700",
  RECOGNITION: "bg-amber-100 text-amber-700",
  HIRED: "bg-emerald-100 text-emerald-700",
  STATUS_CHANGE: "bg-sky-100 text-sky-700",
  FOLLOWUP_CREATED: "bg-amber-100 text-amber-700",
  FOLLOWUP_COMPLETED: "bg-emerald-100 text-emerald-700",
  FOLLOWUP_CANCELLED: "bg-neutral-100 text-neutral-500",
};

function interactionIcon(title: string) {
  if (/llamada/i.test(title)) return Phone;
  if (/whatsapp/i.test(title)) return MessageCircle;
  if (/email|correo/i.test(title)) return Mail;
  if (/presencial/i.test(title)) return Users;
  return MessageCircle;
}

export function Timeline({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) {
    return <p className="py-8 text-center text-sm text-neutral-400">Todavía no hay actividad registrada.</p>;
  }

  const groups = groupByDay(events);

  return (
    <div className="flex flex-col gap-5">
      {groups.map(([day, dayEvents]) => (
        <div key={day}>
          <p className="mb-2 text-xs font-semibold tracking-wide text-neutral-400">{day}</p>
          <ol className="flex flex-col gap-3 border-l border-neutral-200 pl-4">
            {dayEvents.map((event) => {
              const Icon = event.type === "INTERACTION" ? interactionIcon(event.title) : iconByType[event.type];
              return (
                <li key={event.id} className="relative">
                  <span
                    className={cn(
                      "absolute -left-[1.45rem] flex size-6 items-center justify-center rounded-full ring-4 ring-white",
                      toneByType[event.type]
                    )}
                  >
                    <Icon className="size-3.5" />
                  </span>
                  <div className="rounded-xl bg-neutral-50 px-3 py-2">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-sm font-medium text-neutral-900">{event.title}</p>
                      <span className="shrink-0 text-[11px] text-neutral-400">{formatTime(event.occurredAt)}</span>
                    </div>
                    {event.description && <p className="mt-0.5 text-xs text-neutral-500">{event.description}</p>}
                    <p className="mt-1 text-[11px] text-neutral-400">{event.createdByName}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      ))}
    </div>
  );
}

function groupByDay(events: TimelineEvent[]): [string, TimelineEvent[]][] {
  const sorted = [...events].sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
  const map = new Map<string, TimelineEvent[]>();
  for (const event of sorted) {
    const label = formatDayLabel(event.occurredAt);
    if (!map.has(label)) map.set(label, []);
    map.get(label)!.push(event);
  }
  return Array.from(map.entries());
}
