import { createClient } from "@/utils/supabase/client";

const DEFAULT_BUCKET = "incident-uploads";

function sanitizeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-");
}

export async function uploadFile(file: Blob, filename: string) {
  const supabase = createClient();
  const bucket =
    process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || DEFAULT_BUCKET;

  if (!bucket) {
    throw new Error("Storage bucket is not configured.");
  }

  const safeFilename = sanitizeFilename(filename || "upload");
  const path = `incident-uploads/${Date.now()}-${crypto.randomUUID()}-${safeFilename}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      upsert: false,
      contentType: file.type || undefined,
      cacheControl: "3600",
    });

  if (uploadError) {
    throw new Error(uploadError.message || "Upload failed.");
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  if (!data.publicUrl) {
    throw new Error("Upload completed but public URL could not be generated.");
  }

  return data.publicUrl;
}
