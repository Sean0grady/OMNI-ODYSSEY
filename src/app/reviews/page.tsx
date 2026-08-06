import type { Metadata } from "next";
import Link from "next/link";
import { PenLine } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { SectionHeading } from "@/components/shared/section-heading";
import { ReviewCard } from "@/components/reviews/review-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { getRecentReviews } from "@/lib/repositories";

export const metadata: Metadata = {
  title: "Reviews",
  description:
    "Collector reviews of collected editions, covering binding, paper quality, mapping, and extras.",
};

export default async function ReviewsPage() {
  const reviews = await getRecentReviews(50);

  return (
    <PageContainer as="section" className="space-y-8 py-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <SectionHeading
          headingLevel="h1"
          title="Collected-edition reviews"
          description="Notes from collectors on binding, paper quality, mapping inserts, and extras — not just the story inside."
        />
        <Button render={<Link href="/reviews/create" />}>
          <PenLine aria-hidden="true" />
          Write a review
        </Button>
      </div>
      {reviews.length === 0 ? (
        <EmptyState title="No reviews yet" />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map(({ review, author }) => (
            <ReviewCard key={review.id} review={review} author={author} />
          ))}
        </div>
      )}
    </PageContainer>
  );
}
