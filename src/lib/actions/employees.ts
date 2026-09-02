"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePermissionUser } from "@/lib/session";
import { canManageEmployees, canChangeEmployeeStatus, canRegisterIncident, canRegisterRecognition, canViewSalary } from "@/lib/permissions";
import { logEvent } from "@/lib/history";
import { EMPLOYEE_STATUS_LABELS, INCIDENT_LEVEL_LABELS, INCIDENT_TYPE_LABELS, RECOGNITION_TYPE_LABELS } from "@/lib/labels";
import { createEmployeeSchema, changeEmployeeStatusSchema } from "@/lib/validations/employee";
import { createIncidentSchema } from "@/lib/validations/incident";
import { createRecognitionSchema } from "@/lib/validations/recognition";
import type { ActionState } from "@/lib/actions/candidates";
import { isUploadedFile, saveUploadedFile } from "@/lib/storage";

export async function createEmployeeAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requirePermissionUser();

  const parsed = createEmployeeSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    companyId: formData.get("companyId"),
    position: formData.get("position"),
    hireDate: formData.get("hireDate"),
    phone: formData.get("phone"),
    whatsapp: formData.get("whatsapp"),
    email: formData.get("email"),
    dni: formData.get("dni"),
    cuil: formData.get("cuil"),
    birthDate: formData.get("birthDate"),
    address: formData.get("address"),
    emergencyContactName: formData.get("emergencyContactName"),
    emergencyContactPhone: formData.get("emergencyContactPhone"),
    workday: formData.get("workday"),
    shift: formData.get("shift"),
    contractType: formData.get("contractType"),
    salary: formData.get("salary"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  const data = parsed.data;

  if (!canManageEmployees(user, data.companyId)) {
    return { error: "No tenés permisos para dar de alta empleados en esta empresa." };
  }

  const salary = canViewSalary(user) && data.salary ? Number(data.salary) : undefined;

  const photo = formData.get("photo");
  const photoFile = isUploadedFile(photo)
    ? await saveUploadedFile(photo, { prefix: "empleados/fotos", uploadedById: user.id })
    : null;

  const employee = await prisma.$transaction(async (tx) => {
    const created = await tx.employee.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        companyId: data.companyId,
        position: data.position,
        hireDate: new Date(data.hireDate),
        phone: data.phone,
        whatsapp: data.whatsapp,
        email: data.email || undefined,
        dni: data.dni,
        cuil: data.cuil,
        birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
        address: data.address,
        emergencyContactName: data.emergencyContactName,
        emergencyContactPhone: data.emergencyContactPhone,
        workday: data.workday,
        shift: data.shift,
        contractType: data.contractType,
        salary,
        status: "EN_PRUEBA",
        photoFileId: photoFile?.id,
      },
    });

    await logEvent(tx, {
      employeeId: created.id,
      type: "HIRED",
      title: "Alta de legajo",
      description: `${created.firstName} ${created.lastName} · ${created.position}`,
      createdById: user.id,
    });

    return created;
  });

  revalidatePath("/empleados");
  revalidatePath("/dashboard");
  redirect(`/empleados/${employee.id}`);
}

export async function changeEmployeeStatusAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requirePermissionUser();

  const parsed = changeEmployeeStatusSchema.safeParse({
    employeeId: formData.get("employeeId"),
    status: formData.get("status"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  const { employeeId, status } = parsed.data;

  const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
  if (!employee) return { error: "El empleado no existe." };

  if (!canChangeEmployeeStatus(user, employee.companyId)) {
    return { error: "No tenés permisos para cambiar el estado de este empleado." };
  }

  if (employee.status === status) return { success: true };

  await prisma.$transaction(async (tx) => {
    await tx.employee.update({
      where: { id: employeeId },
      data: {
        status,
        terminationDate: status === "DESVINCULADO" ? new Date() : employee.terminationDate,
      },
    });

    await logEvent(tx, {
      employeeId,
      type: "STATUS_CHANGE",
      title: `Estado: ${EMPLOYEE_STATUS_LABELS[employee.status]} → ${EMPLOYEE_STATUS_LABELS[status]}`,
      createdById: user.id,
    });
  });

  revalidatePath(`/empleados/${employeeId}`);
  revalidatePath("/empleados");
  revalidatePath("/dashboard");

  return { success: true };
}

export async function createIncidentAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requirePermissionUser();

  const parsed = createIncidentSchema.safeParse({
    employeeId: formData.get("employeeId"),
    type: formData.get("type"),
    level: formData.get("level"),
    description: formData.get("description"),
    occurredAt: formData.get("occurredAt"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  const data = parsed.data;

  const employee = await prisma.employee.findUnique({ where: { id: data.employeeId } });
  if (!employee) return { error: "El empleado no existe." };

  if (!canRegisterIncident(user, employee.companyId)) {
    return { error: "No tenés permisos para registrar incidencias en esta empresa." };
  }

  const evidence = formData.get("evidence");
  const evidenceFile = isUploadedFile(evidence)
    ? await saveUploadedFile(evidence, { prefix: "incidencias/evidencia", uploadedById: user.id, isSensitive: true })
    : null;

  await prisma.$transaction(async (tx) => {
    const incident = await tx.employeeIncident.create({
      data: {
        employeeId: data.employeeId,
        companyId: employee.companyId,
        occurredAt: new Date(data.occurredAt),
        type: data.type,
        level: data.level,
        description: data.description,
        recordedById: user.id,
        evidenceFileId: evidenceFile?.id,
      },
    });

    await logEvent(tx, {
      employeeId: data.employeeId,
      type: "INCIDENT",
      title: `${INCIDENT_TYPE_LABELS[data.type]} (${INCIDENT_LEVEL_LABELS[data.level]})`,
      description: data.description,
      sourceType: "EmployeeIncident",
      sourceId: incident.id,
      occurredAt: new Date(data.occurredAt),
      createdById: user.id,
    });
  });

  revalidatePath(`/empleados/${data.employeeId}`);
  revalidatePath("/empleados");
  revalidatePath("/dashboard");

  return { success: true };
}

export async function createRecognitionAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requirePermissionUser();

  const parsed = createRecognitionSchema.safeParse({
    employeeId: formData.get("employeeId"),
    type: formData.get("type"),
    description: formData.get("description"),
    occurredAt: formData.get("occurredAt"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  const data = parsed.data;

  const employee = await prisma.employee.findUnique({ where: { id: data.employeeId } });
  if (!employee) return { error: "El empleado no existe." };

  if (!canRegisterRecognition(user, employee.companyId)) {
    return { error: "No tenés permisos para registrar reconocimientos en esta empresa." };
  }

  await prisma.$transaction(async (tx) => {
    const recognition = await tx.employeeRecognition.create({
      data: {
        employeeId: data.employeeId,
        occurredAt: new Date(data.occurredAt),
        type: data.type,
        description: data.description,
        recordedById: user.id,
      },
    });

    await logEvent(tx, {
      employeeId: data.employeeId,
      type: "RECOGNITION",
      title: RECOGNITION_TYPE_LABELS[data.type],
      description: data.description,
      sourceType: "EmployeeRecognition",
      sourceId: recognition.id,
      occurredAt: new Date(data.occurredAt),
      createdById: user.id,
    });
  });

  revalidatePath(`/empleados/${data.employeeId}`);
  revalidatePath("/empleados");
  revalidatePath("/dashboard");

  return { success: true };
}
