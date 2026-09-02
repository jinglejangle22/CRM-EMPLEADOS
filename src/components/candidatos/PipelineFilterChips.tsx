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
              "flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium whitespace-nowrap",
              active ? "bg-violet-600 text-white" : "bg-white text-neutral-600 ring-1 ring-neutral-200"
            )}
          >
            {chip.label}
            <span
              className={cn(
                "rounded-full px-1.5 text-[11px]",
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
