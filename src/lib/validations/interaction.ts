import { z } from "zod";

const optionalString = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v === "" ? undefined : v));

export const createInteractionSchema = z
  .object({
    candidateId: optionalString,
    employeeId: optionalString,
    type: z.enum(["LLAMADA", "WHATSAPP", "EMAIL", "PRESENCIAL", "OTRO"]),
    result: z.enum(["CONTACTADO", "NO_RESPONDIO", "VOLVER_A_LLAMAR", "INTERESADO", "NO_INTERESADO", "PENDIENTE"]),
    note: optionalString,
    nextFollowUpAt: optionalString,
  })
  .refine((data) => data.candidateId || data.employeeId, {
    message: "Falta el candidato o empleado",
  });

export type CreateInteractionInput = z.infer<typeof createInteractionSchema>;
