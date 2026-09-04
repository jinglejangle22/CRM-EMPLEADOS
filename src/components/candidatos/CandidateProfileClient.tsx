"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/lib/app-state";
import type { Candidate, TimelineEvent } from "@/types";
import { candidateStageMeta } from "@/components/shared/StatusBadge";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { QuickActionsRow } from "@/components/profile/QuickActionsRow";
import { NextEventBanner } from "@/components/profile/NextEventBanner";
import { InfoList } from "@/components/profile/InfoList";
import { ProfileActionSheet } from "@/components/profile/ProfileActionSheet";
import { RegisterInteractionDialog } from "@/components/profile/RegisterInteractionDialog";
import { ScheduleFollowupDialog } from "@/components/profile/ScheduleFollowupDialog";
import { ChangeStageDialog } from "@/components/candidatos/ChangeStageDialog";
import { Timeline } from "@/components/timeline/Timeline";
import { CvViewerDialog } from "@/components/shared/CvViewerDialog";
import { formatDateShort } from "@/lib/format";

const SOURCE_LABELS: Record<string, string> = {
  INSTAGRAM: "Instagram",
  WHATSAPP: "WhatsApp",
  COMPUTRABAJO: "Computrabajo",
  INDEED: "Indeed",
  REFERIDO: "Referido",
  CARTEL: "Cartel",
  OTRO: "Otro",
};

const QUALIFICATION_LABELS: Record<string, string> = {
  RECOMENDADO: "Recomendado",
  EVALUAR: "A evaluar",
  NO_CONTRATAR: "No contratar",
};

export function CandidateProfileClient({
  candidate,
  nextInterview,
  nextFollowupNote,
  nextFollowupDueAt,
  timeline,
}: {
  candidate: Candidate;
  nextInterview: { position: string; startsAt: string } | null;
  nextFollowupNote: string | null;
  nextFollowupDueAt: string | null;
  timeline: TimelineEvent[];
}) {
  const { allCompanies } = useAppState();
  const router = useRouter();
  const company = allCompanies.find((c) => c.id === candidate.companyId);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [dialog, setDialog] = useState<"interaccion" | "seguimiento" | "etapa" | null>(null);
  const [cvOpen, setCvOpen] = useState(false);

  const stageMeta = candidateStageMeta[candidate.stage];

  function handleAction(key: string) {
    if (key === "entrevista") {
      router.push(`/agenda/nueva?candidateId=${candidate.id}`);
      return;
    }
    if (key === "editar") {
      router.push(`/candidatos/${candidate.id}/editar`);
      return;
    }
    setDialog(key as "interaccion" | "seguimiento" | "etapa");
  }

  return (
    <div className="flex flex-col gap-4 pb-6">
      <ProfileHeader
        firstName={candidate.firstName}
        lastName={candidate.lastName}
        position={candidate.position}
        companyId={candidate.companyId}
        birthDate={candidate.birthDate}
        statusLabel={stageMeta?.label ?? candidate.stage}
        statusTone={stageMeta?.tone ?? "neutral"}
        rating={candidate.rating}
        photoFileId={candidate.photoUrl}
        onViewCv={candidate.cvFileId ? () => setCvOpen(true) : undefined}
      />

      <QuickActionsRow
        phone={candidate.phone}
        whatsappMessage={`Hola ${candidate.firstName}! Te contactamos de ${company?.shortName} por tu postulación para ${candidate.position}.`}
        onOpenActions={() => setActionsOpen(true)}
      />

      {nextInterview && (
        <NextEventBanner kind="interview" label={`Próxima entrevista · ${nextInterview.position}`} when={nextInterview.startsAt} />
      )}
      {!nextInterview && nextFollowupNote && nextFollowupDueAt && (
        <NextEventBanner kind="followup" label={`Próximo seguimiento · ${nextFollowupNote}`} when={nextFollowupDueAt} />
      )}

      <div className="flex flex-col gap-3 px-4">
        <InfoList
          title="Datos de contacto"
          rows={[
            { label: "Teléfono", value: candidate.phone },
            { label: "Email", value: candidate.email },
            { label: "Zona", value: candidate.zone },
            { label: "Dirección", value: candidate.address },
          ]}
        />

        <InfoList
          title="Postulación"
          rows={[
            { label: "Puesto", value: candidate.position },
            { label: "Empresa", value: company?.shortName },
            { label: "Disponibilidad", value: candidate.availability },
            { label: "Pretensión salarial", value: candidate.salaryExpectation },
            { label: "Experiencia", value: candidate.experience },
            { label: "Origen", value: SOURCE_LABELS[candidate.source] },
            { label: "CV recibido", value: formatDateShort(candidate.cvReceivedDate) },
            {
              label: "Calificación",
              value: candidate.qualification ? QUALIFICATION_LABELS[candidate.qualification] : undefined,
            },
            { label: "Motivo", value: candidate.qualificationReason },
          ]}
        />

        {candidate.tagNames.length > 0 && (
          <section className="rounded-2xl bg-white p-3.5 ring-1 ring-neutral-100">
            <h2 className="px-1 pb-2 text-sm font-semibold text-neutral-900">Etiquetas</h2>
            <div className="flex flex-wrap gap-1.5 px-1">
              {candidate.tagNames.map((tag) => (
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

      <ProfileActionSheet open={actionsOpen} onOpenChange={setActionsOpen} type="candidate" onSelect={handleAction} />

      <RegisterInteractionDialog
        open={dialog === "interaccion"}
        onOpenChange={(open) => setDialog(open ? "interaccion" : null)}
        candidateId={candidate.id}
      />
      <ScheduleFollowupDialog
        open={dialog === "seguimiento"}
        onOpenChange={(open) => setDialog(open ? "seguimiento" : null)}
        candidateId={candidate.id}
      />
      <ChangeStageDialog
        open={dialog === "etapa"}
        onOpenChange={(open) => setDialog(open ? "etapa" : null)}
        candidateId={candidate.id}
        currentStage={candidate.stage}
      />
      <CvViewerDialog
        open={cvOpen}
        onOpenChange={setCvOpen}
        fileId={candidate.cvFileId}
        title={`CV de ${candidate.firstName} ${candidate.lastName}`}
      />
    </div>
  );
}
