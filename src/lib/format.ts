import { differenceInYears, format, isToday, isYesterday } from "date-fns";
import { es } from "date-fns/locale";

export function formatAge(birthDate?: string): number | undefined {
  if (!birthDate) return undefined;
  return differenceInYears(new Date(), new Date(birthDate));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(
    value
  );
}

export function formatDayLabel(iso: string): string {
  const date = new Date(iso);
  if (isToday(date)) return "HOY";
  if (isYesterday(date)) return "AYER";
  return format(date, "d 'de' MMM", { locale: es }).toUpperCase();
}

export function formatTime(iso: string): string {
  return format(new Date(iso), "HH:mm");
}

export function formatDateShort(iso: string): string {
  return format(new Date(iso), "dd/MM/yyyy");
}

export function formatDateTimeLong(iso: string): string {
  return format(new Date(iso), "d 'de' MMMM, HH:mm", { locale: es });
}

export function relativeDayLabel(iso: string): string {
  const date = new Date(iso);
  if (isToday(date)) return `Hoy ${format(date, "HH:mm")}`;
  if (isYesterday(date)) return `Ayer ${format(date, "HH:mm")}`;
  return format(date, "d MMM, HH:mm", { locale: es });
}

export function initials(firstName: string, lastName: string): string {
  return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
}
