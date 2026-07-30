import Link from "next/link";
import { Bookmark } from "lucide-react";
import { ReadingOrderCover } from "@/components/reading-orders/reading-order-cover";
import { MetadataStat } from "@/components/shared/metadata-stat";
import { formatCompactNumber } from "@/lib/utilities/number";
import { cn } from "@/lib/utils";
import type { ReadingOrder } from "@/types/domain";

interface CompactReadingOrderCardProps {
  readingOrder: ReadingOrder;
  className?: string;
}

export function CompactReadingOrderCard({
  readingOrder,
  className,
}: CompactReadingOrderCardProps) {
  return (
    <Link
      href={`/reading-orders/${readingOrder.slug}`}
      className={cn(
        "group flex items-center gap-3 rounded-md p-2 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        className
      )}
    >
      <ReadingOrderCover
        title={readingOrder.title}
        seed={readingOrder.id}
        publisher={readingOrder.publishers[0]}
        imageUrl={readingOrder.coverImageUrl || undefined}
        compact
        className="w-14 shrink-0"
      />
      <div className="min-w-0 space-y-1">
        <p className="truncate text-sm font-medium group-hover:underline">
          {readingOrder.title}
        </p>
        <p className="line-clamp-2 text-xs text-muted-foreground">
          {readingOrder.summary}
        </p>
        <MetadataStat
          icon={Bookmark}
          label={`${formatCompactNumber(readingOrder.saveCount)} saves`}
        />
      </div>
    </Link>
  );
}
