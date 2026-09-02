import type { Followup } from "@/types";

/** Próximo seguimiento pendiente (el de fecha más próxima), o undefined si no hay. */
export function pickNextFollowup(followups: Followup[]): Followup | undefined {
  return followups
    .filter((f) => f.status === "PENDIENTE")
    .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime())[0];
}
