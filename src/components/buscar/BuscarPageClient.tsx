"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { Candidate, Employee } from "@/types";
import { Input } from "@/components/ui/input";
import { CandidateCard } from "@/components/candidatos/CandidateCard";
import { EmployeeCard } from "@/components/empleados/EmployeeCard";

function matches(query: string, ...fields: (string | undefined)[]): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return false;
  return fields.some((f) => f?.toLowerCase().includes(q));
}

export function BuscarPageClient({ candidates, employees }: { candidates: Candidate[]; employees: Employee[] }) {
  const [query, setQuery] = useState("");

  const matchingCandidates = useMemo(
    () => candidates.filter((c) => matches(query, c.firstName, c.lastName, c.phone, c.email, c.position)),
    [candidates, query]
  );
  const matchingEmployees = useMemo(
    () => employees.filter((e) => matches(query, e.firstName, e.lastName, e.phone, e.email, e.position, e.dni)),
    [employees, query]
  );

  const hasQuery = query.trim().length > 0;
  const hasResults = matchingCandidates.length > 0 || matchingEmployees.length > 0;

  return (
    <div className="mx-auto flex w-full max-w-[950px] flex-col gap-3 px-4 pt-4 pb-8">
      <h1 className="text-2xl font-bold text-neutral-900">Buscar</h1>

      <Input
        autoFocus
        placeholder="Nombre, teléfono, email, DNI o puesto..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="h-12 rounded-xl bg-white text-base"
      />

      {!hasQuery && (
        <div className="flex flex-col items-center gap-2 py-16 text-neutral-400">
          <Search className="size-8" />
          <p className="text-sm">Buscá entre candidatos y empleados.</p>
        </div>
      )}

      {hasQuery && !hasResults && (
        <p className="py-10 text-center text-sm text-neutral-400">No se encontraron resultados.</p>
      )}

      {matchingCandidates.length > 0 && (
        <section className="flex flex-col gap-2.5">
          <h2 className="px-1 text-[15px] font-semibold text-neutral-900">Candidatos ({matchingCandidates.length})</h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {matchingCandidates.map((c) => (
              <CandidateCard key={c.id} candidate={c} />
            ))}
          </div>
        </section>
      )}

      {matchingEmployees.length > 0 && (
        <section className="flex flex-col gap-2.5">
          <h2 className="px-1 text-[15px] font-semibold text-neutral-900">Empleados ({matchingEmployees.length})</h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {matchingEmployees.map((e) => (
              <EmployeeCard key={e.id} employee={e} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
