/**
 * Extracción de datos de candidato a partir de un CV (imagen o PDF) usando
 * Gemini (Google AI Studio). Gemini soporta multimodal input (imágenes/PDF
 * en base64) y salida estructurada vía `responseSchema`, así que el modelo
 * devuelve directamente un JSON con los campos que nos interesan.
 *
 * Esto es una ayuda para precargar el formulario de "Nuevo candidato": el
 * usuario siempre revisa y confirma los datos antes de guardar, nunca se
 * persiste nada automáticamente a partir de esta extracción.
 */

const MODEL = "gemini-flash-latest";

export type ExtractedCandidateData = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  address?: string;
  zone?: string;
  position?: string;
  availability?: string;
  salaryExpectation?: string;
  experience?: string;
  birthDate?: string; // YYYY-MM-DD
};

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    firstName: { type: "string", description: "Nombre de pila de la persona" },
    lastName: { type: "string", description: "Apellido de la persona" },
    phone: { type: "string", description: "Teléfono de contacto, con código de área si figura" },
    email: { type: "string", description: "Email de contacto" },
    address: { type: "string", description: "Dirección de residencia si figura" },
    zone: { type: "string", description: "Barrio o zona de residencia si figura" },
    position: { type: "string", description: "Puesto o rol al que aplica / su título u ocupación principal" },
    availability: { type: "string", description: "Disponibilidad horaria si se menciona (ej: full time, mañana, fines de semana)" },
    salaryExpectation: { type: "string", description: "Pretensión salarial si se menciona" },
    experience: {
      type: "string",
      description: "Resumen breve (2-4 líneas) de la experiencia laboral relevante: empresas, puestos, tiempo",
    },
    birthDate: { type: "string", description: "Fecha de nacimiento en formato YYYY-MM-DD si figura" },
  },
} as const;

const PROMPT = `Sos un asistente que extrae datos de un CV (currículum) para cargarlo en un CRM de RRHH.
Analizá el archivo adjunto y devolvé únicamente los datos que puedas identificar con confianza.
No inventes datos que no estén en el CV: si un campo no aparece, omitilo del JSON.
Los nombres propios y direcciones deben respetar mayúsculas/minúsculas naturales del español.
El teléfono debe conservarse tal como figura (con o sin código de país).`;

export class CvExtractionError extends Error {}

function getApiKey(): string {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new CvExtractionError("GEMINI_API_KEY no está configurada.");
  return key;
}

const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1500;
// Códigos que indican una falla transitoria del lado de Gemini (sobrecarga/timeout),
// no un problema con el archivo o la request: vale la pena reintentar.
const RETRYABLE_STATUS = new Set([429, 500, 503, 504]);

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callGemini(apiKey: string, mimeType: string, base64: string) {
  return fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: PROMPT }, { inlineData: { mimeType, data: base64 } }],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
      },
    }),
  });
}

export async function extractCandidateDataFromCv(file: File): Promise<ExtractedCandidateData> {
  const apiKey = getApiKey();

  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  const mimeType = file.type || "application/octet-stream";

  const allowedMimeTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
  if (!allowedMimeTypes.includes(mimeType)) {
    throw new CvExtractionError("Formato de archivo no soportado para extracción automática. Usá PDF, JPG, PNG o WEBP.");
  }

  let res: Response | undefined;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    res = await callGemini(apiKey, mimeType, base64);
    if (res.ok || !RETRYABLE_STATUS.has(res.status) || attempt === MAX_ATTEMPTS) break;
    await sleep(RETRY_DELAY_MS * attempt);
  }

  if (!res) throw new CvExtractionError("No se pudo conectar con el servicio de IA.");

  if (!res.ok) {
    if (RETRYABLE_STATUS.has(res.status)) {
      throw new CvExtractionError("El servicio de IA está saturado en este momento. Probá de nuevo en unos segundos.");
    }
    const body = await res.text().catch(() => "");
    throw new CvExtractionError(`Error al procesar el CV (${res.status}): ${body.slice(0, 300)}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof text !== "string") {
    throw new CvExtractionError("La IA no devolvió datos utilizables para este CV.");
  }

  try {
    return JSON.parse(text) as ExtractedCandidateData;
  } catch {
    throw new CvExtractionError("No se pudo interpretar la respuesta de la IA.");
  }
}
