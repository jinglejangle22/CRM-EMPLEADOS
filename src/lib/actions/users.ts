"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermissionUser } from "@/lib/session";
import { canManageUsers } from "@/lib/permissions";
import { hashPassword } from "@/lib/password";
import { createUserSchema, updateUserSchema } from "@/lib/validations/user";
import type { ActionState } from "@/lib/actions/candidates";

export async function createUserAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requirePermissionUser();
  if (!canManageUsers(user)) {
    return { error: "No tenés permisos para administrar usuarios." };
  }

  const parsed = createUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
    companyIds: formData.getAll("companyIds"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  const data = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) return { error: "Ya existe un usuario con ese email." };

  await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash: hashPassword(data.password),
      role: data.role,
      companies: { create: data.companyIds.map((companyId) => ({ companyId })) },
    },
  });

  revalidatePath("/configuracion/usuarios");
  return { success: true };
}

export async function updateUserAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requirePermissionUser();
  if (!canManageUsers(user)) {
    return { error: "No tenés permisos para administrar usuarios." };
  }

  const parsed = updateUserSchema.safeParse({
    userId: formData.get("userId"),
    role: formData.get("role"),
    companyIds: formData.getAll("companyIds"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  const data = parsed.data;

  await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id: data.userId }, data: { role: data.role } });
    await tx.userCompany.deleteMany({ where: { userId: data.userId } });
    if (data.companyIds.length > 0) {
      await tx.userCompany.createMany({
        data: data.companyIds.map((companyId) => ({ userId: data.userId, companyId })),
      });
    }
  });

  revalidatePath("/configuracion/usuarios");
  return { success: true };
}
