"use client";

import {
  PhoneOutgoing,
  Clock,
  CalendarPlus,
  AlertTriangle,
  Award,
  ArrowRightLeft,
  Pencil,
  type LucideIcon,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export type ProfileAction = {
  key: string;
  label: string;
  description: string;
  icon: LucideIcon;
};

const CANDIDATE_ACTIONS: ProfileAction[] = [
  { key: "interaccion", label: "Registrar contacto", description: "Llamada, WhatsApp, email o presencial", icon: PhoneOutgoing },
  { key: "seguimiento", label: "Agendar seguimiento", description: "Recordatorio con fecha y hora", icon: Clock },
  { key: "entrevista", label: "Agendar entrevista", description: "Se agrega a la agenda", icon: CalendarPlus },
  { key: "etapa", label: "Cambiar etapa", description: "Mover en el pipeline de selección", icon: ArrowRightLeft },
  { key: "editar", label: "Editar candidato", description: "Modificar datos del candidato", icon: Pencil },
];

const EMPLEADO_ACTIONS: ProfileAction[] = [
  { key: "interaccion", label: "Registrar contacto", description: "Llamada, WhatsApp, email o presencial", icon: PhoneOutgoing },
  { key: "seguimiento", label: "Agendar seguimiento", description: "Recordatorio con fecha y hora", icon: Clock },
  { key: "incidencia", label: "Registrar incidencia", description: "Llegada tarde, ausencia, llamado de atención", icon: AlertTriangle },
  { key: "reconocimiento", label: "Reconocimiento", description: "Buen desempeño o felicitación", icon: Award },
  { key: "estado", label: "Cambiar estado", description: "En prueba, activo, licencia, etc.", icon: ArrowRightLeft },
];

// UI only en Etapa A — cada acción se conecta a mutaciones reales en Etapa B.
export function ProfileActionSheet({
  open,
  onOpenChange,
  type,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "candidate" | "employee";
  onSelect?: (key: string) => void;
}) {
  const actions = type === "candidate" ? CANDIDATE_ACTIONS : EMPLEADO_ACTIONS;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl px-4 pb-6">
        <SheetHeader className="px-0 pt-2">
          <SheetTitle>Acción rápida</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-2 pb-2">
          {actions.map((action) => (
            <button
              key={action.key}
              onClick={() => {
                onOpenChange(false);
                onSelect?.(action.key);
              }}
              className="flex items-center gap-3 rounded-2xl border border-neutral-100 bg-neutral-50 p-3 text-left active:bg-neutral-100"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                <action.icon className="size-5" />
              </span>
              <span>
                <span className="block text-sm font-medium text-neutral-900">{action.label}</span>
                <span className="block text-xs text-neutral-500">{action.description}</span>
              </span>
            </button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
