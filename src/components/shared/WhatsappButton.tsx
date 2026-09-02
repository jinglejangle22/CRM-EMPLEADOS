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
        "inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-50 text-emerald-700 font-medium active:bg-emerald-100",
        compact ? "h-9 px-3 text-xs" : "h-11 px-4 text-sm",
        className
      )}
    >
      <MessageCircle className="size-4" />
      {label}
    </a>
  );
}
