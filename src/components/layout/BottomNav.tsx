"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, CalendarDays, UserSquare2, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { FabMenu } from "@/components/layout/FabMenu";

export function BottomNav({ onMoreClick }: { onMoreClick: () => void }) {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-white/95 backdrop-blur"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Navegación principal"
    >
      <div className="pointer-events-none absolute inset-x-0 -top-7 flex justify-center">
        <div className="pointer-events-auto">
          <FabMenu />
        </div>
      </div>
      <div className="mx-auto grid h-[68px] max-w-[1100px] grid-cols-5 items-stretch px-1">
        <NavItem href="/dashboard" label="Inicio" Icon={Home} active={pathname.startsWith("/dashboard")} />
        <NavItem href="/candidatos" label="Candidatos" Icon={Users} active={pathname.startsWith("/candidatos")} />
        <NavItem href="/empleados" label="Empleados" Icon={UserSquare2} active={pathname.startsWith("/empleados")} />
        <NavItem href="/agenda" label="Agenda" Icon={CalendarDays} active={pathname.startsWith("/agenda")} />
        <MoreButton onClick={onMoreClick} active={pathname.startsWith("/alertas") || pathname.startsWith("/configuracion")} />
      </div>
    </nav>
  );
}

function NavItem({
  href,
  label,
  Icon,
  active,
}: {
  href: string;
  label: string;
  Icon: typeof Home;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center justify-center gap-1 text-[11px] font-semibold",
        active ? "text-violet-600" : "text-neutral-500"
      )}
    >
      <Icon className={cn("size-6", active && "stroke-[2.25]")} />
      {label}
    </Link>
  );
}

function MoreButton({ onClick, active }: { onClick: () => void; active: boolean }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-1 text-[11px] font-semibold",
        active ? "text-violet-600" : "text-neutral-500"
      )}
    >
      <MoreHorizontal className={cn("size-6", active && "stroke-[2.25]")} />
      Más
    </button>
  );
}
