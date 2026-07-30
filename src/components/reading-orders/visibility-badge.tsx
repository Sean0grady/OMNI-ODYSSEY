import { Globe2, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ReadingOrderVisibility } from "@/types/domain";

export function VisibilityBadge({
  visibility,
}: {
  visibility: ReadingOrderVisibility;
}) {
  const isPublic = visibility === "public";
  const Icon = isPublic ? Globe2 : Lock;

  return (
    <Badge variant={isPublic ? "outline" : "secondary"}>
      <Icon aria-hidden="true" data-icon="inline-start" />
      {isPublic ? "Public" : "Private"}
    </Badge>
  );
}
