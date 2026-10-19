import { randomBytes } from "crypto";
import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import path from "path";

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
export const MAX_PRODUCT_IMAGES = 10;
export const UPLOAD_URL_PATTERN = /^\/uploads\/([a-f0-9]{32}\.(?:jpg|png|gif|webp))$/;
const FILE_NAME_PATTERN = /^[a-f0-9]{32}\.(jpg|png|gif|webp)$/;

export const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
};

function uploadDir(): string {
  return process.env.UPLOAD_DIR ?? path.join(process.cwd(), "uploads");
}

/** Detects the image type from the file's magic bytes rather than trusting the client. */
function imageExtension(bytes: Buffer): string | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpg";
  if (bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return "png";
  }
  if (bytes.subarray(0, 4).toString("ascii") === "GIF8") return "gif";
  if (
    bytes.subarray(0, 4).toString("ascii") === "RIFF" &&
    bytes.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "webp";
  }
  return null;
}

export async function saveUpload(bytes: Buffer): Promise<string | null> {
  const ext = imageExtension(bytes);
  if (!ext) return null;
  const name = `${randomBytes(16).toString("hex")}.${ext}`;
  await mkdir(uploadDir(), { recursive: true });
  await writeFile(path.join(uploadDir(), name), bytes);
  return `/uploads/${name}`;
}

export async function readUpload(
  name: string,
): Promise<{ bytes: Buffer; contentType: string } | null> {
  const match = FILE_NAME_PATTERN.exec(name);
  if (!match) return null;
  try {
    return {
      bytes: await readFile(path.join(uploadDir(), name)),
      contentType: CONTENT_TYPES[match[1]],
    };
  } catch {
    return null;
  }
}

/** Deletes the files behind local /uploads/ URLs; external URLs are ignored. */
export async function deleteUploads(urls: string[]): Promise<void> {
  await Promise.all(
    urls.map(async (url) => {
      const match = UPLOAD_URL_PATTERN.exec(url);
      if (!match) return;
      await unlink(path.join(uploadDir(), match[1])).catch(() => undefined);
    }),
  );
}
