"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

/**
 * Envuelve un valor sensible (sueldo, documentos, etc). Si el usuario no tiene
 * permiso (`canView = false`) se oculta directamente con un candado, sin dar
 * la opción de revelarlo. Si tiene permiso, se muestra enmascarado con un
 * toggle para revelarlo (evita exponerlo por sobre el hombro en el local).
 */
export function SensitiveField({
  value,
  canView,
  maskedLabel = "No disponible",
}: {
  value: string;
  canView: boolean;
  maskedLabel?: string;
}) {
  const [revealed, setRevealed] = useState(false);

  if (!canView) {
    return (
      <span className="inline-flex items-center gap-1.5 text-neutral-400">
        <Lock className="size-3.5" />
        {maskedLabel}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setRevealed((r) => !r)}
      className="inline-flex items-center gap-1.5 font-medium text-neutral-900"
    >
      {revealed ? value : "••••••••"}
      {revealed ? <EyeOff className="size-3.5 text-neutral-400" /> : <Eye className="size-3.5 text-neutral-400" />}
    </button>
  );
}
