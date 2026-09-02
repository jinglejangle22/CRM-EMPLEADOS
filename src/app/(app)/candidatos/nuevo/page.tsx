"use client";

import { useActionState } from "react";
import { useAppState } from "@/lib/app-state";
import { canManageCandidates } from "@/lib/permissions";
import { createCandidateAction, type ActionState } from "@/lib/actions/candidates";
import { CANDIDATE_SOURCE_LABELS } from "@/lib/labels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormSelect } from "@/components/shared/FormSelect";

const initialState: ActionState = undefined;

export default function NewCandidatePage() {
  const { permissionUser, visibleCompanies } = useAppState();
  const [state, formAction, pending] = useActionState(createCandidateAction, initialState);

  if (!canManageCandidates(permissionUser)) {
    return <p className="p-4 text-sm text-neutral-500">No tenés permisos para cargar candidatos.</p>;
  }

  return (
    <div className="flex flex-col gap-4 px-4 pb-8 pt-4">
      <h1 className="text-lg font-semibold text-neutral-900">Nuevo candidato</h1>

      <form action={formAction} encType="multipart/form-data" className="flex flex-col gap-4">
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
            <Input id="cv" name="cv" type="file" accept=".pdf,.doc,.docx" className="h-12 rounded-xl text-base" />
          </div>
        </div>

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
