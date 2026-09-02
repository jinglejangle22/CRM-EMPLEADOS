import { prisma } from "@/lib/prisma";
import { requirePermissionUser } from "@/lib/session";
import { companyScopeFilter } from "@/lib/scope";
import { mapCandidate, mapEmployee, mapInterview, mapInteraction, mapFollowup } from "@/lib/mappers";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export default async function DashboardPage() {
  const user = await requirePermissionUser();
  const companyId = companyScopeFilter(user);

  const [candidateRows, employeeRows, interviewRows, interactionRows, followupRows, incidentRows] =
    await Promise.all([
      prisma.candidate.findMany({
        where: companyId ? { companyId } : undefined,
        include: { tags: { include: { tag: true } } },
      }),
      prisma.employee.findMany({
        where: companyId ? { companyId } : undefined,
        include: { tags: { include: { tag: true } } },
      }),
      prisma.interview.findMany({
        where: companyId ? { companyId } : undefined,
        include: {
          candidate: { select: { id: true, firstName: true, lastName: true, phone: true } },
          interviewer: { select: { name: true } },
        },
      }),
      prisma.interaction.findMany({
        where: { candidate: companyId ? { companyId } : {} },
        include: { user: { select: { name: true } } },
      }),
      prisma.followup.findMany({
        where: { candidate: companyId ? { companyId } : {} },
      }),
      prisma.employeeIncident.findMany({
        where: { companyId: companyId ?? undefined, type: "LLEGADA_TARDE" },
        select: { companyId: true },
      }),
    ]);

  const candidates = candidateRows.map((row) => mapCandidate(row));
  const employees = employeeRows.map(mapEmployee);
  const interviews = interviewRows.map(mapInterview);
  const interactions = interactionRows.map(mapInteraction);
  const followups = followupRows.map(mapFollowup);

  const lateArrivalsByCompanyId = incidentRows.reduce<Record<string, number>>((acc, i) => {
    acc[i.companyId] = (acc[i.companyId] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <DashboardClient
      candidates={candidates}
      employees={employees}
      interviews={interviews}
      interactions={interactions}
      followups={followups}
      lateArrivalsByCompanyId={lateArrivalsByCompanyId}
    />
  );
}
