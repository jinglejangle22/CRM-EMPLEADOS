"use client";

import { MessageCircle } from "lucide-react";
import { buildWhatsappLink } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

export function WhatsappButton({
  phone,
  message,
  label = "WhatsApp",
  className,
  compact = false,
}: {
  phone: string;
  message?: string;
  label?: string;
  className?: string;
  compact?: boolean;
}) {
  return (
    <a
      href={buildWhatsappLink(phone, message)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 font-semibold text-emerald-700 active:bg-emerald-100",
        compact ? "h-11 px-3.5 text-sm" : "h-12 px-4 text-[15px]",
        className
      )}
    >
      <MessageCircle className="size-4.5" />
      {label}
    </a>
  );
}
