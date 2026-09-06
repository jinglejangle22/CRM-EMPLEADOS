"use client";

import { cn } from "@/lib/utils";

export type PipelineChip = {
  key: string;
  label: string;
  count: number;
};

export function PipelineFilterChips({
  chips,
  activeKey,
  onSelect,
}: {
  chips: PipelineChip[];
  activeKey: string;
  onSelect: (key: string) => void;
}) {
  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {chips.map((chip) => {
        const active = chip.key === activeKey;
        return (
          <button
            key={chip.key}
            onClick={() => onSelect(chip.key)}
            className={cn(
              "flex h-10 shrink-0 items-center gap-1.5 rounded-full px-4 text-sm font-semibold whitespace-nowrap",
              active ? "bg-violet-600 text-white" : "bg-white text-neutral-600 ring-1 ring-neutral-200"
            )}
          >
            {chip.label}
            <span
              className={cn(
                "rounded-full px-1.5 text-xs font-semibold",
                active ? "bg-white/20" : "bg-neutral-100 text-neutral-500"
              )}
            >
              {chip.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
