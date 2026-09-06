"use client";

import { useAppState } from "@/lib/app-state";

export function CompanyStatGrid({
  total,
  countByCompanyId,
}: {
  total: number;
  countByCompanyId: Record<string, number>;
}) {
  const { allCompanies } = useAppState();

  return (
    <section className="rounded-2xl bg-white p-4 ring-1 ring-neutral-100">
      <h2 className="text-[15px] font-semibold text-neutral-900">Personal activo</h2>
      <p className="mt-1 text-3xl font-bold text-neutral-900">{total}</p>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {allCompanies.map((c) => (
          <div key={c.id} className="rounded-xl bg-neutral-50 p-2.5 text-center">
            <span className="mx-auto mb-1 block size-2 rounded-full" style={{ backgroundColor: c.colorHex }} />
            <p className="text-lg font-semibold text-neutral-900">{countByCompanyId[c.id] ?? 0}</p>
            <p className="text-xs leading-tight font-medium text-neutral-500">{c.shortName}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
