"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormSelect } from "@/components/shared/FormSelect";
import { createRecognitionAction } from "@/lib/actions/employees";
import type { ActionState } from "@/lib/actions/candidates";
import { RECOGNITION_TYPE_LABELS } from "@/lib/labels";

const initialState: ActionState = undefined;

export function RegisterRecognitionDialog({
  open,
  onOpenChange,
  employeeId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId: string;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(createRecognitionAction, initialState);

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
          <SheetTitle>Reconocimiento</SheetTitle>
        </SheetHeader>
        <form action={formAction} className="flex flex-col gap-4 pb-2">
          <input type="hidden" name="employeeId" value={employeeId} />

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="type">Tipo</Label>
            <FormSelect id="type" name="type" required defaultValue="RECONOCIMIENTO">
              {Object.entries(RECOGNITION_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </FormSelect>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="occurredAt">Fecha</Label>
            <Input
              id="occurredAt"
              name="occurredAt"
              type="datetime-local"
              required
              defaultValue={new Date().toISOString().slice(0, 16)}
              className="h-12 rounded-xl text-base"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Descripción</Label>
            <Textarea id="description" name="description" rows={3} required />
          </div>

          {state?.error && <p className="text-sm text-rose-600">{state.error}</p>}

          <Button type="submit" disabled={pending} className="h-12 rounded-xl text-base">
            {pending ? "Guardando..." : "Registrar reconocimiento"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
