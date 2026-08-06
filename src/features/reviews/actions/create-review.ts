"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  createReviewSchema,
  type CreateReviewInput,
} from "@/features/reviews/schemas/review-schema";

export type CreateReviewResult =
  | { success: true }
  | { success: false; error: string };

export async function createReviewAction(
  input: CreateReviewInput
): Promise<CreateReviewResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "You must be signed in to do that." };
  }

  const parsed = createReviewSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Please fix the errors in the form and try again." };
  }

  const {
    editionTitle,
    publisher,
    coverImageUrl,
    overallRating,
    reviewText,
    bindingRating,
    paperQualityRating,
    mappingRating,
    extrasRating,
  } = parsed.data;

  const { error: insertError } = await supabase.from("reviews").insert({
    author_id: user.id,
    edition_title: editionTitle,
    publisher,
    cover_image_url: coverImageUrl || "",
    overall_rating: overallRating,
    review_text: reviewText,
    binding_rating: bindingRating ?? null,
    paper_quality_rating: paperQualityRating ?? null,
    mapping_rating: mappingRating ?? null,
    extras_rating: extrasRating ?? null,
  });

  if (insertError) {
    return {
      success: false,
      error: "Something went wrong posting your review. Please try again.",
    };
  }

  revalidatePath("/reviews");

  return { success: true };
}
