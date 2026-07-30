import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utilities/number";

interface CollectorAvatarProps {
  displayName: string;
  avatarUrl?: string;
  size?: "sm" | "default" | "lg";
  className?: string;
}

export function CollectorAvatar({
  displayName,
  avatarUrl,
  size = "default",
  className,
}: CollectorAvatarProps) {
  return (
    <Avatar size={size} className={className}>
      {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
      <AvatarFallback aria-hidden="true">
        {getInitials(displayName)}
      </AvatarFallback>
    </Avatar>
  );
}
