"use client";

import { useState } from "react";
import { Check, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { followUserAction } from "@/features/profiles/actions/follow-user";
import { unfollowUserAction } from "@/features/profiles/actions/unfollow-user";

interface FollowButtonProps {
  targetUserId: string;
  targetUsername: string;
  initialFollowing: boolean;
  className?: string;
}

export function FollowButton({
  targetUserId,
  targetUsername,
  initialFollowing,
  className,
}: FollowButtonProps) {
  const [following, setFollowing] = useState(initialFollowing);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setPending(true);
    setError(null);

    const result = following
      ? await unfollowUserAction(targetUserId, targetUsername)
      : await followUserAction(targetUserId, targetUsername);

    if (!result.success) {
      setError(result.error);
      setPending(false);
      return;
    }

    setFollowing((current) => !current);
    setPending(false);
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <Button
        type="button"
        variant={following ? "secondary" : "default"}
        aria-pressed={following}
        onClick={handleClick}
        disabled={pending}
        className={cn("gap-1.5", className)}
      >
        {following ? (
          <Check className="size-4" aria-hidden="true" />
        ) : (
          <Plus className="size-4" aria-hidden="true" />
        )}
        {following ? "Following" : "Follow"}
      </Button>
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
