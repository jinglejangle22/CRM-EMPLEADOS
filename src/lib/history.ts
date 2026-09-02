import type { Prisma, PrismaClient } from "@prisma/client";
import type { TimelineEventType } from "@/types";

type PrismaTx = PrismaClient | Prisma.TransactionClient;

export type LogEventInput = {
  candidateId?: string;
  employeeId?: string;
  type: TimelineEventType;
  title: string;
  description?: string;
  sourceType?: string;
  sourceId?: string;
  occurredAt?: Date;
  createdById: string;
};

/**
 * Registra un evento en la l\u00ednea de tiempo unificada (candidato y/o empleado).
 * Se llama desde cada mutaci\u00f3n relevante (crear interacci\u00f3n, cambiar etapa,
 * registrar incidencia, reconocer, agendar entrevista, contratar, cambiar estado,
 * crear/completar seguimiento). Acepta el cliente de Prisma o una transacci\u00f3n
 * (`tx`) para poder registrarse at\u00f3micamente junto con la mutaci\u00f3n que lo origina.
 */
export async function logEvent(db: PrismaTx, input: LogEventInput) {
  if (!input.candidateId && !input.employeeId) {
    throw new Error("logEvent requiere candidateId y/o employeeId");
  }

  return db.timelineEvent.create({
    data: {
      candidateId: input.candidateId,
      employeeId: input.employeeId,
      type: input.type,
      title: input.title,
      description: input.description,
      sourceType: input.sourceType,
      sourceId: input.sourceId,
      occurredAt: input.occurredAt ?? new Date(),
      createdById: input.createdById,
    },
  });
}
