"use client";

import { useActionState } from "react";
import { updateCandidateAction } from "@/lib/actions/candidates";
import type { ActionState } from "@/lib/actions/candidates";
import { useAppState } from "@/lib/app-state";
import { CANDIDATE_SOURCE_LABELS } from "@/lib/labels";
import { toDateInputValue } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormSelect } from "@/components/shared/FormSelect";

const initialState: ActionState = undefined;

type CandidateInitialData = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  companyId: string;
  position: string;
  source: string;
  zone?: string;
  address?: string;
  availability?: string;
  salaryExpectation?: string;
  experience?: string;
  birthDate?: string;
};

export function EditCandidateForm({ candidate }: { candidate: CandidateInitialData }) {
  const { visibleCompanies } = useAppState();
  const [state, formAction, pending] = useActionState(updateCandidateAction, initialState);

  return (
    <div className="flex flex-col gap-4 px-4 pb-8 pt-4">
      <h1 className="text-lg font-semibold text-neutral-900">Editar candidato</h1>

      <form action={formAction} encType="multipart/form-data" className="flex flex-col gap-4">
        <input type="hidden" name="candidateId" value={candidate.id} />

        <div className="grid grid-cols-2 gap-3">
          <Field label="Nombre" name="firstName" defaultValue={candidate.firstName} required />
          <Field label="Apellido" name="lastName" defaultValue={candidate.lastName} required />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="photo">Foto (opcional, reemplaza la actual)</Label>
            <Input id="photo" name="photo" type="file" accept="image/*" className="h-12 rounded-xl text-base" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cv">CV (opcional, reemplaza el actual)</Label>
            <Input id="cv" name="cv" type="file" accept=".pdf,.doc,.docx,image/*" className="h-12 rounded-xl text-base" />
          </div>
        </div>

        <Field label="Teléfono" name="phone" type="tel" defaultValue={candidate.phone} required />
        <Field label="Email" name="email" type="email" defaultValue={candidate.email} />

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="companyId">Empresa</Label>
          <FormSelect id="companyId" name="companyId" required defaultValue={candidate.companyId}>
            {visibleCompanies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.shortName}
              </option>
            ))}
          </FormSelect>
        </div>

        <Field label="Puesto" name="position" defaultValue={candidate.position} required />

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="source">Origen</Label>
          <FormSelect id="source" name="source" required defaultValue={candidate.source}>
            {Object.entries(CANDIDATE_SOURCE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </FormSelect>
        </div>

        <Field label="Zona" name="zone" defaultValue={candidate.zone} />
        <Field label="Dirección" name="address" defaultValue={candidate.address} />
        <Field label="Disponibilidad" name="availability" defaultValue={candidate.availability} />
        <Field label="Pretensión salarial" name="salaryExpectation" defaultValue={candidate.salaryExpectation} />
        <Field label="Experiencia" name="experience" defaultValue={candidate.experience} />
        <Field
          label="Fecha de nacimiento"
          name="birthDate"
          type="date"
          defaultValue={candidate.birthDate ? toDateInputValue(candidate.birthDate) : undefined}
        />

        {state?.error && <p className="text-sm text-rose-600">{state.error}</p>}

        <Button type="submit" disabled={pending} className="mt-2 h-12 rounded-xl text-base">
          {pending ? "Guardando..." : "Guardar cambios"}
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
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type={type} required={required} defaultValue={defaultValue} className="h-12 rounded-xl text-base" />
    </div>
  );
}
