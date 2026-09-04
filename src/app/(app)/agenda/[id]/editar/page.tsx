import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePermissionUser } from "@/lib/session";
import { canManageCandidates, canViewCompany } from "@/lib/permissions";
import { EditInterviewForm } from "@/components/agenda/EditInterviewForm";

export default async function EditInterviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requirePermissionUser();

  const interview = await prisma.interview.findUnique({
    where: { id },
    include: { candidate: { select: { firstName: true, lastName: true, companyId: true } } },
  });
  if (!interview || !canViewCompany(user, interview.companyId)) notFound();

  if (!canManageCandidates(user)) {
    return <p className="p-4 text-sm text-neutral-500">No tenés permisos para editar entrevistas.</p>;
  }

  return (
    <EditInterviewForm
      interview={{
        id: interview.id,
        candidateName: `${interview.candidate.firstName} ${interview.candidate.lastName}`,
        position: interview.position,
        startsAt: interview.startsAt.toISOString(),
        modality: interview.modality,
        address: interview.address ?? undefined,
        notes: interview.notes ?? undefined,
      }}
    />
  );
}
