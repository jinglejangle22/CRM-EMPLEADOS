"use client";

import { useActionState, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createInterviewAction } from "@/lib/actions/interviews";
import type { ActionState } from "@/lib/actions/candidates";
import { INTERVIEW_MODALITY_LABELS } from "@/lib/labels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormSelect } from "@/components/shared/FormSelect";

type CandidateOption = {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  companyId: string;
};

const initialState: ActionState = undefined;

export function NewInterviewForm({ candidates }: { candidates: CandidateOption[] }) {
  const searchParams = useSearchParams();
  const preselected = searchParams.get("candidateId") ?? "";
  const [state, formAction, pending] = useActionState(createInterviewAction, initialState);
  const [candidateId, setCandidateId] = useState(preselected);

  const selected = useMemo(() => candidates.find((c) => c.id === candidateId), [candidates, candidateId]);

  if (candidates.length === 0) {
    return <p className="p-4 text-sm text-neutral-500">No hay candidatos activos para agendar una entrevista.</p>;
  }

  return (
    <div className="mx-auto flex w-full max-w-[640px] flex-col gap-4 px-4 pb-8 pt-4">
      <h1 className="text-2xl font-bold text-neutral-900">Nueva entrevista</h1>

      <form action={formAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="candidateId">Candidato</Label>
          <FormSelect
            id="candidateId"
            name="candidateId"
            required
            value={candidateId}
            onChange={(e) => setCandidateId(e.target.value)}
          >
            <option value="" disabled>
              Elegí un candidato
            </option>
            {candidates.map((c) => (
              <option key={c.id} value={c.id}>
                {c.firstName} {c.lastName} · {c.position}
              </option>
            ))}
          </FormSelect>
        </div>

        <input type="hidden" name="companyId" value={selected?.companyId ?? ""} />

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="position">Puesto</Label>
          <Input
            id="position"
            name="position"
            required
            defaultValue={selected?.position ?? ""}
            key={selected?.id}
            className="h-12 rounded-xl text-base"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="startsAt">Fecha y hora</Label>
          <Input id="startsAt" name="startsAt" type="datetime-local" required className="h-12 rounded-xl text-base" />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="modality">Modalidad</Label>
          <FormSelect id="modality" name="modality" required defaultValue="PRESENCIAL">
            {Object.entries(INTERVIEW_MODALITY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </FormSelect>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="address">Dirección</Label>
          <Input id="address" name="address" className="h-12 rounded-xl text-base" />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="notes">Notas</Label>
          <Textarea id="notes" name="notes" rows={3} />
        </div>

        {state?.error && <p className="text-sm text-rose-600">{state.error}</p>}

        <Button type="submit" disabled={pending || !candidateId} className="mt-2 h-12 rounded-xl text-base">
          {pending ? "Agendando..." : "Agendar entrevista"}
        </Button>
      </form>
    </div>
  );
}
