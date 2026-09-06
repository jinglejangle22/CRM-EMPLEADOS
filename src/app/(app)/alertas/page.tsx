import Link from "next/link";
import { Cake, CalendarClock, ChevronRight, Clock, FileText, type LucideIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePermissionUser } from "@/lib/session";
import { companyScopeFilter } from "@/lib/scope";
import { formatDateShort, relativeDayLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

type AlertRow = {
  key: string;
  title: string;
  subtitle: string;
  href: string;
  tone: "neutral" | "amber" | "red";
};

function daysUntilNextBirthday(birthDate: Date, today: Date): number {
  const next = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
  next.setHours(0, 0, 0, 0);
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (next < start) next.setFullYear(next.getFullYear() + 1);
  return Math.round((next.getTime() - start.getTime()) / 86400000);
}

export default async function AlertasPage() {
  const user = await requirePermissionUser();
  const companyId = companyScopeFilter(user);
  const now = new Date();
  const in7Days = new Date(now.getTime() + 7 * 86400000);

  const [followupRows, interviewRows, candidateRows, employeeRows] = await Promise.all([
    prisma.followup.findMany({
      where: {
        status: "PENDIENTE",
        ...(companyId ? { OR: [{ candidate: { companyId } }, { employee: { companyId } }] } : {}),
      },
      include: {
        candidate: { select: { id: true, firstName: true, lastName: true } },
        employee: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { dueAt: "asc" },
    }),
    prisma.interview.findMany({
      where: {
        status: { in: ["PENDIENTE", "CONFIRMADA"] },
        startsAt: { gte: now, lte: in7Days },
        ...(companyId ? { companyId } : {}),
      },
      include: { candidate: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { startsAt: "asc" },
    }),
    prisma.candidate.findMany({
      where: { stage: "CV_RECIBIDO", isArchived: false, ...(companyId ? { companyId } : {}) },
      orderBy: { cvReceivedDate: "asc" },
    }),
    prisma.employee.findMany({
      where: {
        birthDate: { not: null },
        status: { notIn: ["DESVINCULADO"] },
        ...(companyId ? { companyId } : {}),
      },
      select: { id: true, firstName: true, lastName: true, birthDate: true },
    }),
  ]);

  const seguimientos: AlertRow[] = followupRows.map((f) => {
    const person = f.candidate ?? f.employee;
    const href = f.candidate ? `/candidatos/${f.candidate.id}` : `/empleados/${f.employee?.id}`;
    const vencido = new Date(f.dueAt) < now;
    return {
      key: f.id,
      title: person ? `${person.firstName} ${person.lastName}` : "Seguimiento",
      subtitle: `${f.note} · ${relativeDayLabel(f.dueAt.toISOString())}`,
      href,
      tone: vencido ? "red" : "amber",
    };
  });

  const entrevistas: AlertRow[] = interviewRows.map((i) => ({
    key: i.id,
    title: `${i.candidate.firstName} ${i.candidate.lastName}`,
    subtitle: `${i.position} · ${relativeDayLabel(i.startsAt.toISOString())}`,
    href: `/candidatos/${i.candidate.id}`,
    tone: i.status === "PENDIENTE" ? "amber" : "neutral",
  }));

  const cumpleanios: AlertRow[] = employeeRows
    .map((e) => ({ ...e, days: daysUntilNextBirthday(new Date(e.birthDate!), now) }))
    .filter((e) => e.days <= 30)
    .sort((a, b) => a.days - b.days)
    .map((e) => ({
      key: e.id,
      title: `${e.firstName} ${e.lastName}`,
      subtitle: e.days === 0 ? "Hoy" : e.days === 1 ? "Mañana" : `En ${e.days} días`,
      href: `/empleados/${e.id}`,
      tone: e.days === 0 ? "red" : "neutral" as const,
    }));

  const cvs: AlertRow[] = candidateRows.map((c) => ({
    key: c.id,
    title: `${c.firstName} ${c.lastName}`,
    subtitle: `${c.position} · Recibido ${formatDateShort(c.cvReceivedDate.toISOString())}`,
    href: `/candidatos/${c.id}`,
    tone: "amber",
  }));

  return (
    <div className="mx-auto flex w-full max-w-[640px] flex-col gap-4 px-4 pb-8 pt-4">
      <h1 className="text-2xl font-bold text-neutral-900">Alertas</h1>

      <AlertSection title="Seguimientos" icon={Clock} rows={seguimientos} empty="No hay seguimientos pendientes." />
      <AlertSection title="Entrevistas próximas" icon={CalendarClock} rows={entrevistas} empty="No hay entrevistas en los próximos 7 días." />
      <AlertSection title="Cumpleaños" icon={Cake} rows={cumpleanios} empty="No hay cumpleaños en los próximos 30 días." />
      <AlertSection title="CV sin revisar" icon={FileText} rows={cvs} empty="No hay CVs pendientes de revisión." />
    </div>
  );
}

function AlertSection({
  title,
  icon: Icon,
  rows,
  empty,
}: {
  title: string;
  icon: LucideIcon;
  rows: AlertRow[];
  empty: string;
}) {
  return (
    <section className="rounded-2xl bg-white p-3 ring-1 ring-neutral-100">
      <h2 className="flex items-center gap-2 px-1 pb-2 text-[15px] font-semibold text-neutral-900">
        <Icon className="size-4 text-neutral-500" />
        {title}
        <span className="ml-auto text-sm font-medium text-neutral-400">{rows.length}</span>
      </h2>
      {rows.length === 0 ? (
        <p className="px-1 py-2 text-sm text-neutral-400">{empty}</p>
      ) : (
        <div className="flex flex-col divide-y divide-neutral-100">
          {rows.map((row) => (
            <Link
              key={row.key}
              href={row.href}
              className="flex min-h-14 items-center gap-3 px-1 py-2.5 text-left active:bg-neutral-50"
            >
              <span
                className={cn(
                  "size-2 shrink-0 rounded-full",
                  row.tone === "red" ? "bg-rose-500" : row.tone === "amber" ? "bg-amber-500" : "bg-neutral-300"
                )}
              />
              <span className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-medium text-neutral-800">{row.title}</p>
                <p className="truncate text-sm text-neutral-500">{row.subtitle}</p>
              </span>
              <ChevronRight className="size-4 shrink-0 text-neutral-300" />
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
