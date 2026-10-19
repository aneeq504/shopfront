import { readUpload } from "@/lib/uploads";

export async function GET(
  _request: Request,
  { params }: { params: { file: string } },
) {
  const upload = await readUpload(params.file);
  if (!upload) return new Response("Not found", { status: 404 });

  return new Response(new Uint8Array(upload.bytes), {
    headers: {
      "Content-Type": upload.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
