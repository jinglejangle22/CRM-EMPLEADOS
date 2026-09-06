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
        className="flex h-11 max-w-[60%] items-center gap-1.5 rounded-full bg-neutral-100 pl-3 pr-2.5 text-[15px] font-semibold text-neutral-900 active:bg-neutral-200"
      >
        <Building2 className="size-4.5 shrink-0 text-neutral-500" />
        <span className="truncate">{activeLabel}</span>
        <ChevronDown className="size-4.5 shrink-0 text-neutral-400" />
      </button>
      <SheetContent
        side="bottom"
        className="rounded-t-3xl px-2 pb-2"
        style={{ paddingBottom: "calc(0.5rem + env(safe-area-inset-bottom))" }}
      >
        <SheetHeader className="px-4 pt-2 pb-1">
          <SheetTitle>Ver empresa</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col divide-y divide-neutral-100 px-2 pb-2">
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
        "flex min-h-14 items-center gap-3 px-2 text-left active:bg-neutral-50",
        selected && "bg-violet-50"
      )}
    >
      <span className="size-3 shrink-0 rounded-full" style={{ backgroundColor: colorHex }} />
      <span className="flex-1 text-[15px] font-semibold text-neutral-900">{label}</span>
      {selected && <Check className="size-4.5 text-violet-600" />}
    </button>
  );
}
