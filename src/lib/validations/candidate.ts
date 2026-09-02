import { z } from "zod";

const optionalString = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v === "" ? undefined : v));

export const createCandidateSchema = z.object({
  firstName: z.string().trim().min(1, "El nombre es obligatorio"),
  lastName: z.string().trim().min(1, "El apellido es obligatorio"),
  phone: z.string().trim().min(1, "El teléfono es obligatorio"),
  email: z.union([z.literal(""), z.string().trim().email("Email inválido")]).optional(),
  companyId: z.string().trim().min(1, "Elegí una empresa"),
  position: z.string().trim().min(1, "El puesto es obligatorio"),
  source: z.enum([
    "INSTAGRAM",
    "WHATSAPP",
    "COMPUTRABAJO",
    "INDEED",
    "REFERIDO",
    "CARTEL",
    "OTRO",
  ]),
  zone: optionalString,
  address: optionalString,
  availability: optionalString,
  salaryExpectation: optionalString,
  experience: optionalString,
  birthDate: optionalString,
});

export type CreateCandidateInput = z.infer<typeof createCandidateSchema>;

export const changeCandidateStageSchema = z.object({
  candidateId: z.string().min(1),
  stage: z.enum([
    "CV_RECIBIDO",
    "CV_REVISADO",
    "CONTACTADO",
    "ENTREVISTA_AGENDADA",
    "ENTREVISTADO",
    "PRUEBA_LABORAL",
    "CONTRATADO",
    "NO_SELECCIONADO",
  ]),
});
