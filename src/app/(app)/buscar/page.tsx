import { prisma } from "@/lib/prisma";
import { requirePermissionUser } from "@/lib/session";
import { companyScopeFilter } from "@/lib/scope";
import { mapCandidate, mapEmployee } from "@/lib/mappers";
import { BuscarPageClient } from "@/components/buscar/BuscarPageClient";

export default async function BuscarPage() {
  const user = await requirePermissionUser();
  const companyId = companyScopeFilter(user);

  const [candidateRows, employeeRows] = await Promise.all([
    prisma.candidate.findMany({
      where: { isArchived: false, ...(companyId ? { companyId } : {}) },
      include: { tags: { include: { tag: true } } },
    }),
    prisma.employee.findMany({
      where: companyId ? { companyId } : undefined,
      include: { tags: { include: { tag: true } } },
    }),
  ]);

  const candidates = candidateRows.map((row) => mapCandidate(row));
  const employees = employeeRows.map(mapEmployee);

  return <BuscarPageClient candidates={candidates} employees={employees} />;
}
