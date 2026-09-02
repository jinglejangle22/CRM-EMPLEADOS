import type { PermissionUser } from "@/lib/permissions";

/**
 * Filtro de empresa para queries de Prisma según el rol del usuario.
 * ADMIN y RRHH ven todas las empresas (sin filtro); ENCARGADO y LECTURA
 * quedan acotados a `user.companyIds`.
 */
export function companyScopeFilter(user: PermissionUser): { in: string[] } | undefined {
  if (user.role === "ADMIN" || user.role === "RRHH") return undefined;
  return { in: user.companyIds };
}
