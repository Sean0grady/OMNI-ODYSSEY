import { Badge } from "@/components/ui/badge";
import { PUBLISHER_LABELS } from "@/lib/constants/catalog";
import type { Publisher } from "@/types/domain";

export function PublisherBadge({ publisher }: { publisher: Publisher }) {
  return <Badge variant="secondary">{PUBLISHER_LABELS[publisher]}</Badge>;
}
