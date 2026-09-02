import type {
  Candidate as PrismaCandidate,
  Employee as PrismaEmployee,
  Interview as PrismaInterview,
  Interaction as PrismaInteraction,
  Followup as PrismaFollowup,
  EmployeeIncident as PrismaEmployeeIncident,
  EmployeeRecognition as PrismaEmployeeRecognition,
  TimelineEvent as PrismaTimelineEvent,
} from "@prisma/client";
import type {
  Candidate,
  Employee,
  Interview,
  Interaction,
  Followup,
  EmployeeIncident,
  EmployeeRecognition,
  TimelineEvent,
  TimelineEventType,
} from "@/types";

/**
 * Funciones puras que traducen filas de Prisma (con sus relaciones incluidas)
 * a los tipos que consumen los componentes de UI. No hacen I/O.
 */

export function mapCandidate(
  row: PrismaCandidate & { tags: { tag: { name: string } }[] },
  nextInterviewAt?: Date | null
): Candidate {
  return {
    id: row.id,
    firstName: row.firstName,
    lastName: row.lastName,
    photoUrl: row.photoFileId ?? undefined,
    phone: row.phone,
    email: row.email ?? undefined,
    birthDate: row.birthDate?.toISOString(),
    address: row.address ?? undefined,
    zone: row.zone ?? undefined,
    companyId: row.companyId,
    position: row.position,
    availability: row.availability ?? undefined,
    salaryExpectation: row.salaryExpectation ?? undefined,
    experience: row.experience ?? undefined,
    cvReceivedDate: row.cvReceivedDate.toISOString(),
    source: row.source,
    hasCv: row.cvFileId != null,
    cvFileId: row.cvFileId ?? undefined,
    rating: row.rating ?? undefined,
    qualification: row.qualification ?? undefined,
    qualificationReason: row.qualificationReason ?? undefined,
    stage: row.stage,
    isArchived: row.isArchived,
    availableForFuture: row.availableForFuture,
    tagNames: row.tags.map((t) => t.tag.name),
    nextInterviewAt: nextInterviewAt?.toISOString(),
  };
}

export function mapEmployee(row: PrismaEmployee & { tags: { tag: { name: string } }[] }): Employee {
  return {
    id: row.id,
    candidateId: row.candidateId ?? undefined,
    firstName: row.firstName,
    lastName: row.lastName,
    photoUrl: row.photoFileId ?? undefined,
    dni: row.dni ?? undefined,
    cuil: row.cuil ?? undefined,
    birthDate: row.birthDate?.toISOString(),
    phone: row.phone ?? undefined,
    whatsapp: row.whatsapp ?? undefined,
    email: row.email ?? undefined,
    address: row.address ?? undefined,
    emergencyContactName: row.emergencyContactName ?? undefined,
    emergencyContactPhone: row.emergencyContactPhone ?? undefined,
    companyId: row.companyId,
    position: row.position,
    hireDate: row.hireDate.toISOString(),
    terminationDate: row.terminationDate?.toISOString(),
    workday: row.workday ?? undefined,
    shift: row.shift ?? undefined,
    salary: row.salary != null ? Number(row.salary) : undefined,
    contractType: row.contractType ?? undefined,
    status: row.status,
    tagNames: row.tags.map((t) => t.tag.name),
  };
}

export function mapInterview(
  row: PrismaInterview & {
    candidate: { id: string; firstName: string; lastName: string; phone: string };
    interviewer: { name: string } | null;
  }
): Interview {
  return {
    id: row.id,
    candidateId: row.candidateId,
    companyId: row.companyId,
    position: row.position,
    startsAt: row.startsAt.toISOString(),
    interviewerName: row.interviewer?.name,
    modality: row.modality,
    address: row.address ?? undefined,
    notes: row.notes ?? undefined,
    status: row.status,
    candidate: row.candidate,
  };
}

export function mapInteraction(row: PrismaInteraction & { user: { name: string } }): Interaction {
  return {
    id: row.id,
    candidateId: row.candidateId ?? undefined,
    employeeId: row.employeeId ?? undefined,
    type: row.type,
    occurredAt: row.occurredAt.toISOString(),
    result: row.result,
    note: row.note ?? undefined,
    userName: row.user.name,
    nextFollowUpAt: row.nextFollowUpAt?.toISOString(),
  };
}

export function mapFollowup(row: PrismaFollowup): Followup {
  return {
    id: row.id,
    candidateId: row.candidateId ?? undefined,
    employeeId: row.employeeId ?? undefined,
    dueAt: row.dueAt.toISOString(),
    note: row.note,
    status: row.status,
  };
}

export function mapIncident(row: PrismaEmployeeIncident & { recordedBy: { name: string } }): EmployeeIncident {
  return {
    id: row.id,
    employeeId: row.employeeId,
    occurredAt: row.occurredAt.toISOString(),
    type: row.type,
    level: row.level,
    description: row.description,
    recordedByName: row.recordedBy.name,
  };
}

export function mapRecognition(
  row: PrismaEmployeeRecognition & { recordedBy: { name: string } }
): EmployeeRecognition {
  return {
    id: row.id,
    employeeId: row.employeeId,
    occurredAt: row.occurredAt.toISOString(),
    type: row.type,
    description: row.description,
    recordedByName: row.recordedBy.name,
  };
}

export function mapTimelineEvent(row: PrismaTimelineEvent & { createdBy: { name: string } }): TimelineEvent {
  return {
    id: row.id,
    candidateId: row.candidateId ?? undefined,
    employeeId: row.employeeId ?? undefined,
    type: row.type as TimelineEventType,
    title: row.title,
    description: row.description ?? undefined,
    occurredAt: row.occurredAt.toISOString(),
    createdByName: row.createdBy.name,
  };
}
