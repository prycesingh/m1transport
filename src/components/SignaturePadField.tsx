"use client";

import { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Button } from "@/components/ui/button";
import { uploadFile } from "@/lib/upload-file";
import { toast } from "sonner";
import { Check, Loader2 } from "lucide-react";

interface Props {
  value?: string;
  onChange: (url: string | undefined) => void;
}

export const SignaturePadField = ({ value, onChange }: Props) => {
  const ref = useRef<SignatureCanvas>(null);
  const [saving, setSaving] = useState(false);

  const clear = () => {
    ref.current?.clear();
    onChange(undefined);
  };

  const save = async () => {
    if (!ref.current || ref.current.isEmpty()) {
      toast.error("Please draw your signature first");
      return;
    }
    setSaving(true);
    try {
      const dataUrl = ref.current.getCanvas().toDataURL("image/png");
      const blob = await (await fetch(dataUrl)).blob();
      const url = await uploadFile(blob, `signature-${crypto.randomUUID()}.png`);
      onChange(url);
      toast.success("Signature saved");
    } catch (error: any) {
      toast.error("Failed to save signature", {
        description: error.message || "Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="border-2 border-border rounded-md bg-white">
        <SignatureCanvas
          ref={ref}
          canvasProps={{
            className: "w-full h-40 rounded-md",
          }}
        />
      </div>
      <div className="flex gap-2 items-center">
        <Button type="button" variant="outline" size="sm" onClick={clear}>Clear</Button>
        <Button type="button" size="sm" onClick={save} disabled={saving}>
          {saving ? <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Saving</> : "Use This Signature"}
        </Button>
        {value && (
          <span className="text-sm text-success flex items-center gap-1">
            <Check className="h-4 w-4" /> Signature saved
          </span>
        )}
      </div>
    </div>
  );
};
