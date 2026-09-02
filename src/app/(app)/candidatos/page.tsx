import { prisma } from "@/lib/prisma";
import { requirePermissionUser } from "@/lib/session";
import { companyScopeFilter } from "@/lib/scope";
import { mapCandidate, mapInteraction, mapFollowup } from "@/lib/mappers";
import { CandidatosPageClient } from "@/components/candidatos/CandidatosPageClient";

export default async function CandidatosPage() {
  const user = await requirePermissionUser();
  const companyId = companyScopeFilter(user);

  const candidateRows = await prisma.candidate.findMany({
    where: companyId ? { companyId } : undefined,
    include: { tags: { include: { tag: true } } },
    orderBy: { cvReceivedDate: "desc" },
  });
  const candidateIds = candidateRows.map((c) => c.id);

  const [upcomingInterviews, interactionRows, followupRows] = await Promise.all([
    prisma.interview.findMany({
      where: { candidateId: { in: candidateIds }, startsAt: { gt: new Date() } },
      orderBy: { startsAt: "asc" },
    }),
    prisma.interaction.findMany({
      where: { candidateId: { in: candidateIds } },
      include: { user: { select: { name: true } } },
      orderBy: { occurredAt: "desc" },
    }),
    prisma.followup.findMany({
      where: { candidateId: { in: candidateIds } },
    }),
  ]);

  const nextInterviewByCandidateId = new Map<string, Date>();
  for (const interview of upcomingInterviews) {
    if (!nextInterviewByCandidateId.has(interview.candidateId)) {
      nextInterviewByCandidateId.set(interview.candidateId, interview.startsAt);
    }
  }

  const candidates = candidateRows.map((row) => mapCandidate(row, nextInterviewByCandidateId.get(row.id)));
  const interactions = interactionRows.map(mapInteraction);
  const followups = followupRows.map(mapFollowup);

  return <CandidatosPageClient candidates={candidates} interactions={interactions} followups={followups} />;
}
