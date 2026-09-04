"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePermissionUser } from "@/lib/session";
import { canManageCandidates } from "@/lib/permissions";
import { logEvent } from "@/lib/history";
import { parseLocalDateTime } from "@/lib/dates";
import { INTERVIEW_MODALITY_LABELS, INTERVIEW_STATUS_LABELS } from "@/lib/labels";
import { createInterviewSchema, updateInterviewStatusSchema, updateInterviewSchema } from "@/lib/validations/interview";
import type { ActionState } from "@/lib/actions/candidates";

const STAGE_ORDER = [
  "CV_RECIBIDO",
  "CV_REVISADO",
  "CONTACTADO",
  "ENTREVISTA_AGENDADA",
  "ENTREVISTADO",
  "PRUEBA_LABORAL",
  "CONTRATADO",
] as const;

function stageIndex(stage: string) {
  return STAGE_ORDER.indexOf(stage as (typeof STAGE_ORDER)[number]);
}

export async function createInterviewAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requirePermissionUser();
  if (!canManageCandidates(user)) {
    return { error: "No tenés permisos para agendar entrevistas." };
  }

  const parsed = createInterviewSchema.safeParse({
    candidateId: formData.get("candidateId"),
    companyId: formData.get("companyId"),
    position: formData.get("position"),
    startsAt: formData.get("startsAt"),
    modality: formData.get("modality"),
    address: formData.get("address"),
    notes: formData.get("notes"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  const data = parsed.data;

  const candidate = await prisma.candidate.findUnique({ where: { id: data.candidateId } });
  if (!candidate) return { error: "El candidato no existe." };

  await prisma.$transaction(async (tx) => {
    await tx.interview.create({
      data: {
        candidateId: data.candidateId,
        companyId: data.companyId,
        position: data.position,
        startsAt: parseLocalDateTime(data.startsAt),
        modality: data.modality,
        address: data.address,
        notes: data.notes,
        interviewerId: user.id,
      },
    });

    await logEvent(tx, {
      candidateId: data.candidateId,
      type: "INTERVIEW_SCHEDULED",
      title: `Entrevista agendada (${INTERVIEW_MODALITY_LABELS[data.modality]})`,
      description: data.position,
      createdById: user.id,
    });

    if (stageIndex(candidate.stage) < stageIndex("ENTREVISTA_AGENDADA")) {
      await tx.candidate.update({ where: { id: candidate.id }, data: { stage: "ENTREVISTA_AGENDADA" } });
    }
  });

  revalidatePath("/agenda");
  revalidatePath(`/candidatos/${data.candidateId}`);
  revalidatePath("/dashboard");
  redirect(`/candidatos/${data.candidateId}`);
}

export async function updateInterviewStatusAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requirePermissionUser();
  if (!canManageCandidates(user)) {
    return { error: "No tenés permisos para actualizar la entrevista." };
  }

  const parsed = updateInterviewStatusSchema.safeParse({
    interviewId: formData.get("interviewId"),
    status: formData.get("status"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  const { interviewId, status } = parsed.data;

  const interview = await prisma.interview.findUnique({ where: { id: interviewId } });
  if (!interview) return { error: "La entrevista no existe." };

  await prisma.$transaction(async (tx) => {
    await tx.interview.update({ where: { id: interviewId }, data: { status } });

    await logEvent(tx, {
      candidateId: interview.candidateId,
      type: "INTERVIEW_UPDATED",
      title: `Entrevista: ${INTERVIEW_STATUS_LABELS[status]}`,
      createdById: user.id,
    });

    if (status === "SE_PRESENTO") {
      const candidate = await tx.candidate.findUnique({ where: { id: interview.candidateId } });
      if (candidate && stageIndex(candidate.stage) < stageIndex("ENTREVISTADO")) {
        await tx.candidate.update({ where: { id: candidate.id }, data: { stage: "ENTREVISTADO" } });
      }
    }
  });

  revalidatePath("/agenda");
  revalidatePath(`/candidatos/${interview.candidateId}`);
  revalidatePath("/dashboard");

  return { success: true };
}

export async function updateInterviewAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requirePermissionUser();
  if (!canManageCandidates(user)) {
    return { error: "No tenés permisos para editar entrevistas." };
  }

  const parsed = updateInterviewSchema.safeParse({
    interviewId: formData.get("interviewId"),
    position: formData.get("position"),
    startsAt: formData.get("startsAt"),
    modality: formData.get("modality"),
    address: formData.get("address"),
    notes: formData.get("notes"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  const data = parsed.data;

  const interview = await prisma.interview.findUnique({ where: { id: data.interviewId } });
  if (!interview) return { error: "La entrevista no existe." };

  await prisma.$transaction(async (tx) => {
    await tx.interview.update({
      where: { id: data.interviewId },
      data: {
        position: data.position,
        startsAt: parseLocalDateTime(data.startsAt),
        modality: data.modality,
        address: data.address,
        notes: data.notes,
      },
    });

    await logEvent(tx, {
      candidateId: interview.candidateId,
      type: "INTERVIEW_UPDATED",
      title: "Entrevista modificada",
      description: `${data.position} · ${INTERVIEW_MODALITY_LABELS[data.modality]}`,
      createdById: user.id,
    });
  });

  revalidatePath("/agenda");
  revalidatePath(`/candidatos/${interview.candidateId}`);
  revalidatePath("/dashboard");
  redirect(`/candidatos/${interview.candidateId}`);
}
