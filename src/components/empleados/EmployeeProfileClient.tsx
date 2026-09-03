"use client";

import { useState } from "react";
import type { Employee, TimelineEvent } from "@/types";
import { employeeStatusMeta } from "@/components/shared/StatusBadge";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { QuickActionsRow } from "@/components/profile/QuickActionsRow";
import { NextEventBanner } from "@/components/profile/NextEventBanner";
import { InfoList } from "@/components/profile/InfoList";
import { ProfileActionSheet } from "@/components/profile/ProfileActionSheet";
import { RegisterInteractionDialog } from "@/components/profile/RegisterInteractionDialog";
import { ScheduleFollowupDialog } from "@/components/profile/ScheduleFollowupDialog";
import { RegisterIncidentDialog } from "@/components/empleados/RegisterIncidentDialog";
import { RegisterRecognitionDialog } from "@/components/empleados/RegisterRecognitionDialog";
import { ChangeEmployeeStatusDialog } from "@/components/empleados/ChangeEmployeeStatusDialog";
import { Timeline } from "@/components/timeline/Timeline";
import { SensitiveField } from "@/components/shared/SensitiveField";
import { CvViewerDialog } from "@/components/shared/CvViewerDialog";
import { useAppState } from "@/lib/app-state";
import { canViewSalary } from "@/lib/permissions";
import { formatCurrency, formatDateShort } from "@/lib/format";

export function EmployeeProfileClient({
  employee,
  nextFollowupNote,
  nextFollowupDueAt,
  timeline,
  cvFileId,
}: {
  employee: Employee;
  nextFollowupNote: string | null;
  nextFollowupDueAt: string | null;
  timeline: TimelineEvent[];
  cvFileId?: string;
}) {
  const { permissionUser, allCompanies } = useAppState();
  const [actionsOpen, setActionsOpen] = useState(false);
  const [dialog, setDialog] = useState<"interaccion" | "seguimiento" | "incidencia" | "reconocimiento" | "estado" | null>(
    null
  );
  const [cvOpen, setCvOpen] = useState(false);

  const company = allCompanies.find((c) => c.id === employee.companyId);
  const statusMeta = employeeStatusMeta[employee.status];
  const salaryVisible = canViewSalary(permissionUser);

  return (
    <div className="flex flex-col gap-4 pb-6">
      <ProfileHeader
        firstName={employee.firstName}
        lastName={employee.lastName}
        position={employee.position}
        companyId={employee.companyId}
        birthDate={employee.birthDate}
        statusLabel={statusMeta?.label ?? employee.status}
        statusTone={statusMeta?.tone ?? "neutral"}
        photoFileId={employee.photoUrl}
        onViewCv={cvFileId ? () => setCvOpen(true) : undefined}
      />

      <QuickActionsRow phone={employee.whatsapp ?? employee.phone} onOpenActions={() => setActionsOpen(true)} />

      {nextFollowupNote && nextFollowupDueAt && (
        <NextEventBanner kind="followup" label={`Próximo seguimiento · ${nextFollowupNote}`} when={nextFollowupDueAt} />
      )}

      <div className="flex flex-col gap-3 px-4">
        <InfoList
          title="Datos de contacto"
          rows={[
            { label: "Teléfono", value: employee.phone },
            { label: "Email", value: employee.email },
            { label: "Dirección", value: employee.address },
            { label: "Contacto de emergencia", value: employee.emergencyContactName },
            { label: "Tel. emergencia", value: employee.emergencyContactPhone },
          ]}
        />

        <InfoList
          title="Legajo"
          rows={[
            { label: "Puesto", value: employee.position },
            { label: "Empresa", value: company?.shortName },
            { label: "Ingreso", value: formatDateShort(employee.hireDate) },
            { label: "Modalidad", value: employee.workday },
            { label: "Turno", value: employee.shift },
            { label: "Tipo de contrato", value: employee.contractType },
            { label: "DNI", value: employee.dni },
            { label: "CUIL", value: employee.cuil },
            {
              label: "Sueldo",
              value: employee.salary != null ? (
                <SensitiveField value={formatCurrency(employee.salary)} canView={salaryVisible} />
              ) : undefined,
            },
          ]}
        />

        {employee.tagNames.length > 0 && (
          <section className="rounded-2xl bg-white p-3.5 ring-1 ring-neutral-100">
            <h2 className="px-1 pb-2 text-sm font-semibold text-neutral-900">Etiquetas</h2>
            <div className="flex flex-wrap gap-1.5 px-1">
              {employee.tagNames.map((tag) => (
                <span key={tag} className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-600">
                  {tag}
                </span>
              ))}
            </div>
          </section>
        )}

        <section className="rounded-2xl bg-white p-3.5 ring-1 ring-neutral-100">
          <h2 className="px-1 pb-3 text-sm font-semibold text-neutral-900">Actividad</h2>
          <Timeline events={timeline} />
        </section>
      </div>

      <ProfileActionSheet
        open={actionsOpen}
        onOpenChange={setActionsOpen}
        type="employee"
        onSelect={(key) => setDialog(key as typeof dialog)}
      />

      <RegisterInteractionDialog
        open={dialog === "interaccion"}
        onOpenChange={(open) => setDialog(open ? "interaccion" : null)}
        employeeId={employee.id}
      />
      <ScheduleFollowupDialog
        open={dialog === "seguimiento"}
        onOpenChange={(open) => setDialog(open ? "seguimiento" : null)}
        employeeId={employee.id}
      />
      <RegisterIncidentDialog
        open={dialog === "incidencia"}
        onOpenChange={(open) => setDialog(open ? "incidencia" : null)}
        employeeId={employee.id}
      />
      <RegisterRecognitionDialog
        open={dialog === "reconocimiento"}
        onOpenChange={(open) => setDialog(open ? "reconocimiento" : null)}
        employeeId={employee.id}
      />
      <ChangeEmployeeStatusDialog
        open={dialog === "estado"}
        onOpenChange={(open) => setDialog(open ? "estado" : null)}
        employeeId={employee.id}
        currentStatus={employee.status}
      />
      <CvViewerDialog
        open={cvOpen}
        onOpenChange={setCvOpen}
        fileId={cvFileId}
        title={`CV de ${employee.firstName} ${employee.lastName}`}
      />
    </div>
  );
}
