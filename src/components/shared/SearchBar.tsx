"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export function SearchTrigger() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push("/buscar")}
      aria-label="Buscar"
      className="flex size-9 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 active:bg-neutral-200"
    >
      <Search className="size-4.5" />
    </button>
  );
}
