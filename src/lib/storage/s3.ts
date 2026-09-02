import { S3Client } from "@aws-sdk/client-s3";

/**
 * Cliente S3 compatible con cualquier proveedor S3-compatible (Cloudflare R2,
 * Supabase Storage, AWS S3, MinIO, etc.) configurado enteramente por variables
 * de entorno. `forcePathStyle` es requerido por la mayoría de estos proveedores
 * no-AWS.
 */
const globalForS3 = globalThis as unknown as { s3Client?: S3Client };

export function getS3Client(): S3Client {
  if (globalForS3.s3Client) return globalForS3.s3Client;

  const endpoint = process.env.S3_ENDPOINT;
  const accessKeyId = process.env.S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;

  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "Storage no configurado: faltan S3_ENDPOINT / S3_ACCESS_KEY_ID / S3_SECRET_ACCESS_KEY en las variables de entorno."
    );
  }

  const client = new S3Client({
    endpoint,
    region: process.env.S3_REGION || "auto",
    forcePathStyle: true,
    credentials: { accessKeyId, secretAccessKey },
  });

  if (process.env.NODE_ENV !== "production") globalForS3.s3Client = client;
  return client;
}

export function getBucketName(): string {
  const bucket = process.env.S3_BUCKET;
  if (!bucket) throw new Error("Storage no configurado: falta S3_BUCKET en las variables de entorno.");
  return bucket;
}
