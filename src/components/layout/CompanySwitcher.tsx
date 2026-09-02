"use client";

import { useState } from "react";
import { ChevronDown, Building2, Check } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAppState, ALL_COMPANIES_ID } from "@/lib/app-state";
import { cn } from "@/lib/utils";

export function CompanySwitcher() {
  const [open, setOpen] = useState(false);
  const { activeCompanyId, setActiveCompanyId, visibleCompanies, currentUser } = useAppState();

  const activeLabel =
    activeCompanyId === ALL_COMPANIES_ID
      ? "Todas las empresas"
      : visibleCompanies.find((c) => c.id === activeCompanyId)?.shortName ?? "Todas las empresas";

  const canSeeAll = currentUser.role === "ADMIN" || currentUser.role === "RRHH";

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <button
        onClick={() => setOpen(true)}
        className="flex h-9 items-center gap-1.5 rounded-full bg-neutral-100 pl-2.5 pr-2 text-sm font-medium text-neutral-800 active:bg-neutral-200"
      >
        <Building2 className="size-4 text-neutral-500" />
        <span className="max-w-[38vw] truncate">{activeLabel}</span>
        <ChevronDown className="size-4 text-neutral-400" />
      </button>
      <SheetContent side="bottom" className="rounded-t-3xl px-4 pb-6">
        <SheetHeader className="px-0 pt-2">
          <SheetTitle>Ver empresa</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-1 pb-2">
          {canSeeAll && (
            <CompanyOption
              label="Todas las empresas"
              colorHex="#525252"
              selected={activeCompanyId === ALL_COMPANIES_ID}
              onClick={() => {
                setActiveCompanyId(ALL_COMPANIES_ID);
                setOpen(false);
              }}
            />
          )}
          {visibleCompanies.map((c) => (
            <CompanyOption
              key={c.id}
              label={c.shortName}
              colorHex={c.colorHex}
              selected={activeCompanyId === c.id}
              onClick={() => {
                setActiveCompanyId(c.id);
                setOpen(false);
              }}
            />
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function CompanyOption({
  label,
  colorHex,
  selected,
  onClick,
}: {
  label: string;
  colorHex: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-2xl p-3 text-left active:bg-neutral-100",
        selected && "bg-violet-50"
      )}
    >
      <span className="size-3 shrink-0 rounded-full" style={{ backgroundColor: colorHex }} />
      <span className="flex-1 text-sm font-medium text-neutral-900">{label}</span>
      {selected && <Check className="size-4 text-violet-600" />}
    </button>
  );
}
