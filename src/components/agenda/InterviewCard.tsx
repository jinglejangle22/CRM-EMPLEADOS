"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Video, User, Pencil } from "lucide-react";
import type { Interview } from "@/types";
import { useAppState } from "@/lib/app-state";
import { StatusBadge, interviewStatusMeta } from "@/components/shared/StatusBadge";
import { WhatsappButton } from "@/components/shared/WhatsappButton";
import { formatTime, formatDateShort } from "@/lib/format";
import { interviewReminderMessage } from "@/lib/whatsapp";
import { updateInterviewStatusAction } from "@/lib/actions/interviews";
import type { ActionState } from "@/lib/actions/candidates";
import { INTERVIEW_STATUS_LABELS } from "@/lib/labels";
import { canManageCandidates } from "@/lib/permissions";
import { FormSelect } from "@/components/shared/FormSelect";

const initialState: ActionState = undefined;

export function InterviewCard({ interview }: { interview: Interview }) {
  const router = useRouter();
  const { allCompanies, permissionUser } = useAppState();
  const [statusState, formAction] = useActionState(updateInterviewStatusAction, initialState);
  const candidate = interview.candidate;

  useEffect(() => {
    if (statusState?.success) router.refresh();
  }, [statusState, router]);
  const company = allCompanies.find((c) => c.id === interview.companyId);
  const statusMeta = interviewStatusMeta[interview.status];

  const message = interviewReminderMessage({
    firstName: candidate.firstName,
    companyName: company?.shortName ?? "",
    dateLabel: formatDateShort(interview.startsAt),
    timeLabel: formatTime(interview.startsAt),
  });

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => router.push(`/candidatos/${candidate.id}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter") router.push(`/candidatos/${candidate.id}`);
      }}
      className="flex flex-col gap-2.5 rounded-2xl bg-white p-3.5 ring-1 ring-neutral-100 active:bg-neutral-50"
    >
      <div className="flex items-start gap-3">
        <div className="flex w-14 shrink-0 flex-col items-center rounded-xl bg-violet-50 py-1.5 text-violet-700">
          <span className="text-base font-semibold leading-none">{formatTime(interview.startsAt)}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-neutral-900">
            {candidate.firstName} {candidate.lastName}
          </p>
          <p className="truncate text-xs text-neutral-500">
            {interview.position} · {company?.shortName}
          </p>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-neutral-500">
            {interview.modality === "VIRTUAL" ? <Video className="size-3.5" /> : <MapPin className="size-3.5" />}
            <span className="truncate">
              {interview.modality === "VIRTUAL" ? "Virtual" : interview.address ?? "Presencial"}
            </span>
          </div>
          {interview.interviewerName && (
            <div className="mt-0.5 flex items-center gap-1.5 text-xs text-neutral-400">
              <User className="size-3.5" />
              <span className="truncate">{interview.interviewerName}</span>
            </div>
          )}
        </div>
        {statusMeta && <StatusBadge label={statusMeta.label} tone={statusMeta.tone} />}
      </div>

      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
        <WhatsappButton phone={candidate.phone} message={message} label="Recordatorio" compact className="flex-1" />
        {canManageCandidates(permissionUser) && (
          <button
            type="button"
            onClick={() => router.push(`/agenda/${interview.id}/editar`)}
            className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 active:bg-neutral-200"
            aria-label="Editar entrevista"
          >
            <Pencil className="size-4" />
          </button>
        )}
        {canManageCandidates(permissionUser) && (
          <form action={formAction} className="shrink-0">
            <input type="hidden" name="interviewId" value={interview.id} />
            <FormSelect
              name="status"
              defaultValue={interview.status}
              className="h-8 rounded-lg px-2 text-xs"
              onChange={(e) => e.currentTarget.form?.requestSubmit()}
            >
              {Object.entries(INTERVIEW_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </FormSelect>
          </form>
        )}
      </div>
    </div>
  );
}
