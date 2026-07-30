import { Badge } from "@/components/ui/badge";
import { READING_ORDER_CATEGORY_LABELS } from "@/lib/constants/catalog";
import type { ReadingOrderCategory } from "@/types/domain";

export function CategoryBadge({ category }: { category: ReadingOrderCategory }) {
  return <Badge variant="outline">{READING_ORDER_CATEGORY_LABELS[category]}</Badge>;
}
