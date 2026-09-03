"use client";

import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();

export function PdfViewer({ src }: { src: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex h-full w-full flex-col bg-neutral-800">
      <div ref={containerRef} className="flex-1 overflow-auto">
        <Document
          file={src}
          onLoadSuccess={({ numPages: n }) => {
            setNumPages(n);
            setPageNumber(1);
          }}
          loading={
            <div className="flex h-full items-center justify-center py-16 text-white/70">
              <Loader2 className="size-6 animate-spin" />
            </div>
          }
          error={
            <div className="flex h-full items-center justify-center py-16 text-sm text-white/70">
              No se pudo mostrar el PDF.
            </div>
          }
          className="flex justify-center"
        >
          {width > 0 && <Page pageNumber={pageNumber} width={width} />}
        </Document>
      </div>

      {numPages > 1 && (
        <div className="flex items-center justify-center gap-4 border-t border-white/10 bg-neutral-900 px-4 py-2.5">
          <button
            type="button"
            onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
            disabled={pageNumber <= 1}
            className="flex size-8 items-center justify-center rounded-lg text-white/80 disabled:opacity-30"
            aria-label="Página anterior"
          >
            <ChevronLeft className="size-5" />
          </button>
          <span className="text-sm text-white/80">
            {pageNumber} / {numPages}
          </span>
          <button
            type="button"
            onClick={() => setPageNumber((p) => Math.min(numPages, p + 1))}
            disabled={pageNumber >= numPages}
            className="flex size-8 items-center justify-center rounded-lg text-white/80 disabled:opacity-30"
            aria-label="Página siguiente"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      )}
    </div>
  );
}
