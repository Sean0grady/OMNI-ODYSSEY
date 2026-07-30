import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CreatorSummary } from "@/components/profiles/creator-summary";
import { PublisherBadge } from "@/components/reading-orders/publisher-badge";
import { ReadingOrderCover } from "@/components/reading-orders/reading-order-cover";
import { RatingDisplay } from "@/components/reviews/rating-display";
import { truncateText } from "@/lib/utilities/text";
import type { CollectedEditionReview, UserProfile } from "@/types/domain";

const SUB_RATING_LABELS = {
  bindingRating: "Binding",
  paperQualityRating: "Paper quality",
  mappingRating: "Mapping",
  extrasRating: "Extras",
} as const;

interface ReviewCardProps {
  review: CollectedEditionReview;
  author: UserProfile;
}

export function ReviewCard({ review, author }: ReviewCardProps) {
  const subRatings: { key: string; label: string; value: number }[] = (
    Object.keys(SUB_RATING_LABELS) as (keyof typeof SUB_RATING_LABELS)[]
  ).flatMap((key) => {
    const value = review[key];
    return typeof value === "number"
      ? [{ key, label: SUB_RATING_LABELS[key], value }]
      : [];
  });

  return (
    <Card>
      <CardHeader className="grid-cols-[auto_1fr] grid-rows-1 gap-3">
        <ReadingOrderCover
          title={review.editionTitle}
          seed={review.id}
          publisher={review.publisher}
          imageUrl={review.coverImageUrl || undefined}
          compact
          className="w-16 shrink-0"
        />
        <div className="min-w-0 space-y-1.5">
          <p className="font-heading leading-snug font-medium text-balance">
            {review.editionTitle}
          </p>
          <PublisherBadge publisher={review.publisher} />
          <RatingDisplay
            rating={review.overallRating}
            label="Overall rating"
            size="sm"
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          {truncateText(review.reviewText, 220)}
        </p>
        {subRatings.length > 0 ? (
          <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 border-t border-border pt-3">
            {subRatings.map((entry) => (
              <div
                key={entry.key}
                className="flex items-center justify-between gap-2"
              >
                <dt className="text-xs text-muted-foreground">
                  {entry.label}
                </dt>
                <dd>
                  <RatingDisplay
                    rating={entry.value}
                    label={entry.label}
                    size="sm"
                  />
                </dd>
              </div>
            ))}
          </dl>
        ) : null}
        <CreatorSummary user={author} size="sm" className="pt-1" />
      </CardContent>
    </Card>
  );
}
