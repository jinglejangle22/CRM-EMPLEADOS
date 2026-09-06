"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Video, User, Pencil, ChevronDown } from "lucide-react";
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
  const [editingStatus, setEditingStatus] = useState(false);
  const [lastStatusState, setLastStatusState] = useState(statusState);
  const candidate = interview.candidate;
  const canEditStatus = canManageCandidates(permissionUser);

  if (statusState !== lastStatusState) {
    setLastStatusState(statusState);
    if (statusState?.success) setEditingStatus(false);
  }

  useEffect(() => {
    if (statusState?.success) {
      router.refresh();
    }
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
      className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-4 active:bg-neutral-50"
    >
      <div className="flex items-start gap-3">
        <div className="flex w-16 shrink-0 flex-col items-center rounded-xl bg-violet-50 py-2 text-violet-700">
          <span className="text-lg leading-none font-bold">{formatTime(interview.startsAt)}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[17px] font-semibold text-neutral-900">
            {candidate.firstName} {candidate.lastName}
          </p>
          <p className="mt-0.5 truncate text-sm text-neutral-600">
            {interview.position} · {company?.shortName}
          </p>
          <div className="mt-1.5 flex items-center gap-1.5 text-sm text-neutral-500">
            {interview.modality === "VIRTUAL" ? <Video className="size-4" /> : <MapPin className="size-4" />}
            <span className="truncate">
              {interview.modality === "VIRTUAL" ? "Virtual" : interview.address ?? "Presencial"}
            </span>
          </div>
          {interview.interviewerName && (
            <div className="mt-0.5 flex items-center gap-1.5 text-sm text-neutral-400">
              <User className="size-4" />
              <span className="truncate">{interview.interviewerName}</span>
            </div>
          )}
        </div>
      </div>

      {canEditStatus ? (
        <div onClick={(e) => e.stopPropagation()}>
          {!editingStatus ? (
            <button
              type="button"
              onClick={() => setEditingStatus(true)}
              className="inline-flex items-center gap-1"
            >
              {statusMeta && <StatusBadge label={statusMeta.label} tone={statusMeta.tone} />}
              <ChevronDown className="size-3.5 text-neutral-400" />
            </button>
          ) : (
            <form action={formAction} className="flex items-center gap-2">
              <input type="hidden" name="interviewId" value={interview.id} />
              <FormSelect
                name="status"
                autoFocus
                defaultValue={interview.status}
                className="h-11 flex-1 rounded-xl text-sm"
                onChange={(e) => e.currentTarget.form?.requestSubmit()}
                onBlur={() => setEditingStatus(false)}
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
      ) : (
        statusMeta && <StatusBadge label={statusMeta.label} tone={statusMeta.tone} />
      )}

      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
        <WhatsappButton phone={candidate.phone} message={message} label="Recordatorio" compact className="flex-1" />
        {canEditStatus && (
          <button
            type="button"
            onClick={() => router.push(`/agenda/${interview.id}/editar`)}
            className="flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-neutral-100 px-4 text-sm font-semibold text-neutral-700 active:bg-neutral-200"
            aria-label="Editar entrevista"
          >
            <Pencil className="size-4" />
            Editar
          </button>
        )}
      </div>
    </div>
  );
}
