"use client";

import { useState } from "react";
import { Check, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FollowButtonProps {
  className?: string;
}

/**
 * Purely client-local optimistic UI — there is no real follow relationship
 * or persistence in this phase. See docs/architecture.md.
 */
export function FollowButton({ className }: FollowButtonProps) {
  const [following, setFollowing] = useState(false);

  return (
    <Button
      type="button"
      variant={following ? "secondary" : "default"}
      aria-pressed={following}
      onClick={() => setFollowing((current) => !current)}
      className={cn("gap-1.5", className)}
    >
      {following ? (
        <Check className="size-4" aria-hidden="true" />
      ) : (
        <Plus className="size-4" aria-hidden="true" />
      )}
      {following ? "Following" : "Follow"}
    </Button>
  );
}
