import { prisma } from "@/lib/prisma";
import { canViewCompany, canViewSensitiveDocuments, type PermissionUser } from "@/lib/permissions";

export type FileAccessResult =
  | {
      ok: true;
      file: { id: string; key: string; bucket: string; mimeType: string; originalName: string };
    }
  | { ok: false; status: 401 | 403 | 404; error: string };

/**
 * Único punto de validación de permisos para archivos privados. Se usa desde
 * las distintas rutas de `/api/files/[id]/*` para no duplicar la lógica de
 * quién puede ver qué archivo.
 */
export async function resolveFileAccess(fileId: string, user: PermissionUser | null): Promise<FileAccessResult> {
  if (!user) return { ok: false, status: 401, error: "No autenticado." };

  const file = await prisma.fileAsset.findUnique({ where: { id: fileId } });
  if (!file) return { ok: false, status: 404, error: "Archivo no encontrado." };

  if (file.isSensitive && !canViewSensitiveDocuments(user)) {
    return { ok: false, status: 403, error: "No tenés permisos para ver este archivo." };
  }

  const [candidateOwner, employeeOwner, incidentOwner] = await Promise.all([
    prisma.candidate.findFirst({
      where: { OR: [{ photoFileId: fileId }, { cvFileId: fileId }] },
      select: { companyId: true },
    }),
    prisma.employee.findFirst({ where: { photoFileId: fileId }, select: { companyId: true } }),
    prisma.employeeIncident.findFirst({ where: { evidenceFileId: fileId }, select: { companyId: true } }),
  ]);

  const ownerCompanyId = candidateOwner?.companyId ?? employeeOwner?.companyId ?? incidentOwner?.companyId;

  if (!ownerCompanyId || !canViewCompany(user, ownerCompanyId)) {
    return { ok: false, status: 403, error: "No tenés permisos para ver este archivo." };
  }

  return { ok: true, file };
}
