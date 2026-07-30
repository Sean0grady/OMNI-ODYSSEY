import Link from "next/link";
import { CollectorAvatar } from "@/components/shared/collector-avatar";
import { cn } from "@/lib/utils";
import type { UserProfile } from "@/types/domain";

interface CreatorSummaryProps {
  user: UserProfile;
  size?: "sm" | "default";
  className?: string;
}

export function CreatorSummary({
  user,
  size = "default",
  className,
}: CreatorSummaryProps) {
  return (
    <Link
      href={`/users/${user.username}`}
      className={cn(
        "group inline-flex items-center gap-2 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        className
      )}
    >
      <CollectorAvatar
        displayName={user.displayName}
        avatarUrl={user.avatarUrl}
        size={size}
      />
      <span className="flex flex-col leading-tight">
        <span className="text-sm font-medium group-hover:underline">
          {user.displayName}
        </span>
        <span className="text-xs text-muted-foreground">
          @{user.username}
        </span>
      </span>
    </Link>
  );
}
