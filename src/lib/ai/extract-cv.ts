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
    phone: {
      type: "string",
      description:
        "Teléfono de contacto, con código de área si figura. Puede aparecer como 'Tel', 'Cel', 'Celular', 'WhatsApp', junto a un ícono de teléfono, o en el encabezado/pie de página junto al email.",
    },
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
    birthDate: {
      type: "string",
      description:
        "Fecha de nacimiento en formato YYYY-MM-DD. Puede figurar como 'Fecha de nacimiento', 'Nacimiento', 'Nació el', junto al DNI, o como edad (ej. '25 años'), en cuyo caso se calcula el año aproximado de nacimiento y se devuelve como 1 de enero de ese año.",
    },
  },
} as const;

function buildPrompt(): string {
  const currentYear = new Date().getFullYear();
  return `Sos un asistente que extrae datos de un CV (currículum) para cargarlo en un CRM de RRHH.
Analizá TODO el archivo con atención: encabezado, pie de página, datos de contacto y cualquier sección con datos personales, no solo el cuerpo principal del texto.
Buscá especialmente el teléfono y la fecha de nacimiento/edad, que suelen estar en el encabezado junto al nombre y el email, y a veces son fáciles de pasar por alto.
El año actual es ${currentYear}. Si el CV menciona la edad de la persona pero no una fecha de nacimiento exacta, calculá el año de nacimiento aproximado (año actual menos la edad) y devolvé "${currentYear}-01-01" con ese año como birthDate.
No inventes datos que no estén en el CV de ninguna forma (ni siquiera como edad): si un campo no aparece, omitilo del JSON.
Los nombres propios y direcciones deben respetar mayúsculas/minúsculas naturales del español.
El teléfono debe conservarse tal como figura (con o sin código de país).`;
}

export class CvExtractionError extends Error {}

function getApiKey(): string {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new CvExtractionError("GEMINI_API_KEY no está configurada.");
  return key;
}

const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1500;
// Gemini a veces se queda "colgado" sin responder ni fallar: cortamos la conexión
// nosotros mismos para no dejar al usuario esperando indefinidamente.
const CALL_TIMEOUT_MS = 45000;
// Códigos que indican una falla transitoria del lado de Gemini (sobrecarga/timeout),
// no un problema con el archivo o la request: vale la pena reintentar.
const RETRYABLE_STATUS = new Set([429, 500, 503, 504]);

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callGemini(apiKey: string, mimeType: string, base64: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CALL_TIMEOUT_MS);
  try {
    return await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: buildPrompt() }, { inlineData: { mimeType, data: base64 } }],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: RESPONSE_SCHEMA,
          // Sin esto, el modelo "piensa" antes de responder (miles de tokens
          // internos) y la extracción puede tardar 20-40s o más. Para esta
          // tarea (extracción estructurada simple) no aporta nada y solo suma
          // latencia, así que lo desactivamos.
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
    });
  } finally {
    clearTimeout(timeout);
  }
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
  let timedOut = false;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      res = await callGemini(apiKey, mimeType, base64);
      timedOut = false;
    } catch (err) {
      timedOut = err instanceof Error && err.name === "AbortError";
      if (!timedOut || attempt === MAX_ATTEMPTS) {
        throw new CvExtractionError(
          timedOut
            ? "El servicio de IA tardó demasiado en responder. Probá de nuevo."
            : "No se pudo conectar con el servicio de IA."
        );
      }
      await sleep(RETRY_DELAY_MS * attempt);
      continue;
    }
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
