import { prisma } from "@/lib/prisma";
import { requirePermissionUser } from "@/lib/session";
import { canManageTags } from "@/lib/permissions";
import { EtiquetasPageClient } from "@/components/configuracion/EtiquetasPageClient";

export default async function EtiquetasPage() {
  const user = await requirePermissionUser();
  if (!canManageTags(user)) {
    return <p className="p-4 text-sm text-neutral-500">No tenés permisos para administrar etiquetas.</p>;
  }

  const [tagRows, companies] = await Promise.all([
    prisma.tag.findMany({ orderBy: [{ companyId: "asc" }, { name: "asc" }] }),
    prisma.company.findMany({ orderBy: { name: "asc" } }),
  ]);

  return <EtiquetasPageClient tags={tagRows} companies={companies} />;
}
