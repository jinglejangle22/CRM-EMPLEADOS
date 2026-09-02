"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormSelect } from "@/components/shared/FormSelect";
import { createIncidentAction } from "@/lib/actions/employees";
import type { ActionState } from "@/lib/actions/candidates";
import { INCIDENT_LEVEL_LABELS, INCIDENT_TYPE_LABELS } from "@/lib/labels";

const initialState: ActionState = undefined;

export function RegisterIncidentDialog({
  open,
  onOpenChange,
  employeeId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId: string;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(createIncidentAction, initialState);

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
          <SheetTitle>Registrar incidencia</SheetTitle>
        </SheetHeader>
        <form action={formAction} encType="multipart/form-data" className="flex flex-col gap-4 pb-2">
          <input type="hidden" name="employeeId" value={employeeId} />

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="type">Tipo</Label>
            <FormSelect id="type" name="type" required defaultValue="LLEGADA_TARDE">
              {Object.entries(INCIDENT_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </FormSelect>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="level">Nivel</Label>
            <FormSelect id="level" name="level" required defaultValue="OBSERVACION">
              {Object.entries(INCIDENT_LEVEL_LABELS).map(([value, label]) => (
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

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="evidence">Evidencia (foto/documento)</Label>
            <Input id="evidence" name="evidence" type="file" className="h-12 rounded-xl text-base" />
          </div>

          {state?.error && <p className="text-sm text-rose-600">{state.error}</p>}

          <Button type="submit" disabled={pending} className="h-12 rounded-xl text-base">
            {pending ? "Guardando..." : "Registrar incidencia"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
