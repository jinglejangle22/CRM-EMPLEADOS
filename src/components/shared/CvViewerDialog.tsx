"use client";

import { useEffect, useState } from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { X, ExternalLink, Loader2 } from "lucide-react";
import { PdfViewer } from "@/components/shared/PdfViewer";

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
  const [meta, setMeta] = useState<{ fileId: string; mimeType: string } | null>(null);
  const [errorFileId, setErrorFileId] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !fileId) return;
    fetch(`/api/files/${fileId}/meta`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((json) => setMeta({ fileId, mimeType: json.mimeType }))
      .catch(() => setErrorFileId(fileId));
  }, [open, fileId]);

  if (!fileId) return null;
  const rawSrc = `/api/files/${fileId}/raw`;
  const openSrc = `/api/files/${fileId}`;
  const mimeType = meta?.fileId === fileId ? meta.mimeType : null;
  const loadError = errorFileId === fileId;
  const isPdf = mimeType === "application/pdf";
  const isImage = mimeType?.startsWith("image/");

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/60 duration-100 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <DialogPrimitive.Popup className="fixed inset-0 z-50 flex flex-col bg-neutral-900 outline-none duration-100 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0">
          <div className="flex items-center justify-between gap-2 border-b border-white/10 bg-neutral-900 px-4 py-3">
            <DialogPrimitive.Title className="truncate text-sm font-semibold text-white">{title}</DialogPrimitive.Title>
            <div className="flex shrink-0 items-center gap-1">
              <a
                href={openSrc}
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

          <div className="min-h-0 flex-1">
            {loadError && (
              <div className="flex h-full items-center justify-center px-6 text-center text-sm text-white/70">
                No se pudo cargar el archivo.
              </div>
            )}
            {!loadError && !mimeType && (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="size-6 animate-spin text-white/70" />
              </div>
            )}
            {!loadError && isPdf && <PdfViewer src={rawSrc} />}
            {!loadError && isImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={openSrc} alt={title} className="h-full w-full object-contain" />
            )}
            {!loadError && mimeType && !isPdf && !isImage && (
              <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-sm text-white/70">
                <p>No hay vista previa disponible para este tipo de archivo.</p>
                <a href={openSrc} target="_blank" rel="noreferrer" className="font-medium text-violet-400 underline">
                  Abrir / descargar
                </a>
              </div>
            )}
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
