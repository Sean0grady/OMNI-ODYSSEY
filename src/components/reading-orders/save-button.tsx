"use client";

import { useState } from "react";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatCompactNumber } from "@/lib/utilities/number";

interface SaveButtonProps {
  initialSaveCount: number;
  className?: string;
}

/**
 * Purely client-local optimistic UI. There is no server action or API route
 * in this phase, so this cannot durably persist a save — it demonstrates the
 * intended interaction only. See docs/architecture.md.
 */
export function SaveButton({ initialSaveCount, className }: SaveButtonProps) {
  const [saved, setSaved] = useState(false);
  const [saveCount, setSaveCount] = useState(initialSaveCount);

  function handleClick() {
    setSaved((current) => !current);
    setSaveCount((count) => (saved ? count - 1 : count + 1));
  }

  return (
    <Button
      type="button"
      variant={saved ? "secondary" : "outline"}
      aria-pressed={saved}
      onClick={handleClick}
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
  );
}
