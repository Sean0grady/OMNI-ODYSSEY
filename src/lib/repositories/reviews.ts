import { MOCK_REVIEWS } from "@/lib/mock-data";
import type { CollectedEditionReview } from "@/types/domain";

function byCreatedAtDesc(
  a: CollectedEditionReview,
  b: CollectedEditionReview
): number {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

export function getRecentReviews(limit = 6): CollectedEditionReview[] {
  return [...MOCK_REVIEWS].sort(byCreatedAtDesc).slice(0, limit);
}

export function getReviewsByUserId(userId: string): CollectedEditionReview[] {
  return MOCK_REVIEWS.filter((review) => review.authorId === userId).sort(
    byCreatedAtDesc
  );
}
