import { redirect } from "next/navigation";
import { auth } from "@/auth";
import type { PermissionUser } from "@/lib/permissions";

/**
 * Sesión + datos de permisos para usar en Server Components. La redirección
 * a /login es defensa en profundidad (ya cubierta por middleware.ts y
 * (app)/layout.tsx), nunca debería dispararse en una ruta protegida.
 */
export async function requirePermissionUser(): Promise<PermissionUser> {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return { id: session.user.id, role: session.user.role, companyIds: session.user.companyIds };
}
