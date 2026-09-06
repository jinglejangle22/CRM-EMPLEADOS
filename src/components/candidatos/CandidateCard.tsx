"use client";

import { useRouter } from "next/navigation";
import { CalendarClock } from "lucide-react";
import type { Candidate } from "@/types";
import { useAppState } from "@/lib/app-state";
import { StatusBadge, candidateStageMeta } from "@/components/shared/StatusBadge";
import { RatingStars } from "@/components/shared/RatingStars";
import { WhatsappButton } from "@/components/shared/WhatsappButton";
import { initials, relativeDayLabel } from "@/lib/format";

export function CandidateCard({ candidate }: { candidate: Candidate }) {
  const router = useRouter();
  const { allCompanies } = useAppState();
  const company = allCompanies.find((c) => c.id === candidate.companyId);
  const stageMeta = candidateStageMeta[candidate.stage];

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => router.push(`/candidatos/${candidate.id}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter") router.push(`/candidatos/${candidate.id}`);
      }}
      className="flex w-full flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-4 text-left active:bg-neutral-50"
    >
      <div className="flex items-start gap-3">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-violet-100 text-[15px] font-semibold text-violet-700">
          {initials(candidate.firstName, candidate.lastName)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[17px] font-semibold text-neutral-900">
            {candidate.firstName} {candidate.lastName}
          </p>
          <p className="mt-0.5 line-clamp-2 text-sm text-neutral-600">
            {candidate.position} · {company?.shortName}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {stageMeta && <StatusBadge label={stageMeta.label} tone={stageMeta.tone} />}
            <RatingStars rating={candidate.rating} />
          </div>
        </div>
      </div>

      {candidate.nextInterviewAt && (
        <div className="flex items-center gap-1.5 rounded-lg bg-violet-50 px-2.5 py-2 text-sm font-medium text-violet-700">
          <CalendarClock className="size-4 shrink-0" />
          <span className="truncate">Entrevista {relativeDayLabel(candidate.nextInterviewAt)}</span>
        </div>
      )}

      <div className="flex items-center gap-2">
        <WhatsappButton phone={candidate.phone} compact className="flex-1" />
        <span className="flex h-11 flex-1 items-center justify-center rounded-xl bg-neutral-100 text-sm font-semibold text-neutral-700">
          Ver ficha
        </span>
      </div>
    </div>
  );
}
