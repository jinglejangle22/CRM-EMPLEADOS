"use client";

import { useState } from "react";
import { Phone, StickyNote, Plus } from "lucide-react";
import { WhatsappButton } from "@/components/shared/WhatsappButton";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export function QuickActionsRow({
  phone,
  whatsappMessage,
  onOpenActions,
}: {
  phone?: string;
  whatsappMessage?: string;
  onOpenActions: () => void;
}) {
  const [noteOpen, setNoteOpen] = useState(false);

  return (
    <>
      <div className="grid grid-cols-4 gap-2 px-4">
        {phone ? (
          <WhatsappButton
            phone={phone}
            message={whatsappMessage}
            label="WhatsApp"
            className="h-14 w-full flex-col gap-1 border-0 px-0 text-xs"
          />
        ) : (
          <span />
        )}
        <a
          href={phone ? `tel:${phone}` : undefined}
          className="flex h-14 flex-col items-center justify-center gap-1 rounded-xl bg-sky-50 text-sky-700 active:bg-sky-100"
        >
          <Phone className="size-4.5" />
          <span className="text-xs font-semibold">Llamar</span>
        </a>
        <button
          onClick={() => setNoteOpen(true)}
          className="flex h-14 flex-col items-center justify-center gap-1 rounded-xl bg-neutral-100 text-neutral-600 active:bg-neutral-200"
        >
          <StickyNote className="size-4.5" />
          <span className="text-xs font-semibold">Nota</span>
        </button>
        <button
          onClick={onOpenActions}
          className="flex h-14 flex-col items-center justify-center gap-1 rounded-xl bg-violet-600 text-white active:bg-violet-700"
        >
          <Plus className="size-4.5" />
          <span className="text-xs font-semibold">Más</span>
        </button>
      </div>

      {/* UI only en Etapa A — persistencia real de notas se conecta en Etapa B. */}
      <Sheet open={noteOpen} onOpenChange={setNoteOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl px-4 pb-6">
          <SheetHeader className="px-0 pt-2">
            <SheetTitle>Nueva nota</SheetTitle>
          </SheetHeader>
          <Textarea placeholder="Escribí una nota..." className="min-h-28 rounded-xl" />
          <Button className="h-11 rounded-xl" onClick={() => setNoteOpen(false)}>
            Guardar nota
          </Button>
        </SheetContent>
      </Sheet>
    </>
  );
}
