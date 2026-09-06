import Link from "next/link";
import { ChevronRight, Tag, Users } from "lucide-react";
import { requirePermissionUser } from "@/lib/session";
import { canManageTags, canManageUsers, ROLE_LABELS } from "@/lib/permissions";

export default async function ConfiguracionPage() {
  const user = await requirePermissionUser();

  const items = [
    { label: "Usuarios", description: "Roles y acceso por empresa", icon: Users, href: "/configuracion/usuarios", visible: canManageUsers(user) },
    { label: "Etiquetas", description: "Etiquetas por empresa", icon: Tag, href: "/configuracion/etiquetas", visible: canManageTags(user) },
  ].filter((item) => item.visible);

  return (
    <div className="mx-auto flex w-full max-w-[640px] flex-col gap-4 px-4 pb-8 pt-4">
      <h1 className="text-2xl font-bold text-neutral-900">Configuración</h1>
      <p className="text-sm text-neutral-500">Rol actual: {ROLE_LABELS[user.role]}</p>

      {items.length === 0 ? (
        <p className="py-10 text-center text-sm text-neutral-400">No tenés secciones de configuración disponibles.</p>
      ) : (
        <section className="flex flex-col divide-y divide-neutral-100 rounded-2xl bg-white p-2 ring-1 ring-neutral-100">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex min-h-16 items-center gap-3 rounded-xl p-2.5 text-left active:bg-neutral-50"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600">
                <item.icon className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-medium text-neutral-900">{item.label}</span>
                <span className="block text-sm text-neutral-500">{item.description}</span>
              </span>
              <ChevronRight className="size-4 text-neutral-300" />
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}
