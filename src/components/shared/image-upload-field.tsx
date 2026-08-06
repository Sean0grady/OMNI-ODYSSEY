"use client";

import { useRef, useState } from "react";
import { ImageUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormFieldError } from "@/components/forms/form-field-error";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const EXTENSION_BY_MIME_TYPE: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

interface ImageUploadFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (url: string) => void;
  errorMessage?: string;
  className?: string;
}

export function ImageUploadField({
  id,
  label,
  value,
  onChange,
  errorMessage,
  className,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleFileSelected(file: File) {
    setUploadError(null);

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      setUploadError("Upload a PNG, JPEG, or WEBP image.");
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setUploadError("Images must be under 5MB.");
      return;
    }

    setUploading(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setUploadError("You must be signed in to upload an image.");
      setUploading(false);
      return;
    }

    const extension = EXTENSION_BY_MIME_TYPE[file.type];
    const path = `${user.id}/${crypto.randomUUID()}.${extension}`;

    const { error: uploadFailure } = await supabase.storage
      .from("images")
      .upload(path, file);

    if (uploadFailure) {
      setUploadError("Something went wrong uploading your image. Please try again.");
      setUploading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage.from("images").getPublicUrl(path);
    onChange(publicUrlData.publicUrl);
    setUploading(false);
  }

  return (
    <div className={cn("space-y-1.5", className)}>
      <span id={`${id}-label`} className="text-sm font-medium">
        {label}
      </span>
      <div className="flex items-center gap-3">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt=""
            className="size-16 rounded-md object-cover ring-1 ring-foreground/10"
          />
        ) : null}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              aria-describedby={`${id}-label`}
              onClick={() => inputRef.current?.click()}
            >
              <ImageUp aria-hidden="true" />
              {uploading ? "Uploading…" : value ? "Replace image" : "Upload image"}
            </Button>
            {value ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Remove image"
                onClick={() => onChange("")}
              >
                <X aria-hidden="true" />
              </Button>
            ) : null}
          </div>
          <input
            ref={inputRef}
            id={id}
            type="file"
            accept={ALLOWED_MIME_TYPES.join(",")}
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) {
                void handleFileSelected(file);
              }
            }}
          />
        </div>
      </div>
      <FormFieldError id={`${id}-error`} message={uploadError ?? errorMessage} />
    </div>
  );
}
