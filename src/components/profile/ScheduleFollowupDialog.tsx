"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createFollowupAction } from "@/lib/actions/followups";
import type { ActionState } from "@/lib/actions/candidates";

const initialState: ActionState = undefined;

export function ScheduleFollowupDialog({
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
  const [state, formAction, pending] = useActionState(createFollowupAction, initialState);

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
          <SheetTitle>Agendar seguimiento</SheetTitle>
        </SheetHeader>
        <form action={formAction} className="flex flex-col gap-4 pb-2">
          <input type="hidden" name="candidateId" value={candidateId ?? ""} />
          <input type="hidden" name="employeeId" value={employeeId ?? ""} />

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="dueAt">Fecha y hora</Label>
            <Input id="dueAt" name="dueAt" type="datetime-local" required className="h-12 rounded-xl text-base" />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="note">Nota</Label>
            <Textarea id="note" name="note" rows={3} required />
          </div>

          {state?.error && <p className="text-sm text-rose-600">{state.error}</p>}

          <Button type="submit" disabled={pending} className="h-12 rounded-xl text-base">
            {pending ? "Guardando..." : "Agendar seguimiento"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
