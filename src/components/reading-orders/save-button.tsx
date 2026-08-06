"use client";

import { useState } from "react";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatCompactNumber } from "@/lib/utilities/number";
import { saveReadingOrderAction } from "@/features/reading-orders/actions/save-reading-order";
import { unsaveReadingOrderAction } from "@/features/reading-orders/actions/unsave-reading-order";

interface SaveButtonProps {
  readingOrderId: string;
  slug: string;
  initialSaved: boolean;
  initialSaveCount: number;
  className?: string;
}

export function SaveButton({
  readingOrderId,
  slug,
  initialSaved,
  initialSaveCount,
  className,
}: SaveButtonProps) {
  const [saved, setSaved] = useState(initialSaved);
  const [saveCount, setSaveCount] = useState(initialSaveCount);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setPending(true);
    setError(null);

    const result = saved
      ? await unsaveReadingOrderAction(readingOrderId, slug)
      : await saveReadingOrderAction(readingOrderId, slug);

    if (!result.success) {
      setError(result.error);
      setPending(false);
      return;
    }

    setSaved((current) => !current);
    setSaveCount((count) => (saved ? count - 1 : count + 1));
    setPending(false);
  }

  return (
    <div className="flex flex-col items-start gap-1.5">
      <Button
        type="button"
        variant={saved ? "secondary" : "outline"}
        aria-pressed={saved}
        onClick={handleClick}
        disabled={pending}
        className={cn("gap-1.5", className)}
      >
        <Bookmark
          className={cn("size-4", saved && "fill-current")}
          aria-hidden="true"
        />
        {saved ? "Saved" : "Save"}
        <span className="text-muted-foreground">
          {formatCompactNumber(saveCount)}
        </span>
      </Button>
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
