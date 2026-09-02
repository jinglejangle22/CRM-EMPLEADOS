export function buildWhatsappLink(phone: string, message?: string): string {
  const digits = phone.replace(/[^\d]/g, "");
  const base = `https://wa.me/${digits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function interviewReminderMessage(params: {
  firstName: string;
  companyName: string;
  dateLabel: string;
  timeLabel: string;
}): string {
  const { firstName, companyName, dateLabel, timeLabel } = params;
  return `Hola ${firstName}, te recordamos tu entrevista para ${companyName} el ${dateLabel} a las ${timeLabel}. ¿Confirmás asistencia?`;
}
