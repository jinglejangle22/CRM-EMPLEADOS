"use client";

import { CompanySwitcher } from "@/components/layout/CompanySwitcher";
import { SearchTrigger } from "@/components/shared/SearchBar";
import { useAppState } from "@/lib/app-state";
import { initials } from "@/lib/format";

export function TopBar() {
  const { currentUser } = useAppState();

  return (
    <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 backdrop-blur pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex h-14 max-w-md items-center justify-between gap-2 px-4">
        <CompanySwitcher />
        <div className="flex items-center gap-2">
          <SearchTrigger />
          <span
            className="flex size-9 items-center justify-center rounded-full bg-violet-600 text-xs font-semibold text-white"
            title={currentUser.name}
          >
            {initials(currentUser.name.split(" ")[0] ?? "U", "")}
          </span>
        </div>
      </div>
    </header>
  );
}
