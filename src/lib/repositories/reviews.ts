import { MOCK_REVIEWS, MOCK_USERS } from "@/lib/mock-data";
import type { CollectedEditionReview, UserProfile } from "@/types/domain";

/**
 * Reviews are still fully mock-data-backed this phase (out of scope for the
 * Supabase migration). Author resolution stays self-contained here, against
 * MOCK_USERS, rather than going through the real `getUserById` in
 * `users.ts` — real Supabase profile ids are auth UUIDs and will never match
 * a mock review's `authorId` (e.g. "user-marcus"), so mixing the two would
 * silently break every review's author display.
 */
export interface ReviewWithAuthor {
  review: CollectedEditionReview;
  author: UserProfile;
}

function byCreatedAtDesc(
  a: CollectedEditionReview,
  b: CollectedEditionReview
): number {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

function withAuthor(review: CollectedEditionReview): ReviewWithAuthor | null {
  const author = MOCK_USERS.find((user) => user.id === review.authorId);
  return author ? { review, author } : null;
}

export function getRecentReviews(limit = 6): ReviewWithAuthor[] {
  return [...MOCK_REVIEWS]
    .sort(byCreatedAtDesc)
    .slice(0, limit)
    .flatMap((review) => {
      const joined = withAuthor(review);
      return joined ? [joined] : [];
    });
}

export function getReviewsByUserId(userId: string): ReviewWithAuthor[] {
  return MOCK_REVIEWS.filter((review) => review.authorId === userId)
    .sort(byCreatedAtDesc)
    .flatMap((review) => {
      const joined = withAuthor(review);
      return joined ? [joined] : [];
    });
}
