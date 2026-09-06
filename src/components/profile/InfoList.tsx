import type { ReactNode } from "react";

export type InfoRow = {
  label: string;
  value: ReactNode;
};

export function InfoList({ title, rows }: { title: string; rows: InfoRow[] }) {
  const visible = rows.filter((r) => r.value !== undefined && r.value !== null && r.value !== "");
  if (visible.length === 0) return null;

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-4">
      <h2 className="px-1 pb-1 text-[15px] font-semibold text-neutral-900">{title}</h2>
      <dl className="flex flex-col divide-y divide-neutral-100">
        {visible.map((row) => (
          <div key={row.label} className="flex min-h-11 items-center justify-between gap-3 px-1 py-2.5">
            <dt className="text-sm text-neutral-500">{row.label}</dt>
            <dd className="truncate text-right text-[15px] font-medium text-neutral-900">{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
