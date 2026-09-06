"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, FileText } from "lucide-react";
import { initials, formatAge } from "@/lib/format";
import { useAppState } from "@/lib/app-state";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { RatingStars } from "@/components/shared/RatingStars";

export function ProfileHeader({
  firstName,
  lastName,
  position,
  companyId,
  birthDate,
  statusLabel,
  statusTone,
  rating,
  photoFileId,
  onViewCv,
}: {
  firstName: string;
  lastName: string;
  position: string;
  companyId: string;
  birthDate?: string;
  statusLabel: string;
  statusTone: "neutral" | "green" | "amber" | "red" | "blue" | "violet";
  rating?: number;
  photoFileId?: string;
  onViewCv?: () => void;
}) {
  const router = useRouter();
  const { allCompanies } = useAppState();
  const company = allCompanies.find((c) => c.id === companyId);
  const age = formatAge(birthDate);

  return (
    <div className="flex flex-col gap-3 border-b border-neutral-200 bg-white px-4 pb-4 pt-3">
      <button
        onClick={() => router.back()}
        aria-label="Volver"
        className="-ml-2 flex size-11 items-center justify-center rounded-full text-neutral-500 active:bg-neutral-100"
      >
        <ChevronLeft className="size-6" />
      </button>

      <div className="flex items-start gap-3.5">
        {photoFileId ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/api/files/${photoFileId}`}
            alt={`${firstName} ${lastName}`}
            className="size-16 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-violet-100 text-lg font-semibold text-violet-700">
            {initials(firstName, lastName)}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-bold text-neutral-900">
            {firstName} {lastName}
          </p>
          <p className="mt-0.5 truncate text-sm text-neutral-600">
            {position} {age ? `· ${age} años` : ""}
          </p>
          <div className="mt-1 flex items-center gap-1.5">
            <span className="size-1.5 shrink-0 rounded-full" style={{ backgroundColor: company?.colorHex }} />
            <span className="truncate text-sm text-neutral-500">{company?.shortName}</span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusBadge label={statusLabel} tone={statusTone} />
            {rating != null && <RatingStars rating={rating} />}
            {onViewCv && (
              <button
                type="button"
                onClick={onViewCv}
                className="flex min-h-7 shrink-0 items-center gap-1 rounded-full bg-violet-50 px-3 text-[13px] font-semibold text-violet-700 active:bg-violet-100"
              >
                <FileText className="size-3.5" />
                Ver CV
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
