"use client";

import { Button } from "@/components/ui/button";
import { uploadFile } from "@/lib/upload-file";
import { Check, Loader2, Upload, X } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { toast } from "sonner";

function toErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === "string" && error.trim().length > 0) {
    return error;
  }

  if (error && typeof error === "object") {
    const maybeMessage = (error as { message?: unknown }).message;
    if (typeof maybeMessage === "string" && maybeMessage.trim().length > 0) {
      return maybeMessage;
    }
  }

  return "Please try again.";
}

interface Props {
  label: ReactNode;
  value?: string;
  onChange: (url: string | undefined) => void;
}

export const FileUploadField = ({ label, value, onChange }: Props) => {
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File must be under 10MB");
      return;
    }
    setUploading(true);
    try {
      const url = await uploadFile(file, file.name);
      onChange(url);
      toast.success("Uploaded");
    } catch (error) {
      console.error("File upload failed", error);
      toast.error("Upload failed", {
        description: toErrorMessage(error),
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      {value ? (
        <div className="flex items-center gap-2 p-2 border rounded-md bg-secondary/40">
          <Check className="h-4 w-4 text-success" />
          <a
            href={value}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-primary underline truncate flex-1"
          >
            View uploaded file
          </a>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => onChange(undefined)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <label className="flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-md p-4 cursor-pointer hover:border-primary hover:bg-secondary/40 transition-colors">
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />{" "}
              <span className="text-sm">Choose file</span>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
        </label>
      )}
    </div>
  );
};
