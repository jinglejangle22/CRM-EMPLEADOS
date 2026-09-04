"use client";

import { useActionState } from "react";
import { updateInterviewAction } from "@/lib/actions/interviews";
import type { ActionState } from "@/lib/actions/candidates";
import { INTERVIEW_MODALITY_LABELS } from "@/lib/labels";
import { toDateTimeLocalValue } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormSelect } from "@/components/shared/FormSelect";

const initialState: ActionState = undefined;

type InterviewInitialData = {
  id: string;
  candidateName: string;
  position: string;
  startsAt: string;
  modality: string;
  address?: string;
  notes?: string;
};

export function EditInterviewForm({ interview }: { interview: InterviewInitialData }) {
  const [state, formAction, pending] = useActionState(updateInterviewAction, initialState);

  return (
    <div className="flex flex-col gap-4 px-4 pb-8 pt-4">
      <h1 className="text-lg font-semibold text-neutral-900">Editar entrevista</h1>

      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="interviewId" value={interview.id} />

        <div className="flex flex-col gap-1.5">
          <Label>Candidato</Label>
          <p className="rounded-xl bg-neutral-100 px-3 py-3 text-base text-neutral-700">{interview.candidateName}</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="position">Puesto</Label>
          <Input id="position" name="position" required defaultValue={interview.position} className="h-12 rounded-xl text-base" />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="startsAt">Fecha y hora</Label>
          <Input
            id="startsAt"
            name="startsAt"
            type="datetime-local"
            required
            defaultValue={toDateTimeLocalValue(interview.startsAt)}
            className="h-12 rounded-xl text-base"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="modality">Modalidad</Label>
          <FormSelect id="modality" name="modality" required defaultValue={interview.modality}>
            {Object.entries(INTERVIEW_MODALITY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </FormSelect>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="address">Dirección</Label>
          <Input id="address" name="address" defaultValue={interview.address} className="h-12 rounded-xl text-base" />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="notes">Notas</Label>
          <Textarea id="notes" name="notes" rows={3} defaultValue={interview.notes} />
        </div>

        {state?.error && <p className="text-sm text-rose-600">{state.error}</p>}

        <Button type="submit" disabled={pending} className="mt-2 h-12 rounded-xl text-base">
          {pending ? "Guardando..." : "Guardar cambios"}
        </Button>
      </form>
    </div>
  );
}
