import { z } from "zod";

const optionalString = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v === "" ? undefined : v));

export const createFollowupSchema = z
  .object({
    candidateId: optionalString,
    employeeId: optionalString,
    dueAt: z.string().trim().min(1, "La fecha y hora son obligatorias"),
    note: z.string().trim().min(1, "Escribí una nota para el seguimiento"),
  })
  .refine((data) => data.candidateId || data.employeeId, {
    message: "Falta el candidato o empleado",
  });

export type CreateFollowupInput = z.infer<typeof createFollowupSchema>;

export const completeFollowupSchema = z.object({
  followupId: z.string().min(1),
  registerInteraction: z.enum(["true", "false"]).optional(),
  type: z.enum(["LLAMADA", "WHATSAPP", "EMAIL", "PRESENCIAL", "OTRO"]).optional(),
  result: z
    .enum(["CONTACTADO", "NO_RESPONDIO", "VOLVER_A_LLAMAR", "INTERESADO", "NO_INTERESADO", "PENDIENTE"])
    .optional(),
  note: optionalString,
});
