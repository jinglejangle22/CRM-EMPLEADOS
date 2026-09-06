import { cn } from "@/lib/utils";

type Tone = "neutral" | "green" | "amber" | "red" | "blue" | "violet";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-neutral-100 text-neutral-700",
  green: "bg-emerald-100 text-emerald-700",
  amber: "bg-amber-100 text-amber-800",
  red: "bg-rose-100 text-rose-700",
  blue: "bg-sky-100 text-sky-700",
  violet: "bg-violet-100 text-violet-700",
};

export function StatusBadge({
  label,
  tone = "neutral",
  className,
}: {
  label: string;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex min-h-7 items-center rounded-full px-3 text-[13px] font-semibold leading-none",
        toneClasses[tone],
        className
      )}
    >
      {label}
    </span>
  );
}

// --- Mapeos de dominio -> tono visual --------------------------------------

export const candidateStageMeta: Record<string, { label: string; tone: Tone }> = {
  CV_RECIBIDO: { label: "CV recibido", tone: "neutral" },
  CV_REVISADO: { label: "CV revisado", tone: "blue" },
  CONTACTADO: { label: "Contactado", tone: "blue" },
  ENTREVISTA_AGENDADA: { label: "Entrevista agendada", tone: "violet" },
  ENTREVISTADO: { label: "Entrevistado", tone: "violet" },
  PRUEBA_LABORAL: { label: "Prueba laboral", tone: "amber" },
  CONTRATADO: { label: "Contratado", tone: "green" },
  NO_SELECCIONADO: { label: "No seleccionado", tone: "red" },
};

export const employeeStatusMeta: Record<string, { label: string; tone: Tone }> = {
  EN_PRUEBA: { label: "En prueba", tone: "amber" },
  ACTIVO: { label: "Activo", tone: "green" },
  LICENCIA: { label: "Licencia", tone: "blue" },
  VACACIONES: { label: "Vacaciones", tone: "violet" },
  SUSPENDIDO: { label: "Suspendido", tone: "red" },
  DESVINCULADO: { label: "Desvinculado", tone: "neutral" },
};

export const interviewStatusMeta: Record<string, { label: string; tone: Tone }> = {
  PENDIENTE: { label: "Pendiente", tone: "amber" },
  CONFIRMADA: { label: "Confirmada", tone: "green" },
  REPROGRAMADA: { label: "Reprogramada", tone: "blue" },
  CANCELADA: { label: "Cancelada", tone: "red" },
  SE_PRESENTO: { label: "Se presentó", tone: "green" },
  NO_SE_PRESENTO: { label: "No se presentó", tone: "red" },
};

export const followupStatusMeta: Record<string, { label: string; tone: Tone }> = {
  PENDIENTE: { label: "Pendiente", tone: "amber" },
  COMPLETADO: { label: "Completado", tone: "green" },
  CANCELADO: { label: "Cancelado", tone: "neutral" },
};
