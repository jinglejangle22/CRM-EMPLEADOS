"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormSelect } from "@/components/shared/FormSelect";
import { createInteractionAction } from "@/lib/actions/interactions";
import type { ActionState } from "@/lib/actions/candidates";
import { INTERACTION_RESULT_LABELS, INTERACTION_TYPE_LABELS } from "@/lib/labels";

const initialState: ActionState = undefined;

export function RegisterInteractionDialog({
  open,
  onOpenChange,
  candidateId,
  employeeId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidateId?: string;
  employeeId?: string;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(createInteractionAction, initialState);

  useEffect(() => {
    if (state?.success) {
      onOpenChange(false);
      router.refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl px-4 pb-6">
        <SheetHeader className="px-0 pt-2">
          <SheetTitle>Registrar contacto</SheetTitle>
        </SheetHeader>
        <form action={formAction} className="flex flex-col gap-4 pb-2">
          <input type="hidden" name="candidateId" value={candidateId ?? ""} />
          <input type="hidden" name="employeeId" value={employeeId ?? ""} />

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="type">Tipo</Label>
            <FormSelect id="type" name="type" required defaultValue="LLAMADA">
              {Object.entries(INTERACTION_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </FormSelect>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="result">Resultado</Label>
            <FormSelect id="result" name="result" required defaultValue="CONTACTADO">
              {Object.entries(INTERACTION_RESULT_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </FormSelect>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="note">Nota</Label>
            <Textarea id="note" name="note" rows={3} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nextFollowUpAt">Próximo seguimiento (opcional)</Label>
            <Input id="nextFollowUpAt" name="nextFollowUpAt" type="datetime-local" className="h-12 rounded-xl text-base" />
          </div>

          {state?.error && <p className="text-sm text-rose-600">{state.error}</p>}

          <Button type="submit" disabled={pending} className="h-12 rounded-xl text-base">
            {pending ? "Guardando..." : "Guardar contacto"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
