import { z } from "zod";

export const createRecognitionSchema = z.object({
  employeeId: z.string().trim().min(1),
  type: z.enum(["RECONOCIMIENTO", "BUEN_DESEMPENO", "FELICITACION_CLIENTE", "OBJETIVO_CUMPLIDO", "MEJORA_NOTABLE"]),
  description: z.string().trim().min(1, "Describí el reconocimiento"),
  occurredAt: z.string().trim().min(1, "La fecha es obligatoria"),
});

export type CreateRecognitionInput = z.infer<typeof createRecognitionSchema>;
