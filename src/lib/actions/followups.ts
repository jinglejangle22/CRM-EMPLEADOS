"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermissionUser } from "@/lib/session";
import { canRegisterInteraction } from "@/lib/permissions";
import { logEvent } from "@/lib/history";
import { parseLocalDateTime } from "@/lib/dates";
import { INTERACTION_RESULT_LABELS, INTERACTION_TYPE_LABELS } from "@/lib/labels";
import { createFollowupSchema, completeFollowupSchema } from "@/lib/validations/followup";
import type { ActionState } from "@/lib/actions/candidates";

export async function createFollowupAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requirePermissionUser();

  const parsed = createFollowupSchema.safeParse({
    candidateId: formData.get("candidateId"),
    employeeId: formData.get("employeeId"),
    dueAt: formData.get("dueAt"),
    note: formData.get("note"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  const data = parsed.data;

  let companyId: string | undefined;
  if (data.candidateId) {
    const candidate = await prisma.candidate.findUnique({ where: { id: data.candidateId }, select: { companyId: true } });
    if (!candidate) return { error: "El candidato no existe." };
    companyId = candidate.companyId;
  } else if (data.employeeId) {
    const employee = await prisma.employee.findUnique({ where: { id: data.employeeId }, select: { companyId: true } });
    if (!employee) return { error: "El empleado no existe." };
    companyId = employee.companyId;
  }

  if (!canRegisterInteraction(user, companyId)) {
    return { error: "No tenés permisos para agendar seguimientos en esta empresa." };
  }

  await prisma.$transaction(async (tx) => {
    const followup = await tx.followup.create({
      data: {
        candidateId: data.candidateId,
        employeeId: data.employeeId,
        dueAt: parseLocalDateTime(data.dueAt),
        note: data.note,
        createdById: user.id,
      },
    });

    await logEvent(tx, {
      candidateId: data.candidateId,
      employeeId: data.employeeId,
      type: "FOLLOWUP_CREATED",
      title: "Seguimiento agendado",
      description: followup.note,
      sourceType: "Followup",
      sourceId: followup.id,
      createdById: user.id,
    });
  });

  if (data.candidateId) {
    revalidatePath(`/candidatos/${data.candidateId}`);
    revalidatePath("/candidatos");
  }
  if (data.employeeId) {
    revalidatePath(`/empleados/${data.employeeId}`);
    revalidatePath("/empleados");
  }
  revalidatePath("/agenda");
  revalidatePath("/dashboard");

  return { success: true };
}

export async function completeFollowupAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requirePermissionUser();

  const parsed = completeFollowupSchema.safeParse({
    followupId: formData.get("followupId"),
    registerInteraction: formData.get("registerInteraction"),
    type: formData.get("type") || undefined,
    result: formData.get("result") || undefined,
    note: formData.get("note"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  const data = parsed.data;

  const followup = await prisma.followup.findUnique({ where: { id: data.followupId } });
  if (!followup) return { error: "El seguimiento no existe." };

  let companyId: string | undefined;
  if (followup.candidateId) {
    const candidate = await prisma.candidate.findUnique({ where: { id: followup.candidateId }, select: { companyId: true } });
    companyId = candidate?.companyId;
  } else if (followup.employeeId) {
    const employee = await prisma.employee.findUnique({ where: { id: followup.employeeId }, select: { companyId: true } });
    companyId = employee?.companyId;
  }

  if (!canRegisterInteraction(user, companyId)) {
    return { error: "No tenés permisos para completar este seguimiento." };
  }

  await prisma.$transaction(async (tx) => {
    let resultInteractionId: string | undefined;

    if (data.registerInteraction === "true" && data.type && data.result) {
      const interaction = await tx.interaction.create({
        data: {
          candidateId: followup.candidateId,
          employeeId: followup.employeeId,
          type: data.type,
          result: data.result,
          note: data.note,
          occurredAt: new Date(),
          userId: user.id,
        },
      });
      resultInteractionId = interaction.id;

      await logEvent(tx, {
        candidateId: followup.candidateId ?? undefined,
        employeeId: followup.employeeId ?? undefined,
        type: "INTERACTION",
        title: `${INTERACTION_TYPE_LABELS[data.type]} · ${INTERACTION_RESULT_LABELS[data.result]}`,
        description: data.note,
        sourceType: "Interaction",
        sourceId: interaction.id,
        createdById: user.id,
      });
    }

    await tx.followup.update({
      where: { id: followup.id },
      data: { status: "COMPLETADO", completedAt: new Date(), resultInteractionId },
    });

    await logEvent(tx, {
      candidateId: followup.candidateId ?? undefined,
      employeeId: followup.employeeId ?? undefined,
      type: "FOLLOWUP_COMPLETED",
      title: "Seguimiento completado",
      description: followup.note,
      sourceType: "Followup",
      sourceId: followup.id,
      createdById: user.id,
    });
  });

  if (followup.candidateId) {
    revalidatePath(`/candidatos/${followup.candidateId}`);
    revalidatePath("/candidatos");
  }
  if (followup.employeeId) {
    revalidatePath(`/empleados/${followup.employeeId}`);
    revalidatePath("/empleados");
  }
  revalidatePath("/dashboard");
  revalidatePath("/alertas");

  return { success: true };
}

export async function cancelFollowupAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requirePermissionUser();
  const followupId = String(formData.get("followupId") ?? "");
  if (!followupId) return { error: "Falta el seguimiento." };

  const followup = await prisma.followup.findUnique({ where: { id: followupId } });
  if (!followup) return { error: "El seguimiento no existe." };

  let companyId: string | undefined;
  if (followup.candidateId) {
    const candidate = await prisma.candidate.findUnique({ where: { id: followup.candidateId }, select: { companyId: true } });
    companyId = candidate?.companyId;
  } else if (followup.employeeId) {
    const employee = await prisma.employee.findUnique({ where: { id: followup.employeeId }, select: { companyId: true } });
    companyId = employee?.companyId;
  }

  if (!canRegisterInteraction(user, companyId)) {
    return { error: "No tenés permisos para cancelar este seguimiento." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.followup.update({ where: { id: followup.id }, data: { status: "CANCELADO" } });
    await logEvent(tx, {
      candidateId: followup.candidateId ?? undefined,
      employeeId: followup.employeeId ?? undefined,
      type: "FOLLOWUP_CANCELLED",
      title: "Seguimiento cancelado",
      description: followup.note,
      createdById: user.id,
    });
  });

  if (followup.candidateId) revalidatePath(`/candidatos/${followup.candidateId}`);
  if (followup.employeeId) revalidatePath(`/empleados/${followup.employeeId}`);
  revalidatePath("/dashboard");
  revalidatePath("/alertas");

  return { success: true };
}
