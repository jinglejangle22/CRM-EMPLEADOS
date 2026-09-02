import { prisma } from "@/lib/prisma";
import { requirePermissionUser } from "@/lib/session";
import { companyScopeFilter } from "@/lib/scope";
import { canManageCandidates } from "@/lib/permissions";
import { NewInterviewForm } from "@/components/agenda/NewInterviewForm";

export default async function NewInterviewPage() {
  const user = await requirePermissionUser();

  if (!canManageCandidates(user)) {
    return <p className="p-4 text-sm text-neutral-500">No tenés permisos para agendar entrevistas.</p>;
  }

  const companyId = companyScopeFilter(user);
  const candidates = await prisma.candidate.findMany({
    where: {
      ...(companyId ? { companyId } : {}),
      isArchived: false,
      stage: { notIn: ["CONTRATADO", "NO_SELECCIONADO"] },
    },
    select: { id: true, firstName: true, lastName: true, position: true, companyId: true },
    orderBy: { firstName: "asc" },
  });

  return <NewInterviewForm candidates={candidates} />;
}
