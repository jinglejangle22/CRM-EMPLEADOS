"use client";

import { useActionState, useRef, useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { useAppState } from "@/lib/app-state";
import { canManageCandidates } from "@/lib/permissions";
import { createCandidateAction, type ActionState } from "@/lib/actions/candidates";
import { CANDIDATE_SOURCE_LABELS } from "@/lib/labels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormSelect } from "@/components/shared/FormSelect";
import type { ExtractedCandidateData } from "@/lib/ai/extract-cv";

const initialState: ActionState = undefined;

const EXTRACTABLE_FIELDS: (keyof ExtractedCandidateData)[] = [
  "firstName",
  "lastName",
  "phone",
  "email",
  "address",
  "zone",
  "position",
  "availability",
  "salaryExpectation",
  "experience",
  "birthDate",
];

export default function NewCandidatePage() {
  const { permissionUser, visibleCompanies } = useAppState();
  const [state, formAction, pending] = useActionState(createCandidateAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [autofilledFields, setAutofilledFields] = useState<string[]>([]);

  if (!canManageCandidates(permissionUser)) {
    return <p className="p-4 text-sm text-neutral-500">No tenés permisos para cargar candidatos.</p>;
  }

  async function handleCvChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setExtracting(true);
    setExtractError(null);
    setAutofilledFields([]);

    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/candidates/extract-cv", { method: "POST", body });
      const json = await res.json();

      if (!res.ok) {
        setExtractError(json.error ?? "No se pudo procesar el CV.");
        return;
      }

      const data = json.data as ExtractedCandidateData;
      const form = formRef.current;
      if (!form) return;

      const filled: string[] = [];
      for (const field of EXTRACTABLE_FIELDS) {
        const value = data[field];
        if (!value) continue;
        const input = form.elements.namedItem(field) as HTMLInputElement | null;
        if (input && !input.value) {
          input.value = value;
          filled.push(field);
        }
      }
      setAutofilledFields(filled);
    } catch {
      setExtractError("No se pudo conectar con el servicio de IA.");
    } finally {
      setExtracting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 px-4 pb-8 pt-4">
      <h1 className="text-lg font-semibold text-neutral-900">Nuevo candidato</h1>

      <form ref={formRef} action={formAction} encType="multipart/form-data" className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nombre" name="firstName" required />
          <Field label="Apellido" name="lastName" required />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="photo">Foto</Label>
            <Input id="photo" name="photo" type="file" accept="image/*" className="h-12 rounded-xl text-base" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cv">CV</Label>
            <Input
              id="cv"
              name="cv"
              type="file"
              accept=".pdf,.doc,.docx,image/*"
              className="h-12 rounded-xl text-base"
              onChange={handleCvChange}
            />
          </div>
        </div>

        {extracting && (
          <p className="flex items-center gap-2 text-sm text-violet-600">
            <Loader2 className="size-4 animate-spin" />
            Leyendo el CV y completando los datos...
          </p>
        )}
        {extractError && <p className="text-sm text-rose-600">{extractError}</p>}
        {autofilledFields.length > 0 && (
          <p className="flex items-center gap-2 text-sm text-emerald-600">
            <Sparkles className="size-4" />
            Se completaron {autofilledFields.length} campos automáticamente. Revisalos antes de guardar.
          </p>
        )}

        <Field label="Teléfono" name="phone" type="tel" required />
        <Field label="Email" name="email" type="email" />

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="companyId">Empresa</Label>
          <FormSelect id="companyId" name="companyId" required defaultValue="">
            <option value="" disabled>
              Elegí una empresa
            </option>
            {visibleCompanies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.shortName}
              </option>
            ))}
          </FormSelect>
        </div>

        <Field label="Puesto" name="position" required />

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="source">Origen</Label>
          <FormSelect id="source" name="source" required defaultValue="OTRO">
            {Object.entries(CANDIDATE_SOURCE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </FormSelect>
        </div>

        <Field label="Zona" name="zone" />
        <Field label="Dirección" name="address" />
        <Field label="Disponibilidad" name="availability" />
        <Field label="Pretensión salarial" name="salaryExpectation" />
        <Field label="Experiencia" name="experience" />
        <Field label="Fecha de nacimiento" name="birthDate" type="date" />

        {state?.error && <p className="text-sm text-rose-600">{state.error}</p>}

        <Button type="submit" disabled={pending} className="mt-2 h-12 rounded-xl text-base">
          {pending ? "Guardando..." : "Guardar candidato"}
        </Button>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type={type} required={required} className="h-12 rounded-xl text-base" />
    </div>
  );
}
