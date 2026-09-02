import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePermissionUser } from "@/lib/session";
import { canViewCompany } from "@/lib/permissions";
import { mapEmployee, mapTimelineEvent } from "@/lib/mappers";
import { pickNextFollowup } from "@/lib/derive";
import { EmployeeProfileClient } from "@/components/empleados/EmployeeProfileClient";

export default async function EmployeeProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requirePermissionUser();

  const employeeRow = await prisma.employee.findUnique({
    where: { id },
    include: { tags: { include: { tag: true } } },
  });
  if (!employeeRow || !canViewCompany(user, employeeRow.companyId)) notFound();

  const [followupRows, timelineRows] = await Promise.all([
    prisma.followup.findMany({ where: { employeeId: id } }),
    prisma.timelineEvent.findMany({
      where: employeeRow.candidateId
        ? { OR: [{ employeeId: id }, { candidateId: employeeRow.candidateId }] }
        : { employeeId: id },
      include: { createdBy: { select: { name: true } } },
      orderBy: { occurredAt: "desc" },
    }),
  ]);

  const employee = mapEmployee(employeeRow);
  const nextFollowup = pickNextFollowup(
    followupRows.map((f) => ({
      id: f.id,
      candidateId: f.candidateId ?? undefined,
      employeeId: f.employeeId ?? undefined,
      dueAt: f.dueAt.toISOString(),
      note: f.note,
      status: f.status,
    }))
  );
  const timeline = timelineRows.map(mapTimelineEvent);

  return (
    <EmployeeProfileClient
      employee={employee}
      nextFollowupNote={nextFollowup?.note ?? null}
      nextFollowupDueAt={nextFollowup?.dueAt ?? null}
      timeline={timeline}
    />
  );
}
