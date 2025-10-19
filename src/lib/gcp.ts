import { Storage } from "@google-cloud/storage";

/**
 * createGcpStorage - returns storage client and the bucket
 * Expects env:
 *  - GCS_BUCKET
 *  - GCP_SERVICE_ACCOUNT_KEY (JSON string) OR GCS_CLIENT_EMAIL & GCS_PRIVATE_KEY & GCS_PROJECT_ID
 */
export function createGcpStorage(): {
  storage: Storage;
  bucket: ReturnType<Storage["bucket"]>;
  bucketName: string;
} {
  const bucketName = process.env.GCS_BUCKET!;
  if (!bucketName) throw new Error("GCS_BUCKET not set in env");

  let clientConfig: any = undefined;

  if (process.env.GCP_SERVICE_ACCOUNT_KEY) {
    try {
      clientConfig = JSON.parse(process.env.GCP_SERVICE_ACCOUNT_KEY as string);
    } catch (err) {
      // fallback to reading private key / client email if provided separately
      clientConfig = undefined;
    }
  }

  if (!clientConfig) {
    const clientEmail = process.env.GCS_CLIENT_EMAIL;
    const privateKey = process.env.GCS_PRIVATE_KEY;
    const projectId = process.env.GCS_PROJECT_ID;
    if (!clientEmail || !privateKey || !projectId) {
      // Let the default credentials be used (ADC) if nothing else provided
      clientConfig = undefined;
    } else {
      clientConfig = {
        projectId,
        client_email: clientEmail,
        private_key: privateKey.replace(/\\n/g, "\n"),
      };
    }
  }

  const storage = new Storage(
    clientConfig
      ? {
          credentials: clientConfig,
          projectId: clientConfig.project_id ?? process.env.GCS_PROJECT_ID,
        }
      : undefined
  );
  const bucket = storage.bucket(bucketName);

  return { storage, bucket, bucketName };
}

/**
 * getSignedUrl - returns a signed read URL for a private object.
 * expiresSeconds defaults to 60 seconds. Increase as needed.
 */
export async function getSignedUrl(
  objectPath: string,
  expiresSeconds = 60
): Promise<string> {
  const { storage, bucketName } = createGcpStorage();
  const file = storage.bucket(bucketName).file(objectPath);
  const [url] = await file.getSignedUrl({
    action: "read",
    expires: Date.now() + expiresSeconds * 1000,
  });
  return url;
}
