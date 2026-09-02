import type { UserRole } from "@prisma/client";

/**
 * Representación mínima del usuario autenticado necesaria para evaluar permisos.
 * Se arma a partir de la sesión real de Auth.js (ver `lib/session.ts`).
 */
export type PermissionUser = {
  id: string;
  role: UserRole;
  /** Empresas a las que tiene acceso (relevante para ENCARGADO/LECTURA). ADMIN y RRHH ven todas. */
  companyIds: string[];
};

function hasCompanyScope(user: PermissionUser, companyId?: string): boolean {
  if (user.role === "ADMIN" || user.role === "RRHH") return true;
  if (!companyId) return false;
  return user.companyIds.includes(companyId);
}

/** Sueldo y condiciones contractuales: solo ADMIN y RRHH. */
export function canViewSalary(user: PermissionUser): boolean {
  return user.role === "ADMIN" || user.role === "RRHH";
}

/** Documentos sensibles (DNI, certificados, etc. — Fase 2): solo ADMIN y RRHH. */
export function canViewSensitiveDocuments(user: PermissionUser): boolean {
  return user.role === "ADMIN" || user.role === "RRHH";
}

export function canRegisterIncident(user: PermissionUser, companyId?: string): boolean {
  if (user.role === "LECTURA") return false;
  return hasCompanyScope(user, companyId);
}

export function canRegisterRecognition(user: PermissionUser, companyId?: string): boolean {
  return canRegisterIncident(user, companyId);
}

export function canRegisterInteraction(user: PermissionUser, companyId?: string): boolean {
  if (user.role === "LECTURA") return false;
  return hasCompanyScope(user, companyId);
}

export function canManageCandidates(user: PermissionUser): boolean {
  return user.role === "ADMIN" || user.role === "RRHH";
}

export function canManageEmployees(user: PermissionUser, companyId?: string): boolean {
  if (user.role === "ADMIN" || user.role === "RRHH") return true;
  if (user.role === "ENCARGADO") return hasCompanyScope(user, companyId);
  return false;
}

export function canChangeEmployeeStatus(user: PermissionUser, companyId?: string): boolean {
  return canManageEmployees(user, companyId);
}

export function canManageUsers(user: PermissionUser): boolean {
  return user.role === "ADMIN";
}

export function canManageTags(user: PermissionUser): boolean {
  return user.role === "ADMIN";
}

export function canViewCompany(user: PermissionUser, companyId?: string): boolean {
  return hasCompanyScope(user, companyId);
}

export function isReadOnly(user: PermissionUser): boolean {
  return user.role === "LECTURA";
}

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Administrador",
  ENCARGADO: "Encargado",
  RRHH: "RRHH",
  LECTURA: "Lectura",
};
