"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import type { Company, UserRole } from "@prisma/client";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormSelect } from "@/components/shared/FormSelect";
import { createUserAction, updateUserAction } from "@/lib/actions/users";
import type { ActionState } from "@/lib/actions/candidates";
import { ROLE_LABELS } from "@/lib/permissions";

type UserRow = { id: string; name: string; email: string; role: UserRole; companyIds: string[] };

const initialState: ActionState = undefined;

export function UsuariosPageClient({ users, companies }: { users: UserRow[]; companies: Company[] }) {
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<UserRow | null>(null);

  return (
    <div className="flex flex-col gap-4 px-4 pb-8 pt-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-neutral-900">Usuarios</h1>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-1.5 rounded-full bg-violet-600 px-3 py-1.5 text-xs font-medium text-white active:bg-violet-700"
        >
          <Plus className="size-3.5" />
          Nuevo
        </button>
      </div>

      <div className="flex flex-col gap-2.5">
        {users.map((u) => (
          <button
            key={u.id}
            onClick={() => setEditing(u)}
            className="flex flex-col gap-1.5 rounded-2xl bg-white p-3.5 text-left ring-1 ring-neutral-100 active:bg-neutral-50"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-sm font-semibold text-neutral-900">{u.name}</p>
              <span className="shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
                {ROLE_LABELS[u.role]}
              </span>
            </div>
            <p className="truncate text-xs text-neutral-500">{u.email}</p>
            {u.companyIds.length > 0 && (
              <p className="truncate text-xs text-neutral-400">
                {u.companyIds
                  .map((id) => companies.find((c) => c.id === id)?.shortName)
                  .filter(Boolean)
                  .join(", ")}
              </p>
            )}
          </button>
        ))}
      </div>

      <CreateUserDialog open={creating} onOpenChange={setCreating} companies={companies} />
      {editing && (
        <EditUserDialog
          open={!!editing}
          onOpenChange={(open) => !open && setEditing(null)}
          user={editing}
          companies={companies}
        />
      )}
    </div>
  );
}

function CreateUserDialog({
  open,
  onOpenChange,
  companies,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companies: Company[];
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(createUserAction, initialState);

  useEffect(() => {
    if (state?.success) {
      onOpenChange(false);
      router.refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl px-4 pb-6">
        <SheetHeader className="px-0 pt-2">
          <SheetTitle>Nuevo usuario</SheetTitle>
        </SheetHeader>
        <form action={formAction} className="flex flex-col gap-4 pb-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" name="name" required className="h-12 rounded-xl text-base" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required className="h-12 rounded-xl text-base" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" name="password" type="password" required minLength={6} className="h-12 rounded-xl text-base" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="role">Rol</Label>
            <FormSelect id="role" name="role" required defaultValue="LECTURA">
              {Object.entries(ROLE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </FormSelect>
          </div>
          <CompanyCheckboxes companies={companies} defaultChecked={[]} />

          {state?.error && <p className="text-sm text-rose-600">{state.error}</p>}

          <Button type="submit" disabled={pending} className="h-12 rounded-xl text-base">
            {pending ? "Guardando..." : "Crear usuario"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function EditUserDialog({
  open,
  onOpenChange,
  user,
  companies,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserRow;
  companies: Company[];
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(updateUserAction, initialState);

  useEffect(() => {
    if (state?.success) {
      onOpenChange(false);
      router.refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl px-4 pb-6">
        <SheetHeader className="px-0 pt-2">
          <SheetTitle>{user.name}</SheetTitle>
        </SheetHeader>
        <form action={formAction} className="flex flex-col gap-4 pb-2">
          <input type="hidden" name="userId" value={user.id} />
          <p className="text-xs text-neutral-500">{user.email}</p>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="role">Rol</Label>
            <FormSelect id="role" name="role" required defaultValue={user.role}>
              {Object.entries(ROLE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </FormSelect>
          </div>
          <CompanyCheckboxes companies={companies} defaultChecked={user.companyIds} />

          {state?.error && <p className="text-sm text-rose-600">{state.error}</p>}

          <Button type="submit" disabled={pending} className="h-12 rounded-xl text-base">
            {pending ? "Guardando..." : "Guardar cambios"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function CompanyCheckboxes({ companies, defaultChecked }: { companies: Company[]; defaultChecked: string[] }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>Empresas (para Encargado/Lectura)</Label>
      <div className="flex flex-col gap-2 rounded-xl border border-input px-3 py-2.5">
        {companies.map((c) => (
          <label key={c.id} className="flex items-center gap-2 text-sm text-neutral-700">
            <input
              type="checkbox"
              name="companyIds"
              value={c.id}
              defaultChecked={defaultChecked.includes(c.id)}
              className="size-4 rounded border-input"
            />
            {c.shortName}
          </label>
        ))}
      </div>
    </div>
  );
}
