"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FormSelect } from "@/components/shared/FormSelect";
import { changeCandidateStageAction } from "@/lib/actions/candidates";
import type { ActionState } from "@/lib/actions/candidates";
import { CANDIDATE_STAGE_LABELS } from "@/lib/labels";
import type { CandidateStage } from "@prisma/client";

const initialState: ActionState = undefined;

export function ChangeStageDialog({
  open,
  onOpenChange,
  candidateId,
  currentStage,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidateId: string;
  currentStage: CandidateStage;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(changeCandidateStageAction, initialState);

  useEffect(() => {
    if (state?.success) {
      onOpenChange(false);
      if (state.employeeId) {
        router.push(`/empleados/${state.employeeId}`);
      } else {
        router.refresh();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl px-4 pb-6">
        <SheetHeader className="px-0 pt-2">
          <SheetTitle>Cambiar etapa</SheetTitle>
        </SheetHeader>
        <form action={formAction} className="flex flex-col gap-4 pb-2">
          <input type="hidden" name="candidateId" value={candidateId} />

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="stage">Nueva etapa</Label>
            <FormSelect id="stage" name="stage" required defaultValue={currentStage}>
              {Object.entries(CANDIDATE_STAGE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </FormSelect>
          </div>

          <p className="text-xs text-neutral-500">
            Al pasar a &ldquo;Contratado&rdquo; se crea automáticamente el legajo de empleado.
          </p>

          {state?.error && <p className="text-sm text-rose-600">{state.error}</p>}

          <Button type="submit" disabled={pending} className="h-12 rounded-xl text-base">
            {pending ? "Guardando..." : "Guardar etapa"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
