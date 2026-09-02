import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canViewCompany, canViewSensitiveDocuments } from "@/lib/permissions";
import { getSignedDownloadUrl } from "@/lib/storage";

/**
 * Único punto de acceso a archivos privados. Nunca se expone una URL pública
 * de S3/R2: esta ruta valida permisos contra la entidad dueña del archivo y
 * devuelve una redirección a una URL firmada de corta duración.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

  const user = { id: session.user.id, role: session.user.role, companyIds: session.user.companyIds };
  const { id } = await params;

  const file = await prisma.fileAsset.findUnique({ where: { id } });
  if (!file) return NextResponse.json({ error: "Archivo no encontrado." }, { status: 404 });

  if (file.isSensitive && !canViewSensitiveDocuments(user)) {
    return NextResponse.json({ error: "No tenés permisos para ver este archivo." }, { status: 403 });
  }

  const [candidateOwner, employeeOwner, incidentOwner] = await Promise.all([
    prisma.candidate.findFirst({
      where: { OR: [{ photoFileId: id }, { cvFileId: id }] },
      select: { companyId: true },
    }),
    prisma.employee.findFirst({ where: { photoFileId: id }, select: { companyId: true } }),
    prisma.employeeIncident.findFirst({ where: { evidenceFileId: id }, select: { companyId: true } }),
  ]);

  const ownerCompanyId = candidateOwner?.companyId ?? employeeOwner?.companyId ?? incidentOwner?.companyId;

  if (!ownerCompanyId || !canViewCompany(user, ownerCompanyId)) {
    return NextResponse.json({ error: "No tenés permisos para ver este archivo." }, { status: 403 });
  }

  const url = await getSignedDownloadUrl(file.key, file.bucket);
  return NextResponse.redirect(url);
}
