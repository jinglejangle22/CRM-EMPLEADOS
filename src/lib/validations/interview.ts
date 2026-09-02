import { z } from "zod";

const optionalString = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v === "" ? undefined : v));

export const createInterviewSchema = z.object({
  candidateId: z.string().trim().min(1, "Elegí un candidato"),
  companyId: z.string().trim().min(1),
  position: z.string().trim().min(1, "El puesto es obligatorio"),
  startsAt: z.string().trim().min(1, "La fecha y hora son obligatorias"),
  modality: z.enum(["PRESENCIAL", "VIRTUAL"]),
  address: optionalString,
  notes: optionalString,
});

export type CreateInterviewInput = z.infer<typeof createInterviewSchema>;

export const updateInterviewStatusSchema = z.object({
  interviewId: z.string().min(1),
  status: z.enum(["PENDIENTE", "CONFIRMADA", "REPROGRAMADA", "CANCELADA", "SE_PRESENTO", "NO_SE_PRESENTO"]),
});
