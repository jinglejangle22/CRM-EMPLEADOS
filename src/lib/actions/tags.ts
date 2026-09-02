"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermissionUser } from "@/lib/session";
import { canManageTags } from "@/lib/permissions";
import { createTagSchema, deleteTagSchema } from "@/lib/validations/tag";
import type { ActionState } from "@/lib/actions/candidates";

export async function createTagAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requirePermissionUser();
  if (!canManageTags(user)) {
    return { error: "No tenés permisos para administrar etiquetas." };
  }

  const parsed = createTagSchema.safeParse({
    companyId: formData.get("companyId"),
    name: formData.get("name"),
    category: formData.get("category"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  const data = parsed.data;

  const existing = await prisma.tag.findUnique({
    where: { companyId_name: { companyId: data.companyId, name: data.name } },
  });
  if (existing) return { error: "Ya existe una etiqueta con ese nombre en esta empresa." };

  await prisma.tag.create({ data });

  revalidatePath("/configuracion/etiquetas");
  return { success: true };
}

export async function deleteTagAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requirePermissionUser();
  if (!canManageTags(user)) {
    return { error: "No tenés permisos para administrar etiquetas." };
  }

  const parsed = deleteTagSchema.safeParse({ tagId: formData.get("tagId") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  await prisma.tag.delete({ where: { id: parsed.data.tagId } });

  revalidatePath("/configuracion/etiquetas");
  return { success: true };
}
