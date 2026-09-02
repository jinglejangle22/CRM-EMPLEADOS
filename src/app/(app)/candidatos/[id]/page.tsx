import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePermissionUser } from "@/lib/session";
import { canViewCompany } from "@/lib/permissions";
import { mapCandidate, mapTimelineEvent } from "@/lib/mappers";
import { pickNextFollowup } from "@/lib/derive";
import { CandidateProfileClient } from "@/components/candidatos/CandidateProfileClient";

export default async function CandidateProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requirePermissionUser();

  const candidateRow = await prisma.candidate.findUnique({
    where: { id },
    include: { tags: { include: { tag: true } } },
  });
  if (!candidateRow || !canViewCompany(user, candidateRow.companyId)) notFound();

  const [nextInterviewRow, followupRows, timelineRows] = await Promise.all([
    prisma.interview.findFirst({
      where: { candidateId: id, startsAt: { gt: new Date() } },
      orderBy: { startsAt: "asc" },
    }),
    prisma.followup.findMany({ where: { candidateId: id } }),
    prisma.timelineEvent.findMany({
      where: { candidateId: id },
      include: { createdBy: { select: { name: true } } },
      orderBy: { occurredAt: "desc" },
    }),
  ]);

  const candidate = mapCandidate(candidateRow, nextInterviewRow?.startsAt);
  const nextFollowup = pickNextFollowup(
    followupRows.map((f) => ({
      id: f.id,
      candidateId: f.candidateId ?? undefined,
      employeeId: f.employeeId ?? undefined,
      dueAt: f.dueAt.toISOString(),
      note: f.note,
      status: f.status,
    }))
  );
  const timeline = timelineRows.map(mapTimelineEvent);

  return (
    <CandidateProfileClient
      candidate={candidate}
      nextInterview={nextInterviewRow ? { position: nextInterviewRow.position, startsAt: nextInterviewRow.startsAt.toISOString() } : null}
      nextFollowupNote={nextFollowup?.note ?? null}
      nextFollowupDueAt={nextFollowup?.dueAt ?? null}
      timeline={timeline}
    />
  );
}
