"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import type { Company, Tag } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormSelect } from "@/components/shared/FormSelect";
import { createTagAction, deleteTagAction } from "@/lib/actions/tags";
import type { ActionState } from "@/lib/actions/candidates";

const initialState: ActionState = undefined;

export function EtiquetasPageClient({ tags, companies }: { tags: Tag[]; companies: Company[] }) {
  return (
    <div className="mx-auto flex w-full max-w-[640px] flex-col gap-4 px-4 pb-8 pt-4">
      <h1 className="text-2xl font-bold text-neutral-900">Etiquetas</h1>

      <CreateTagForm companies={companies} />

      <div className="flex flex-col gap-4">
        {companies.map((company) => {
          const companyTags = tags.filter((t) => t.companyId === company.id);
          if (companyTags.length === 0) return null;
          return (
            <section key={company.id} className="rounded-2xl bg-white p-3.5 ring-1 ring-neutral-100">
              <h2 className="px-1 pb-2 text-sm font-semibold text-neutral-900">{company.shortName}</h2>
              <div className="flex flex-wrap gap-2 px-1">
                {companyTags.map((tag) => (
                  <TagChip key={tag.id} tag={tag} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function CreateTagForm({ companies }: { companies: Company[] }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(createTagAction, initialState);

  useEffect(() => {
    if (state?.success) router.refresh();
  }, [state, router]);

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-neutral-100">
      <h2 className="px-1 text-sm font-semibold text-neutral-900">Nueva etiqueta</h2>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="companyId">Empresa</Label>
        <FormSelect id="companyId" name="companyId" required defaultValue="">
          <option value="" disabled>
            Elegí una empresa
          </option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.shortName}
            </option>
          ))}
        </FormSelect>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Nombre</Label>
          <Input id="name" name="name" required className="h-12 rounded-xl text-base" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="category">Categoría</Label>
          <Input id="category" name="category" className="h-12 rounded-xl text-base" />
        </div>
      </div>
      {state?.error && <p className="text-sm text-rose-600">{state.error}</p>}
      <Button type="submit" disabled={pending} className="h-12 rounded-xl text-base">
        {pending ? "Guardando..." : "Agregar etiqueta"}
      </Button>
    </form>
  );
}

function TagChip({ tag }: { tag: Tag }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(deleteTagAction, initialState);

  useEffect(() => {
    if (state?.success) router.refresh();
  }, [state, router]);

  return (
    <form action={formAction} className="flex items-center gap-1.5 rounded-full bg-neutral-100 py-1.5 pr-1.5 pl-3 text-sm font-medium text-neutral-600">
      <input type="hidden" name="tagId" value={tag.id} />
      {tag.name}
      <button
        type="submit"
        disabled={pending}
        aria-label={`Eliminar ${tag.name}`}
        className="flex size-6 items-center justify-center rounded-full text-neutral-400 active:bg-neutral-200 active:text-rose-600"
      >
        <Trash2 className="size-3.5" />
      </button>
    </form>
  );
}
