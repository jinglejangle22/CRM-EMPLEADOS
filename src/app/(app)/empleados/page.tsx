import { prisma } from "@/lib/prisma";
import { requirePermissionUser } from "@/lib/session";
import { companyScopeFilter } from "@/lib/scope";
import { mapEmployee } from "@/lib/mappers";
import { EmpleadosPageClient } from "@/components/empleados/EmpleadosPageClient";

export default async function EmpleadosPage() {
  const user = await requirePermissionUser();
  const companyId = companyScopeFilter(user);

  const employeeRows = await prisma.employee.findMany({
    where: companyId ? { companyId } : undefined,
    include: { tags: { include: { tag: true } } },
    orderBy: { hireDate: "desc" },
  });

  const employees = employeeRows.map(mapEmployee);

  return <EmpleadosPageClient employees={employees} />;
}
