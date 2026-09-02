import { randomUUID } from "crypto";
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getS3Client, getBucketName } from "@/lib/storage/s3";
import { prisma } from "@/lib/prisma";

const SIGNED_URL_TTL_SECONDS = 300;

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-100);
}

function buildKey(prefix: string, originalName: string): string {
  return `${prefix}/${randomUUID()}-${sanitizeFileName(originalName)}`;
}

/** `FormData.get(...)` siempre devuelve un `File` (posiblemente vacío) para un `<input type="file">` sin seleccionar. */
export function isUploadedFile(value: FormDataEntryValue | null): value is File {
  return value instanceof File && value.size > 0;
}

/**
 * Sube un archivo (recibido como `File` de un `<input type="file">` en un
 * Server Action) al bucket configurado y crea el `FileAsset` correspondiente
 * en la base de datos. La base de datos nunca guarda una URL pública, solo
 * `key` + metadata; el acceso real pasa siempre por `/api/files/[id]`.
 */
export async function saveUploadedFile(
  file: File,
  opts: { prefix: string; uploadedById: string; isSensitive?: boolean }
) {
  const bucket = getBucketName();
  const key = buildKey(opts.prefix, file.name);
  const buffer = Buffer.from(await file.arrayBuffer());

  await getS3Client().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: file.type || "application/octet-stream",
    })
  );

  return prisma.fileAsset.create({
    data: {
      key,
      bucket,
      originalName: file.name,
      mimeType: file.type || "application/octet-stream",
      sizeBytes: buffer.byteLength,
      isSensitive: opts.isSensitive ?? false,
      uploadedById: opts.uploadedById,
    },
  });
}

/** URL firmada de corta duración para leer un archivo privado del bucket. */
export async function getSignedDownloadUrl(key: string, bucket: string): Promise<string> {
  return getSignedUrl(getS3Client(), new GetObjectCommand({ Bucket: bucket, Key: key }), {
    expiresIn: SIGNED_URL_TTL_SECONDS,
  });
}

export async function deleteStoredFile(key: string, bucket: string): Promise<void> {
  await getS3Client().send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}
