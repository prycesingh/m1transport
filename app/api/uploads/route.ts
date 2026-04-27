import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export const runtime = "nodejs";

function sanitizeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-");
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "A file is required." }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File must be under 10MB." }, { status: 400 });
    }

    const blob = await put(
      `incident-uploads/${Date.now()}-${sanitizeFilename(file.name || "upload")}`,
      file,
      {
        access: "public",
        addRandomSuffix: true,
      },
    );

    return NextResponse.json({ url: blob.url, pathname: blob.pathname });
  } catch (error) {
    console.error("upload error", error);
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}