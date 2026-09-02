"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermissionUser } from "@/lib/session";
import { canRegisterInteraction } from "@/lib/permissions";
import { logEvent } from "@/lib/history";
import { INTERACTION_RESULT_LABELS, INTERACTION_TYPE_LABELS } from "@/lib/labels";
import { createInteractionSchema } from "@/lib/validations/interaction";
import type { ActionState } from "@/lib/actions/candidates";

export async function createInteractionAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requirePermissionUser();

  const parsed = createInteractionSchema.safeParse({
    candidateId: formData.get("candidateId"),
    employeeId: formData.get("employeeId"),
    type: formData.get("type"),
    result: formData.get("result"),
    note: formData.get("note"),
    nextFollowUpAt: formData.get("nextFollowUpAt"),
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
    return { error: "No tenés permisos para registrar contactos en esta empresa." };
  }

  await prisma.$transaction(async (tx) => {
    const interaction = await tx.interaction.create({
      data: {
        candidateId: data.candidateId,
        employeeId: data.employeeId,
        type: data.type,
        result: data.result,
        note: data.note,
        occurredAt: new Date(),
        userId: user.id,
        nextFollowUpAt: data.nextFollowUpAt ? new Date(data.nextFollowUpAt) : undefined,
      },
    });

    await logEvent(tx, {
      candidateId: data.candidateId,
      employeeId: data.employeeId,
      type: "INTERACTION",
      title: `${INTERACTION_TYPE_LABELS[data.type]} · ${INTERACTION_RESULT_LABELS[data.result]}`,
      description: data.note,
      sourceType: "Interaction",
      sourceId: interaction.id,
      createdById: user.id,
    });

    if (data.nextFollowUpAt) {
      const followup = await tx.followup.create({
        data: {
          candidateId: data.candidateId,
          employeeId: data.employeeId,
          dueAt: new Date(data.nextFollowUpAt),
          note: data.note ?? "Volver a contactar",
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
    }
  });

  if (data.candidateId) {
    revalidatePath(`/candidatos/${data.candidateId}`);
    revalidatePath("/candidatos");
  }
  if (data.employeeId) {
    revalidatePath(`/empleados/${data.employeeId}`);
    revalidatePath("/empleados");
  }
  revalidatePath("/dashboard");

  return { success: true };
}
