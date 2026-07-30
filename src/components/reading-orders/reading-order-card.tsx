import Link from "next/link";
import { Bookmark, Layers } from "lucide-react";
import { ReadingOrderCover } from "@/components/reading-orders/reading-order-cover";
import { PublisherBadge } from "@/components/reading-orders/publisher-badge";
import { CategoryBadge } from "@/components/reading-orders/category-badge";
import { MetadataStat } from "@/components/shared/metadata-stat";
import { formatCompactNumber } from "@/lib/utilities/number";
import { cn } from "@/lib/utils";
import type { ReadingOrder, UserProfile } from "@/types/domain";

interface ReadingOrderCardProps {
  readingOrder: ReadingOrder;
  creator: UserProfile;
  className?: string;
}

export function ReadingOrderCard({
  readingOrder,
  creator,
  className,
}: ReadingOrderCardProps) {
  return (
    <Link
      href={`/reading-orders/${readingOrder.slug}`}
      className={cn(
        "group flex flex-col gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        className
      )}
    >
      <ReadingOrderCover
        title={readingOrder.title}
        seed={readingOrder.id}
        publisher={readingOrder.publishers[0]}
        imageUrl={readingOrder.coverImageUrl || undefined}
        className="transition-transform group-hover:scale-[1.01]"
      />
      <div className="space-y-1.5">
        <p className="font-heading leading-snug font-medium text-balance group-hover:underline">
          {readingOrder.title}
        </p>
        <p className="text-xs text-muted-foreground">
          by {creator.displayName}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {readingOrder.publishers.slice(0, 1).map((publisher) => (
            <PublisherBadge key={publisher} publisher={publisher} />
          ))}
          {readingOrder.categories.slice(0, 1).map((category) => (
            <CategoryBadge key={category} category={category} />
          ))}
        </div>
        <div className="flex items-center gap-3 pt-0.5">
          <MetadataStat
            icon={Bookmark}
            label={formatCompactNumber(readingOrder.saveCount)}
          />
          <MetadataStat
            icon={Layers}
            label={`${readingOrder.estimatedBookCount} books`}
          />
        </div>
      </div>
    </Link>
  );
}
