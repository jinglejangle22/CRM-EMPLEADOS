import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { canManageCandidates } from "@/lib/permissions";
import { extractCandidateDataFromCv, CvExtractionError } from "@/lib/ai/extract-cv";

const MAX_SIZE_BYTES = 15 * 1024 * 1024; // 15MB, límite generoso para foto/PDF de CV

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

  const user = { id: session.user.id, role: session.user.role, companyIds: session.user.companyIds };
  if (!canManageCandidates(user)) {
    return NextResponse.json({ error: "No tenés permisos para cargar candidatos." }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "No se recibió ningún archivo." }, { status: 400 });
  }
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "El archivo es demasiado grande (máx. 15MB)." }, { status: 400 });
  }

  try {
    const data = await extractCandidateDataFromCv(file);
    return NextResponse.json({ data });
  } catch (err) {
    const message = err instanceof CvExtractionError ? err.message : "No se pudo procesar el CV.";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
