import Link from "next/link";
import { Bookmark } from "lucide-react";
import { ReadingOrderCover } from "@/components/reading-orders/reading-order-cover";
import { Slab, SlabLabel, SlabWell } from "@/components/slab/slab";
import { formatCompactNumber } from "@/lib/utilities/number";
import { CATEGORY_BAND } from "@/lib/constants/bands";
import { cn } from "@/lib/utils";
import type { ReadingOrder, UserProfile } from "@/types/domain";

interface ReadingOrderCardProps {
  readingOrder: ReadingOrder;
  creator: UserProfile;
  className?: string;
}

/**
 * A reading order as a certified record.
 *
 * The headline figure is the volume count, not a rating: reading orders carry
 * no grade of their own, and inventing one would put a number on the label
 * that no data stands behind. How many books a run costs you is the figure a
 * collector actually wants at a glance.
 */
export function ReadingOrderCard({
  readingOrder,
  creator,
  className,
}: ReadingOrderCardProps) {
  const bookCount = readingOrder.estimatedBookCount;

  return (
    <Link
      href={`/reading-orders/${readingOrder.slug}`}
      className={cn(
        "group block rounded-[3px] outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        className
      )}
    >
      <Slab className="transition-transform duration-200 ease-out group-hover:-translate-y-0.5">
        <SlabLabel
          band={CATEGORY_BAND[readingOrder.categories[0]] ?? "universal"}
          bandLabel={readingOrder.visibility === "private" ? "Private" : "Certified"}
          title={
            <p
              className="text-sm leading-[1.12] font-extrabold text-balance uppercase group-hover:underline"
              style={{ fontStretch: "86%", letterSpacing: "-0.01em" }}
            >
              {readingOrder.title}
            </p>
          }
          byline={
            <p className="label-type text-[0.52rem] text-muted-foreground">
              {creator.displayName}
            </p>
          }
          grade={{
            value: String(bookCount),
            designation: bookCount === 1 ? "Book" : "Books",
            srLabel: `${bookCount} ${bookCount === 1 ? "book" : "books"} in this reading order`,
          }}
        />

        <SlabWell className="px-3 pt-3 pb-2">
          <ReadingOrderCover
            title={readingOrder.title}
            seed={readingOrder.id}
            publisher={readingOrder.publishers[0]}
            imageUrl={readingOrder.coverImageUrl || undefined}
          />
          <p className="data-type mt-2 flex items-center gap-1 text-[0.68rem] text-muted-foreground">
            <Bookmark className="size-3" aria-hidden="true" />
            {formatCompactNumber(readingOrder.saveCount)}
            <span className="sr-only">saves</span>
          </p>
        </SlabWell>
      </Slab>
    </Link>
  );
}
