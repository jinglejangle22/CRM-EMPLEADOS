"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FormSelect } from "@/components/shared/FormSelect";
import { changeEmployeeStatusAction } from "@/lib/actions/employees";
import type { ActionState } from "@/lib/actions/candidates";
import { EMPLOYEE_STATUS_LABELS } from "@/lib/labels";
import type { EmployeeStatus } from "@prisma/client";

const initialState: ActionState = undefined;

export function ChangeEmployeeStatusDialog({
  open,
  onOpenChange,
  employeeId,
  currentStatus,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId: string;
  currentStatus: EmployeeStatus;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(changeEmployeeStatusAction, initialState);

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
          <SheetTitle>Cambiar estado</SheetTitle>
        </SheetHeader>
        <form action={formAction} className="flex flex-col gap-4 pb-2">
          <input type="hidden" name="employeeId" value={employeeId} />

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="status">Nuevo estado</Label>
            <FormSelect id="status" name="status" required defaultValue={currentStatus}>
              {Object.entries(EMPLOYEE_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </FormSelect>
          </div>

          {state?.error && <p className="text-sm text-rose-600">{state.error}</p>}

          <Button type="submit" disabled={pending} className="h-12 rounded-xl text-base">
            {pending ? "Guardando..." : "Guardar estado"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
