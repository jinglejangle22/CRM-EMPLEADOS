"use client";

import { useActionState } from "react";
import { useAppState } from "@/lib/app-state";
import { canManageEmployees, canViewSalary } from "@/lib/permissions";
import { createEmployeeAction } from "@/lib/actions/employees";
import type { ActionState } from "@/lib/actions/candidates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormSelect } from "@/components/shared/FormSelect";

const initialState: ActionState = undefined;

export default function NewEmployeePage() {
  const { permissionUser, visibleCompanies } = useAppState();
  const [state, formAction, pending] = useActionState(createEmployeeAction, initialState);

  const canCreate = visibleCompanies.some((c) => canManageEmployees(permissionUser, c.id));
  if (!canCreate) {
    return <p className="p-4 text-sm text-neutral-500">No tenés permisos para dar de alta empleados.</p>;
  }

  return (
    <div className="flex flex-col gap-4 px-4 pb-8 pt-4">
      <h1 className="text-lg font-semibold text-neutral-900">Nuevo empleado</h1>

      <form action={formAction} encType="multipart/form-data" className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nombre" name="firstName" required />
          <Field label="Apellido" name="lastName" required />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="photo">Foto</Label>
          <Input id="photo" name="photo" type="file" accept="image/*" className="h-12 rounded-xl text-base" />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="companyId">Empresa</Label>
          <FormSelect id="companyId" name="companyId" required defaultValue="">
            <option value="" disabled>
              Elegí una empresa
            </option>
            {visibleCompanies
              .filter((c) => canManageEmployees(permissionUser, c.id))
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.shortName}
                </option>
              ))}
          </FormSelect>
        </div>

        <Field label="Puesto" name="position" required />
        <Field label="Fecha de ingreso" name="hireDate" type="date" required />

        <div className="grid grid-cols-2 gap-3">
          <Field label="Teléfono" name="phone" type="tel" />
          <Field label="WhatsApp" name="whatsapp" type="tel" />
        </div>
        <Field label="Email" name="email" type="email" />

        <div className="grid grid-cols-2 gap-3">
          <Field label="DNI" name="dni" />
          <Field label="CUIL" name="cuil" />
        </div>

        <Field label="Fecha de nacimiento" name="birthDate" type="date" />
        <Field label="Dirección" name="address" />

        <div className="grid grid-cols-2 gap-3">
          <Field label="Contacto de emergencia" name="emergencyContactName" />
          <Field label="Tel. emergencia" name="emergencyContactPhone" type="tel" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Modalidad" name="workday" />
          <Field label="Turno" name="shift" />
        </div>
        <Field label="Tipo de contrato" name="contractType" />

        {canViewSalary(permissionUser) && <Field label="Sueldo" name="salary" type="number" />}

        {state?.error && <p className="text-sm text-rose-600">{state.error}</p>}

        <Button type="submit" disabled={pending} className="mt-2 h-12 rounded-xl text-base">
          {pending ? "Guardando..." : "Guardar empleado"}
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
