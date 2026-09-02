import * as React from "react";
import { cn } from "@/lib/utils";

export function FormSelect({ className, ...props }: React.ComponentProps<"select">) {
  return (
    <select
      data-slot="form-select"
      className={cn(
        "h-12 w-full min-w-0 rounded-xl border border-input bg-transparent px-2.5 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}
