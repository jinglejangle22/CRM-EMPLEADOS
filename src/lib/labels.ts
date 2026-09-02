// Etiquetas legibles para los enums de Prisma, compartidas entre formularios
// (UI) y server actions (para armar el título de los eventos de timeline).

export const CANDIDATE_SOURCE_LABELS: Record<string, string> = {
  INSTAGRAM: "Instagram",
  WHATSAPP: "WhatsApp",
  COMPUTRABAJO: "Computrabajo",
  INDEED: "Indeed",
  REFERIDO: "Referido",
  CARTEL: "Cartel",
  OTRO: "Otro",
};

export const CANDIDATE_STAGE_LABELS: Record<string, string> = {
  CV_RECIBIDO: "CV recibido",
  CV_REVISADO: "CV revisado",
  CONTACTADO: "Contactado",
  ENTREVISTA_AGENDADA: "Entrevista agendada",
  ENTREVISTADO: "Entrevistado",
  PRUEBA_LABORAL: "Prueba laboral",
  CONTRATADO: "Contratado",
  NO_SELECCIONADO: "No seleccionado",
};

export const EMPLOYEE_STATUS_LABELS: Record<string, string> = {
  EN_PRUEBA: "En prueba",
  ACTIVO: "Activo",
  LICENCIA: "Licencia",
  VACACIONES: "Vacaciones",
  SUSPENDIDO: "Suspendido",
  DESVINCULADO: "Desvinculado",
};

export const INTERACTION_TYPE_LABELS: Record<string, string> = {
  LLAMADA: "Llamada",
  WHATSAPP: "WhatsApp",
  EMAIL: "Email",
  PRESENCIAL: "Presencial",
  OTRO: "Otro",
};

export const INTERACTION_RESULT_LABELS: Record<string, string> = {
  CONTACTADO: "Contactado",
  NO_RESPONDIO: "No respondió",
  VOLVER_A_LLAMAR: "Volver a llamar",
  INTERESADO: "Interesado",
  NO_INTERESADO: "No interesado",
  PENDIENTE: "Pendiente",
};

export const INTERVIEW_MODALITY_LABELS: Record<string, string> = {
  PRESENCIAL: "Presencial",
  VIRTUAL: "Virtual",
};

export const INTERVIEW_STATUS_LABELS: Record<string, string> = {
  PENDIENTE: "Pendiente",
  CONFIRMADA: "Confirmada",
  REPROGRAMADA: "Reprogramada",
  CANCELADA: "Cancelada",
  SE_PRESENTO: "Se presentó",
  NO_SE_PRESENTO: "No se presentó",
};

export const INCIDENT_TYPE_LABELS: Record<string, string> = {
  LLEGADA_TARDE: "Llegada tarde",
  AUSENCIA: "Ausencia",
  AUSENCIA_SIN_AVISO: "Ausencia sin aviso",
  DIFERENCIA_CAJA: "Diferencia de caja",
  MALA_ATENCION: "Mala atención",
  INCUMPLIMIENTO_TAREAS: "Incumplimiento de tareas",
  USO_INDEBIDO_CELULAR: "Uso indebido del celular",
  INCUMPLIMIENTO_PROTOCOLO: "Incumplimiento de protocolo",
  OTRO: "Otro",
};

export const INCIDENT_LEVEL_LABELS: Record<string, string> = {
  OBSERVACION: "Observación",
  ADVERTENCIA: "Advertencia",
  LLAMADO_FORMAL: "Llamado formal",
};

export const RECOGNITION_TYPE_LABELS: Record<string, string> = {
  RECONOCIMIENTO: "Reconocimiento",
  BUEN_DESEMPENO: "Buen desempeño",
  FELICITACION_CLIENTE: "Felicitación de cliente",
  OBJETIVO_CUMPLIDO: "Objetivo cumplido",
  MEJORA_NOTABLE: "Mejora notable",
};

export const FOLLOWUP_STATUS_LABELS: Record<string, string> = {
  PENDIENTE: "Pendiente",
  COMPLETADO: "Completado",
  CANCELADO: "Cancelado",
};
