"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { X, ExternalLink } from "lucide-react";

export function CvViewerDialog({
  open,
  onOpenChange,
  fileId,
  title = "CV",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileId?: string;
  title?: string;
}) {
  if (!fileId) return null;
  const src = `/api/files/${fileId}`;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/60 duration-100 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <DialogPrimitive.Popup className="fixed inset-0 z-50 flex flex-col bg-neutral-900 outline-none duration-100 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0">
          <div className="flex items-center justify-between gap-2 border-b border-white/10 bg-neutral-900 px-4 py-3">
            <DialogPrimitive.Title className="truncate text-sm font-semibold text-white">{title}</DialogPrimitive.Title>
            <div className="flex shrink-0 items-center gap-1">
              <a
                href={src}
                target="_blank"
                rel="noreferrer"
                className="flex size-9 items-center justify-center rounded-lg text-white/80 active:bg-white/10"
                aria-label="Abrir en una pestaña nueva"
              >
                <ExternalLink className="size-5" />
              </a>
              <DialogPrimitive.Close className="flex size-9 items-center justify-center rounded-lg text-white/80 active:bg-white/10">
                <X className="size-5" />
                <span className="sr-only">Cerrar</span>
              </DialogPrimitive.Close>
            </div>
          </div>
          <iframe src={src} title={title} className="w-full flex-1 border-0 bg-white" />
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
