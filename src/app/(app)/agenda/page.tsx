import { prisma } from "@/lib/prisma";
import { requirePermissionUser } from "@/lib/session";
import { companyScopeFilter } from "@/lib/scope";
import { mapInterview } from "@/lib/mappers";
import { AgendaPageClient } from "@/components/agenda/AgendaPageClient";

export default async function AgendaPage() {
  const user = await requirePermissionUser();
  const companyId = companyScopeFilter(user);

  const interviewRows = await prisma.interview.findMany({
    where: companyId ? { companyId } : undefined,
    include: {
      candidate: { select: { id: true, firstName: true, lastName: true, phone: true } },
      interviewer: { select: { name: true } },
    },
    orderBy: { startsAt: "asc" },
  });

  const interviews = interviewRows.map(mapInterview);

  return <AgendaPageClient interviews={interviews} />;
}
