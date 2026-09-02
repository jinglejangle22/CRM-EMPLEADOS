import { z } from "zod";

export const createIncidentSchema = z.object({
  employeeId: z.string().trim().min(1),
  type: z.enum([
    "LLEGADA_TARDE",
    "AUSENCIA",
    "AUSENCIA_SIN_AVISO",
    "DIFERENCIA_CAJA",
    "MALA_ATENCION",
    "INCUMPLIMIENTO_TAREAS",
    "USO_INDEBIDO_CELULAR",
    "INCUMPLIMIENTO_PROTOCOLO",
    "OTRO",
  ]),
  level: z.enum(["OBSERVACION", "ADVERTENCIA", "LLAMADO_FORMAL"]),
  description: z.string().trim().min(1, "Describí lo sucedido"),
  occurredAt: z.string().trim().min(1, "La fecha es obligatoria"),
});

export type CreateIncidentInput = z.infer<typeof createIncidentSchema>;
