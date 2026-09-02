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

export function StatList({ title, items }: { title: string; items: StatListItem[] }) {
  const router = useRouter();

  return (
    <section className="rounded-2xl bg-white p-3 ring-1 ring-neutral-100">
      <h2 className="px-1 pb-2 text-sm font-semibold text-neutral-900">{title}</h2>
      <div className="flex flex-col">
        {items.map((item) => (
          <button
            key={item.key}
            onClick={() => router.push(item.href)}
            className="flex items-center gap-3 rounded-xl px-1 py-2.5 text-left active:bg-neutral-50"
          >
            <span
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-lg",
                item.tone === "red"
                  ? "bg-rose-100 text-rose-700"
                  : item.tone === "amber"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-neutral-100 text-neutral-600"
              )}
            >
              <item.icon className="size-4.5" />
            </span>
            <span className="flex-1 text-sm text-neutral-700">{item.label}</span>
            <span className="text-base font-semibold text-neutral-900">{item.value}</span>
            <ChevronRight className="size-4 text-neutral-300" />
          </button>
        ))}
      </div>
    </section>
  );
}
