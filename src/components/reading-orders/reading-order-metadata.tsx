import { Bookmark, Eye, Layers, RefreshCw } from "lucide-react";
import { PublisherBadge } from "@/components/reading-orders/publisher-badge";
import { CategoryBadge } from "@/components/reading-orders/category-badge";
import { VisibilityBadge } from "@/components/reading-orders/visibility-badge";
import { MetadataStat } from "@/components/shared/metadata-stat";
import { formatCompactNumber } from "@/lib/utilities/number";
import { formatRelativeTime } from "@/lib/utilities/date";
import type { ReadingOrder } from "@/types/domain";

interface ReadingOrderMetadataProps {
  readingOrder: ReadingOrder;
}

export function ReadingOrderMetadata({ readingOrder }: ReadingOrderMetadataProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-1.5">
        <VisibilityBadge visibility={readingOrder.visibility} />
        {readingOrder.publishers.map((publisher) => (
          <PublisherBadge key={publisher} publisher={publisher} />
        ))}
        {readingOrder.categories.map((category) => (
          <CategoryBadge key={category} category={category} />
        ))}
      </div>
      <dl className="grid grid-cols-3 gap-3 text-sm sm:max-w-sm">
        <div>
          <dt>
            <MetadataStat icon={Bookmark} label="Saves" />
          </dt>
          <dd className="font-medium tabular-nums">
            {formatCompactNumber(readingOrder.saveCount)}
          </dd>
        </div>
        <div>
          <dt>
            <MetadataStat icon={Layers} label="Books" />
          </dt>
          <dd className="font-medium tabular-nums">
            {readingOrder.estimatedBookCount}
          </dd>
        </div>
        <div>
          <dt>
            <MetadataStat icon={Eye} label="Views" />
          </dt>
          <dd className="font-medium tabular-nums">
            {formatCompactNumber(readingOrder.viewCount)}
          </dd>
        </div>
      </dl>
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <RefreshCw className="size-3.5" aria-hidden="true" />
        Updated {formatRelativeTime(readingOrder.updatedAt)}
      </p>
    </div>
  );
}
