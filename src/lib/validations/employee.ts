import { z } from "zod";

const optionalString = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v === "" ? undefined : v));

export const createEmployeeSchema = z.object({
  firstName: z.string().trim().min(1, "El nombre es obligatorio"),
  lastName: z.string().trim().min(1, "El apellido es obligatorio"),
  companyId: z.string().trim().min(1, "Elegí una empresa"),
  position: z.string().trim().min(1, "El puesto es obligatorio"),
  hireDate: z.string().trim().min(1, "La fecha de ingreso es obligatoria"),
  phone: optionalString,
  whatsapp: optionalString,
  email: z.union([z.literal(""), z.string().trim().email("Email inválido")]).optional(),
  dni: optionalString,
  cuil: optionalString,
  birthDate: optionalString,
  address: optionalString,
  emergencyContactName: optionalString,
  emergencyContactPhone: optionalString,
  workday: optionalString,
  shift: optionalString,
  contractType: optionalString,
  salary: optionalString,
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;

export const changeEmployeeStatusSchema = z.object({
  employeeId: z.string().min(1),
  status: z.enum(["EN_PRUEBA", "ACTIVO", "LICENCIA", "VACACIONES", "SUSPENDIDO", "DESVINCULADO"]),
});
