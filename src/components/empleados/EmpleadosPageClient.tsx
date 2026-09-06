"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Users } from "lucide-react";
import { useAppState, ALL_COMPANIES_ID } from "@/lib/app-state";
import type { Employee } from "@/types";
import { employeeStatusMeta } from "@/components/shared/StatusBadge";
import { EmployeeCard } from "@/components/empleados/EmployeeCard";
import { PipelineFilterChips, type PipelineChip } from "@/components/candidatos/PipelineFilterChips";
import { Input } from "@/components/ui/input";

const STATUS_ORDER = Object.keys(employeeStatusMeta) as (keyof typeof employeeStatusMeta)[];

export function EmpleadosPageClient({ employees }: { employees: Employee[] }) {
  const { activeCompanyId } = useAppState();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState("");
  const [activeChip, setActiveChip] = useState<string>(searchParams.get("status") ?? "TODOS");

  const scoped = useMemo(
    () => employees.filter((e) => activeCompanyId === ALL_COMPANIES_ID || e.companyId === activeCompanyId),
    [employees, activeCompanyId]
  );

  const chips: PipelineChip[] = useMemo(() => {
    const base: PipelineChip[] = [{ key: "TODOS", label: "Todos", count: scoped.length }];
    for (const status of STATUS_ORDER) {
      const count = scoped.filter((e) => e.status === status).length;
      if (count === 0) continue;
      base.push({ key: status, label: employeeStatusMeta[status].label, count });
    }
    return base;
  }, [scoped]);

  const filtered = useMemo(() => {
    let list = scoped;
    if (activeChip !== "TODOS") {
      list = list.filter((e) => e.status === activeChip);
    }
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((e) => `${e.firstName} ${e.lastName} ${e.position}`.toLowerCase().includes(q));
    }
    return list;
  }, [scoped, activeChip, query]);

  return (
    <div className="mx-auto flex w-full max-w-[950px] flex-col gap-3 px-4 pt-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">Empleados</h1>
        <span className="flex min-h-7 items-center gap-1 rounded-full bg-emerald-50 px-3 text-[13px] font-semibold text-emerald-700">
          <Users className="size-3.5" />
          {scoped.length}
        </span>
      </div>

      <Input
        placeholder="Buscar empleados..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="h-12 rounded-xl bg-white text-base"
      />

      <PipelineFilterChips chips={chips} activeKey={activeChip} onSelect={setActiveChip} />

      <div className="grid grid-cols-1 gap-3 pb-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.length === 0 && (
          <p className="col-span-full py-10 text-center text-sm text-neutral-400">No hay empleados para este filtro.</p>
        )}
        {filtered.map((employee) => (
          <EmployeeCard key={employee.id} employee={employee} />
        ))}
      </div>
    </div>
  );
}
