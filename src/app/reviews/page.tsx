import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/page-container";
import { SectionHeading } from "@/components/shared/section-heading";
import { ReviewCard } from "@/components/reviews/review-card";
import { EmptyState } from "@/components/shared/empty-state";
import { getRecentReviews, getUserById } from "@/lib/repositories";

export const metadata: Metadata = {
  title: "Reviews",
  description:
    "Collector reviews of collected editions, covering binding, paper quality, mapping, and extras.",
};

export default function ReviewsPage() {
  const reviews = getRecentReviews(50);

  return (
    <PageContainer as="section" className="space-y-8 py-12">
      <SectionHeading
        headingLevel="h1"
        eyebrow="Reviews"
        title="Collected-edition reviews"
        description="Notes from collectors on binding, paper quality, mapping inserts, and extras — not just the story inside."
      />
      {reviews.length === 0 ? (
        <EmptyState title="No reviews yet" />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => {
            const author = getUserById(review.authorId);
            if (!author) {
              return null;
            }
            return <ReviewCard key={review.id} review={review} author={author} />;
          })}
        </div>
      )}
    </PageContainer>
  );
}
