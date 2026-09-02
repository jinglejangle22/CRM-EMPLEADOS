import { z } from "zod";

export const createTagSchema = z.object({
  companyId: z.string().trim().min(1, "Elegí una empresa"),
  name: z.string().trim().min(1, "El nombre es obligatorio"),
  category: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
});

export const deleteTagSchema = z.object({
  tagId: z.string().min(1),
});
