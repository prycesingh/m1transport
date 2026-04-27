export async function uploadFile(file: Blob, filename: string) {
  const formData = new FormData();
  formData.set("file", file, filename);

  const response = await fetch("/api/uploads", {
    method: "POST",
    body: formData,
  });

  const result = await response.json();

  if (!response.ok || !result.url) {
    throw new Error(result.error ?? "Upload failed.");
  }

  return result.url as string;
}