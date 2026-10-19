import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { MAX_PRODUCT_IMAGES, MAX_UPLOAD_BYTES, saveUpload } from "@/lib/uploads";

export async function POST(request: Request) {
  if (!isAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const files = (await request.formData())
    .getAll("files")
    .filter((entry): entry is File => entry instanceof File);

  if (files.length === 0) {
    return NextResponse.json({ error: "Choose at least one photo" }, { status: 400 });
  }
  if (files.length > MAX_PRODUCT_IMAGES) {
    return NextResponse.json(
      { error: `Upload at most ${MAX_PRODUCT_IMAGES} photos at a time` },
      { status: 400 },
    );
  }
  const tooBig = files.find((file) => file.size > MAX_UPLOAD_BYTES);
  if (tooBig) {
    return NextResponse.json(
      { error: `${tooBig.name} is larger than ${MAX_UPLOAD_BYTES / 1024 / 1024} MB` },
      { status: 400 },
    );
  }

  const urls: string[] = [];
  for (const file of files) {
    const url = await saveUpload(Buffer.from(await file.arrayBuffer()));
    if (!url) {
      return NextResponse.json(
        { error: `${file.name} is not a JPG, PNG, GIF or WebP image`, urls },
        { status: 400 },
      );
    }
    urls.push(url);
  }
  return NextResponse.json({ urls }, { status: 201 });
}
