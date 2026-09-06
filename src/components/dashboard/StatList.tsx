"use client";

import { useRouter } from "next/navigation";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type StatListItem = {
  key: string;
  label: string;
  value: number;
  icon: LucideIcon;
  href: string;
  tone?: "neutral" | "amber" | "red";
};

export function StatList({
  title,
  items,
  zeroLabel,
}: {
  title: string;
  items: StatListItem[];
  zeroLabel?: string;
}) {
  const router = useRouter();

  return (
    <section className="rounded-2xl bg-white p-3 ring-1 ring-neutral-100">
      <h2 className="px-1.5 pb-1 text-[15px] font-semibold text-neutral-900">{title}</h2>
      <div className="flex flex-col divide-y divide-neutral-100">
        {items.map((item) => (
          <button
            key={item.key}
            onClick={() => router.push(item.href)}
            className="flex min-h-16 items-center gap-3.5 px-1.5 text-left active:bg-neutral-50"
          >
            <span
              className={cn(
                "flex size-11 shrink-0 items-center justify-center rounded-xl",
                item.tone === "red"
                  ? "bg-rose-100 text-rose-700"
                  : item.tone === "amber"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-neutral-100 text-neutral-600"
              )}
            >
              <item.icon className="size-5" />
            </span>
            <span className="flex-1 text-[15px] font-medium text-neutral-700">{item.label}</span>
            {item.value === 0 && zeroLabel ? (
              <span className="text-sm font-medium text-neutral-400">{zeroLabel}</span>
            ) : (
              <span className="text-lg font-semibold text-neutral-900">{item.value}</span>
            )}
            <ChevronRight className="size-4.5 shrink-0 text-neutral-300" />
          </button>
        ))}
      </div>
    </section>
  );
}
