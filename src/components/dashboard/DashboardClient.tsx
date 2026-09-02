"use client";

import {
  FileText,
  PhoneOutgoing,
  CalendarClock,
  Clock,
  Briefcase,
  ClipboardCheck,
  FileWarning,
  UserX,
  AlarmClock,
  Cake,
  UserPlus,
  Handshake,
  CheckCircle2,
} from "lucide-react";
import { isToday } from "date-fns";
import { useAppState, ALL_COMPANIES_ID } from "@/lib/app-state";
import type { Candidate, Employee, Interview, Interaction, Followup } from "@/types";
import { StatList, type StatListItem } from "@/components/dashboard/StatList";
import { CompanyStatGrid } from "@/components/dashboard/CompanyStatGrid";

function byCompany<T extends { companyId: string }>(list: T[], activeCompanyId: string): T[] {
  if (activeCompanyId === ALL_COMPANIES_ID) return list;
  return list.filter((item) => item.companyId === activeCompanyId);
}

export function DashboardClient({
  candidates,
  employees,
  interviews,
  interactions,
  followups,
  lateArrivalsByCompanyId,
}: {
  candidates: Candidate[];
  employees: Employee[];
  interviews: Interview[];
  interactions: Interaction[];
  followups: Followup[];
  lateArrivalsByCompanyId: Record<string, number>;
}) {
  const { activeCompanyId, currentUser } = useAppState();

  const scopedCandidates = byCompany(candidates, activeCompanyId).filter((c) => !c.isArchived);
  const scopedEmployees = byCompany(employees, activeCompanyId);
  const scopedInterviews = byCompany(interviews, activeCompanyId);
  const scopedInteractions = interactions.filter((i) => {
    const candidate = candidates.find((c) => c.id === i.candidateId);
    return activeCompanyId === ALL_COMPANIES_ID || candidate?.companyId === activeCompanyId;
  });
  const scopedFollowups = followups.filter((f) => {
    const candidate = candidates.find((c) => c.id === f.candidateId);
    return activeCompanyId === ALL_COMPANIES_ID || candidate?.companyId === activeCompanyId;
  });
  const llegadasTarde =
    activeCompanyId === ALL_COMPANIES_ID
      ? Object.values(lateArrivalsByCompanyId).reduce((sum, n) => sum + n, 0)
      : lateArrivalsByCompanyId[activeCompanyId] ?? 0;

  // ---- PENDIENTES ----------------------------------------------------------
  const cvParaRevisar = scopedCandidates.filter((c) => c.stage === "CV_RECIBIDO").length;
  const paraVolverAContactar = scopedInteractions.filter(
    (i) => i.result === "VOLVER_A_LLAMAR" || i.result === "NO_RESPONDIO"
  ).length;
  const entrevistasSinConfirmar = scopedInterviews.filter((i) => i.status === "PENDIENTE").length;
  const seguimientosHoy = scopedFollowups.filter((f) => f.status === "PENDIENTE" && isToday(new Date(f.dueAt))).length;
  const enPeriodoPrueba =
    scopedCandidates.filter((c) => c.stage === "PRUEBA_LABORAL").length +
    scopedEmployees.filter((e) => e.status === "EN_PRUEBA").length;

  const pendientes: StatListItem[] = [
    { key: "cv", label: "CV para revisar", value: cvParaRevisar, icon: FileText, href: "/candidatos?stage=CV_RECIBIDO", tone: cvParaRevisar > 0 ? "amber" : "neutral" },
    { key: "contactar", label: "Personas para volver a contactar", value: paraVolverAContactar, icon: PhoneOutgoing, href: "/candidatos?filtro=recontactar", tone: paraVolverAContactar > 0 ? "amber" : "neutral" },
    { key: "sin-confirmar", label: "Entrevistas sin confirmar", value: entrevistasSinConfirmar, icon: CalendarClock, href: "/agenda", tone: entrevistasSinConfirmar > 0 ? "amber" : "neutral" },
    { key: "seguimientos-hoy", label: "Seguimientos para hoy", value: seguimientosHoy, icon: Clock, href: "/candidatos?filtro=seguimientos-hoy", tone: seguimientosHoy > 0 ? "red" : "neutral" },
    { key: "en-prueba", label: "Personas en período de prueba", value: enPeriodoPrueba, icon: Briefcase, href: "/empleados?status=EN_PRUEBA" },
    // Evaluaciones y documentación se conectan a datos reales en Fase 2/3.
    { key: "evaluaciones", label: "Evaluaciones pendientes", value: 2, icon: ClipboardCheck, href: "/empleados" },
    { key: "documentacion", label: "Documentación próxima a vencer", value: 3, icon: FileWarning, href: "/alertas" },
  ];

  // ---- HOY ------------------------------------------------------------------
  const entrevistasHoy = scopedInterviews.filter((i) => isToday(new Date(i.startsAt))).length;
  const cumpleanios = scopedEmployees.filter((e) => {
    if (!e.birthDate) return false;
    const bd = new Date(e.birthDate);
    const today = new Date();
    return bd.getDate() === today.getDate() && bd.getMonth() === today.getMonth();
  }).length;

  const hoy: StatListItem[] = [
    { key: "entrevistas-hoy", label: "Entrevistas de hoy", value: entrevistasHoy, icon: CalendarClock, href: "/agenda" },
    { key: "ausentes", label: "Personal ausente", value: 0, icon: UserX, href: "/empleados" },
    { key: "tarde", label: "Llegadas tarde registradas", value: llegadasTarde, icon: AlarmClock, href: "/empleados", tone: llegadasTarde > 0 ? "amber" : "neutral" },
    { key: "cumple", label: "Cumpleaños", value: cumpleanios, icon: Cake, href: "/empleados" },
  ];

  // ---- SELECCIÓN --------------------------------------------------------------
  const cvNuevos = scopedCandidates.filter((c) => c.stage === "CV_RECIBIDO").length;
  const contactadas = scopedCandidates.filter((c) => c.stage === "CONTACTADO").length;
  const entrevistasProgramadas = scopedInterviews.filter((i) => new Date(i.startsAt) > new Date()).length;
  const enPrueba = scopedCandidates.filter((c) => c.stage === "PRUEBA_LABORAL").length;
  const pendientesContratacion = scopedCandidates.filter((c) => c.stage === "ENTREVISTADO").length;

  const seleccion: StatListItem[] = [
    { key: "cv-nuevos", label: "CV nuevos", value: cvNuevos, icon: UserPlus, href: "/candidatos?stage=CV_RECIBIDO" },
    { key: "pendientes-revisar", label: "Pendientes de revisar", value: cvNuevos, icon: FileText, href: "/candidatos?stage=CV_RECIBIDO" },
    { key: "contactadas", label: "Personas contactadas", value: contactadas, icon: Handshake, href: "/candidatos?stage=CONTACTADO" },
    { key: "entrevistas-prog", label: "Entrevistas programadas", value: entrevistasProgramadas, icon: CalendarClock, href: "/agenda" },
    { key: "en-prueba-sel", label: "En prueba", value: enPrueba, icon: Briefcase, href: "/candidatos?stage=PRUEBA_LABORAL" },
    { key: "pend-contratacion", label: "Pendientes de contratación", value: pendientesContratacion, icon: CheckCircle2, href: "/candidatos?stage=ENTREVISTADO" },
  ];

  const totalActivos = scopedEmployees.filter((e) => e.status === "ACTIVO" || e.status === "EN_PRUEBA").length;
  const countByCompanyId = employees
    .filter((e) => e.status === "ACTIVO" || e.status === "EN_PRUEBA")
    .reduce<Record<string, number>>((acc, e) => {
      acc[e.companyId] = (acc[e.companyId] ?? 0) + 1;
      return acc;
    }, {});

  return (
    <div className="flex flex-col gap-4 px-4 pt-4">
      <div>
        <p className="text-sm text-neutral-500">Hola, {currentUser.name.split(" ")[0]} 👋</p>
        <h1 className="text-xl font-semibold text-neutral-900">Tu día de un vistazo</h1>
      </div>

      <StatList title="Pendientes" items={pendientes} />
      <CompanyStatGrid total={totalActivos} countByCompanyId={countByCompanyId} />
      <StatList title="Hoy" items={hoy} />
      <StatList title="Selección" items={seleccion} />
    </div>
  );
}
