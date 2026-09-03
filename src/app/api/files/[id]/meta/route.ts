import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { resolveFileAccess } from "@/lib/files";

/** Metadata de un archivo privado (mimeType, nombre) sin exponer la URL firmada. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const user = session?.user ? { id: session.user.id, role: session.user.role, companyIds: session.user.companyIds } : null;
  const { id } = await params;

  const result = await resolveFileAccess(id, user);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });

  return NextResponse.json({ mimeType: result.file.mimeType, originalName: result.file.originalName });
}
