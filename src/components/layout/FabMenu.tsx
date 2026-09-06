"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, UserPlus, CalendarPlus, UserCog, AlertTriangle } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const actions = [
  { label: "Nuevo candidato", description: "Cargar un CV recibido", icon: UserPlus, href: "/candidatos/nuevo" },
  { label: "Nueva entrevista", description: "Agendar en la agenda", icon: CalendarPlus, href: "/agenda/nueva" },
  { label: "Nuevo empleado", description: "Alta manual de legajo", icon: UserCog, href: "/empleados/nuevo" },
  { label: "Nuevo registro / incidencia", description: "Sobre un empleado existente", icon: AlertTriangle, href: "/empleados" },
];

export function FabMenu() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <button
        onClick={() => setOpen(true)}
        aria-label="Acciones rápidas"
        className="flex size-14 items-center justify-center rounded-full bg-violet-600 text-white shadow-lg shadow-violet-600/30 active:bg-violet-700"
      >
        <Plus className="size-7" />
      </button>
      <SheetContent side="bottom" className="rounded-t-3xl px-2 pb-2" style={{ paddingBottom: "calc(0.5rem + env(safe-area-inset-bottom))" }}>
        <SheetHeader className="px-4 pt-2 pb-1">
          <SheetTitle>Acción rápida</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col divide-y divide-neutral-100 px-2 pb-2">
          {actions.map((action) => (
            <button
              key={action.label}
              onClick={() => {
                setOpen(false);
                router.push(action.href);
              }}
              className="flex min-h-16 items-center gap-3.5 px-2 text-left active:bg-neutral-50"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                <action.icon className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-semibold text-neutral-900">{action.label}</span>
                <span className="block text-sm text-neutral-500">{action.description}</span>
              </span>
            </button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
