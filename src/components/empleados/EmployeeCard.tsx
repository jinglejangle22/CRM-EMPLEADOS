"use client";

import { useRouter } from "next/navigation";
import type { Employee } from "@/types";
import { useAppState } from "@/lib/app-state";
import { StatusBadge, employeeStatusMeta } from "@/components/shared/StatusBadge";
import { WhatsappButton } from "@/components/shared/WhatsappButton";
import { initials } from "@/lib/format";

export function EmployeeCard({ employee }: { employee: Employee }) {
  const router = useRouter();
  const { allCompanies } = useAppState();
  const company = allCompanies.find((c) => c.id === employee.companyId);
  const statusMeta = employeeStatusMeta[employee.status];

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => router.push(`/empleados/${employee.id}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter") router.push(`/empleados/${employee.id}`);
      }}
      className="flex w-full flex-col gap-2.5 rounded-2xl bg-white p-3.5 text-left ring-1 ring-neutral-100 active:bg-neutral-50"
    >
      <div className="flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700">
          {initials(employee.firstName, employee.lastName)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-neutral-900">
            {employee.firstName} {employee.lastName}
          </p>
          <p className="truncate text-xs text-neutral-500">
            {employee.position} · {company?.shortName}
          </p>
          {employee.shift && <p className="truncate text-[11px] text-neutral-400">Turno {employee.shift}</p>}
        </div>
        {statusMeta && <StatusBadge label={statusMeta.label} tone={statusMeta.tone} />}
      </div>

      {employee.phone && (
        <div className="flex items-center gap-2">
          <WhatsappButton phone={employee.phone} compact className="flex-1" />
          <span className="flex h-9 flex-1 items-center justify-center rounded-xl bg-neutral-100 text-xs font-medium text-neutral-600">
            Ver legajo
          </span>
        </div>
      )}
    </div>
  );
}
