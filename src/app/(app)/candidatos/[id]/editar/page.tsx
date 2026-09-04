import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePermissionUser } from "@/lib/session";
import { canManageCandidates, canViewCompany } from "@/lib/permissions";
import { EditCandidateForm } from "@/components/candidatos/EditCandidateForm";

export default async function EditCandidatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requirePermissionUser();

  const candidate = await prisma.candidate.findUnique({ where: { id } });
  if (!candidate || !canViewCompany(user, candidate.companyId)) notFound();

  if (!canManageCandidates(user)) {
    return <p className="p-4 text-sm text-neutral-500">No tenés permisos para editar candidatos.</p>;
  }

  return (
    <EditCandidateForm
      candidate={{
        id: candidate.id,
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        phone: candidate.phone,
        email: candidate.email ?? undefined,
        companyId: candidate.companyId,
        position: candidate.position,
        source: candidate.source,
        zone: candidate.zone ?? undefined,
        address: candidate.address ?? undefined,
        availability: candidate.availability ?? undefined,
        salaryExpectation: candidate.salaryExpectation ?? undefined,
        experience: candidate.experience ?? undefined,
        birthDate: candidate.birthDate ? candidate.birthDate.toISOString() : undefined,
      }}
    />
  );
}
