import type { ReactNode } from "react";

export type InfoRow = {
  label: string;
  value: ReactNode;
};

export function InfoList({ title, rows }: { title: string; rows: InfoRow[] }) {
  const visible = rows.filter((r) => r.value !== undefined && r.value !== null && r.value !== "");
  if (visible.length === 0) return null;

  return (
    <section className="rounded-2xl bg-white p-3.5 ring-1 ring-neutral-100">
      <h2 className="px-1 pb-2 text-sm font-semibold text-neutral-900">{title}</h2>
      <dl className="flex flex-col divide-y divide-neutral-100">
        {visible.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-3 px-1 py-2">
            <dt className="text-xs text-neutral-500">{row.label}</dt>
            <dd className="truncate text-right text-sm font-medium text-neutral-900">{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
