"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { UserPlus } from "lucide-react";
import { isToday } from "date-fns";
import { useAppState, ALL_COMPANIES_ID } from "@/lib/app-state";
import type { Candidate, Interaction, Followup } from "@/types";
import { candidateStageMeta } from "@/components/shared/StatusBadge";
import { CandidateCard } from "@/components/candidatos/CandidateCard";
import { PipelineFilterChips, type PipelineChip } from "@/components/candidatos/PipelineFilterChips";
import { Input } from "@/components/ui/input";

const STAGE_ORDER = Object.keys(candidateStageMeta) as (keyof typeof candidateStageMeta)[];

export function CandidatosPageClient({
  candidates,
  interactions,
  followups,
}: {
  candidates: Candidate[];
  interactions: Interaction[];
  followups: Followup[];
}) {
  const { activeCompanyId } = useAppState();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState("");
  const [activeChip, setActiveChip] = useState<string>(searchParams.get("stage") ?? searchParams.get("filtro") ?? "TODOS");

  const scoped = useMemo(
    () =>
      candidates.filter(
        (c) => !c.isArchived && (activeCompanyId === ALL_COMPANIES_ID || c.companyId === activeCompanyId)
      ),
    [candidates, activeCompanyId]
  );

  const recontactarIds = useMemo(
    () =>
      new Set(
        interactions
          .filter((i) => i.result === "VOLVER_A_LLAMAR" || i.result === "NO_RESPONDIO")
          .map((i) => i.candidateId)
      ),
    [interactions]
  );
  const seguimientosHoyIds = useMemo(
    () =>
      new Set(
        followups
          .filter((f) => f.status === "PENDIENTE" && f.candidateId && isToday(new Date(f.dueAt)))
          .map((f) => f.candidateId)
      ),
    [followups]
  );

  const chips: PipelineChip[] = useMemo(() => {
    const base: PipelineChip[] = [{ key: "TODOS", label: "Todos", count: scoped.length }];
    for (const stage of STAGE_ORDER) {
      const count = scoped.filter((c) => c.stage === stage).length;
      if (count === 0) continue;
      base.push({ key: stage, label: candidateStageMeta[stage].label, count });
    }
    return base;
  }, [scoped]);

  const filtered = useMemo(() => {
    let list = scoped;
    if (activeChip === "recontactar") {
      list = list.filter((c) => recontactarIds.has(c.id));
    } else if (activeChip === "seguimientos-hoy") {
      list = list.filter((c) => seguimientosHoyIds.has(c.id));
    } else if (activeChip !== "TODOS") {
      list = list.filter((c) => c.stage === activeChip);
    }
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((c) =>
        `${c.firstName} ${c.lastName} ${c.position} ${c.zone ?? ""}`.toLowerCase().includes(q)
      );
    }
    return list;
  }, [scoped, activeChip, query, recontactarIds, seguimientosHoyIds]);

  return (
    <div className="flex flex-col gap-3 px-4 pt-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-neutral-900">Candidatos</h1>
        <span className="flex items-center gap-1 rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700">
          <UserPlus className="size-3.5" />
          {scoped.length}
        </span>
      </div>

      <Input
        placeholder="Buscar por nombre, puesto o zona..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="h-11 rounded-xl bg-white text-sm"
      />

      <PipelineFilterChips chips={chips} activeKey={activeChip} onSelect={setActiveChip} />

      <div className="flex flex-col gap-2.5 pb-4">
        {filtered.length === 0 && (
          <p className="py-10 text-center text-sm text-neutral-400">No hay candidatos para este filtro.</p>
        )}
        {filtered.map((candidate) => (
          <CandidateCard key={candidate.id} candidate={candidate} />
        ))}
      </div>
    </div>
  );
}
