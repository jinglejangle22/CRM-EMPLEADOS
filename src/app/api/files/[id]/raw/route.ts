import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { resolveFileAccess } from "@/lib/files";
import { getSignedDownloadUrl } from "@/lib/storage";

/**
 * Sirve los bytes del archivo directamente desde nuestro dominio (en vez de
 * redirigir a la URL firmada de S3/R2). Se usa para el visor de PDF en el
 * navegador, que necesita poder hacer `fetch` del archivo sin problemas de
 * CORS contra el bucket.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const user = session?.user ? { id: session.user.id, role: session.user.role, companyIds: session.user.companyIds } : null;
  const { id } = await params;

  const result = await resolveFileAccess(id, user);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });

  const url = await getSignedDownloadUrl(result.file.key, result.file.bucket);
  const upstream = await fetch(url);
  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: "No se pudo descargar el archivo." }, { status: 502 });
  }

  return new NextResponse(upstream.body, {
    headers: {
      "Content-Type": result.file.mimeType,
      "Content-Disposition": `inline; filename="${encodeURIComponent(result.file.originalName)}"`,
      "Cache-Control": "private, max-age=60",
    },
  });
}
