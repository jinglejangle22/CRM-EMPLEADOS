import { prisma } from "@/lib/prisma";
import { requirePermissionUser } from "@/lib/session";
import { canManageUsers } from "@/lib/permissions";
import { UsuariosPageClient } from "@/components/configuracion/UsuariosPageClient";

export default async function UsuariosPage() {
  const user = await requirePermissionUser();
  if (!canManageUsers(user)) {
    return <p className="p-4 text-sm text-neutral-500">No tenés permisos para administrar usuarios.</p>;
  }

  const [userRows, companies] = await Promise.all([
    prisma.user.findMany({
      include: { companies: { select: { companyId: true } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.company.findMany({ orderBy: { name: "asc" } }),
  ]);

  const users = userRows.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    companyIds: u.companies.map((c) => c.companyId),
  }));

  return <UsuariosPageClient users={users} companies={companies} />;
}
