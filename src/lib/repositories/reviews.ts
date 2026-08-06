import { createClient } from "@/lib/supabase/server";
import { toEmbeddedCreator } from "@/lib/repositories/reading-orders";
import type { Database } from "@/types/database.types";
import type { CollectedEditionReview, Publisher, UserProfile } from "@/types/domain";

type ReviewRow = Database["public"]["Tables"]["reviews"]["Row"];

export interface ReviewWithAuthor {
  review: CollectedEditionReview;
  author: UserProfile;
}

function toReview(row: ReviewRow): CollectedEditionReview {
  return {
    id: row.id,
    authorId: row.author_id,
    editionTitle: row.edition_title,
    publisher: row.publisher as Publisher,
    coverImageUrl: row.cover_image_url,
    overallRating: row.overall_rating,
    reviewText: row.review_text,
    bindingRating: row.binding_rating ?? undefined,
    paperQualityRating: row.paper_quality_rating ?? undefined,
    mappingRating: row.mapping_rating ?? undefined,
    extrasRating: row.extras_rating ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getRecentReviews(limit = 6): Promise<ReviewWithAuthor[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reviews")
    .select("*, author:profiles(*)")
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []).flatMap((row) =>
    row.author
      ? [{ review: toReview(row), author: toEmbeddedCreator(row.author) }]
      : []
  );
}

export async function getReviewsByUserId(
  userId: string
): Promise<ReviewWithAuthor[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reviews")
    .select("*, author:profiles(*)")
    .eq("author_id", userId)
    .order("created_at", { ascending: false });

  return (data ?? []).flatMap((row) =>
    row.author
      ? [{ review: toReview(row), author: toEmbeddedCreator(row.author) }]
      : []
  );
}
