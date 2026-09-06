"use client";

import { useRouter } from "next/navigation";
import { Bell, Settings, LogOut } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { logoutAction } from "@/app/(app)/logout-action";

const items = [
  { label: "Alertas", description: "Pendientes y vencimientos", icon: Bell, href: "/alertas" },
  { label: "Configuración", description: "Usuarios, etiquetas y empresa", icon: Settings, href: "/configuracion" },
];

export function MoreSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-3xl px-2 pb-2"
        style={{ paddingBottom: "calc(0.5rem + env(safe-area-inset-bottom))" }}
      >
        <SheetHeader className="px-4 pt-2 pb-1">
          <SheetTitle>Más</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col divide-y divide-neutral-100 px-2 pb-2">
          {items.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                onOpenChange(false);
                router.push(item.href);
              }}
              className="flex min-h-16 items-center gap-3.5 px-2 text-left active:bg-neutral-50"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-700">
                <item.icon className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-semibold text-neutral-900">{item.label}</span>
                <span className="block text-sm text-neutral-500">{item.description}</span>
              </span>
            </button>
          ))}
          <button
            onClick={() => {
              onOpenChange(false);
              logoutAction();
            }}
            className="flex min-h-16 items-center gap-3.5 px-2 text-left text-rose-600 active:bg-rose-50"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-rose-50">
              <LogOut className="size-5" />
            </span>
            <span className="text-[15px] font-semibold">Cerrar sesión</span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
