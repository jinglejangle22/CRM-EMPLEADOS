import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio"),
  email: z.string().trim().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  role: z.enum(["ADMIN", "ENCARGADO", "RRHH", "LECTURA"]),
  companyIds: z.array(z.string()).default([]),
});

export const updateUserSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["ADMIN", "ENCARGADO", "RRHH", "LECTURA"]),
  companyIds: z.array(z.string()).default([]),
});
