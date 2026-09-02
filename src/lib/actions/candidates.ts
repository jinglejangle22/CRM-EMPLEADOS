"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePermissionUser } from "@/lib/session";
import { canManageCandidates } from "@/lib/permissions";
import { logEvent } from "@/lib/history";
import { CANDIDATE_STAGE_LABELS } from "@/lib/labels";
import { createCandidateSchema, changeCandidateStageSchema } from "@/lib/validations/candidate";
import { isUploadedFile, saveUploadedFile } from "@/lib/storage";

export type ActionState = { error?: string; success?: boolean; employeeId?: string } | undefined;

export async function createCandidateAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requirePermissionUser();
  if (!canManageCandidates(user)) {
    return { error: "No tenés permisos para cargar candidatos." };
  }

  const parsed = createCandidateSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    companyId: formData.get("companyId"),
    position: formData.get("position"),
    source: formData.get("source"),
    zone: formData.get("zone"),
    address: formData.get("address"),
    availability: formData.get("availability"),
    salaryExpectation: formData.get("salaryExpectation"),
    experience: formData.get("experience"),
    birthDate: formData.get("birthDate"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const data = parsed.data;

  const photo = formData.get("photo");
  const cv = formData.get("cv");
  const [photoFile, cvFile] = await Promise.all([
    isUploadedFile(photo) ? saveUploadedFile(photo, { prefix: "candidatos/fotos", uploadedById: user.id }) : null,
    isUploadedFile(cv) ? saveUploadedFile(cv, { prefix: "candidatos/cv", uploadedById: user.id }) : null,
  ]);

  const candidate = await prisma.$transaction(async (tx) => {
    const created = await tx.candidate.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        email: data.email || undefined,
        companyId: data.companyId,
        position: data.position,
        source: data.source,
        zone: data.zone,
        address: data.address,
        availability: data.availability,
        salaryExpectation: data.salaryExpectation,
        experience: data.experience,
        birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
        cvReceivedDate: new Date(),
        createdById: user.id,
        photoFileId: photoFile?.id,
        cvFileId: cvFile?.id,
      },
    });

    await logEvent(tx, {
      candidateId: created.id,
      type: "CV_RECEIVED",
      title: "CV recibido",
      description: `${created.firstName} ${created.lastName} · ${created.position}`,
      createdById: user.id,
    });

    return created;
  });

  revalidatePath("/candidatos");
  revalidatePath("/dashboard");
  redirect(`/candidatos/${candidate.id}`);
}

export async function changeCandidateStageAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requirePermissionUser();
  if (!canManageCandidates(user)) {
    return { error: "No tenés permisos para cambiar la etapa." };
  }

  const parsed = changeCandidateStageSchema.safeParse({
    candidateId: formData.get("candidateId"),
    stage: formData.get("stage"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  const { candidateId, stage } = parsed.data;

  const candidate = await prisma.candidate.findUnique({ where: { id: candidateId } });
  if (!candidate) return { error: "El candidato no existe." };

  if (candidate.stage === stage) {
    return { success: true };
  }

  const result = await prisma.$transaction(async (tx) => {
    await tx.candidate.update({ where: { id: candidateId }, data: { stage } });

    let employeeId: string | undefined;

    if (stage === "CONTRATADO") {
      const existing = await tx.employee.findUnique({ where: { candidateId } });
      if (existing) {
        employeeId = existing.id;
      } else {
        const employee = await tx.employee.create({
          data: {
            candidateId: candidate.id,
            firstName: candidate.firstName,
            lastName: candidate.lastName,
            phone: candidate.phone,
            email: candidate.email,
            address: candidate.address,
            birthDate: candidate.birthDate,
            companyId: candidate.companyId,
            position: candidate.position,
            hireDate: new Date(),
            status: "EN_PRUEBA",
          },
        });
        employeeId = employee.id;

        await logEvent(tx, {
          candidateId: candidate.id,
          employeeId: employee.id,
          type: "HIRED",
          title: "Contratado/a",
          description: `Alta como legajo · ${candidate.position}`,
          createdById: user.id,
        });
      }
    } else {
      await logEvent(tx, {
        candidateId: candidate.id,
        type: "STAGE_CHANGE",
        title: `Etapa: ${CANDIDATE_STAGE_LABELS[candidate.stage]} → ${CANDIDATE_STAGE_LABELS[stage]}`,
        createdById: user.id,
      });
    }

    return { employeeId };
  });

  revalidatePath(`/candidatos/${candidateId}`);
  revalidatePath("/candidatos");
  revalidatePath("/dashboard");
  if (result.employeeId) revalidatePath(`/empleados/${result.employeeId}`);

  return { success: true, employeeId: result.employeeId };
}
