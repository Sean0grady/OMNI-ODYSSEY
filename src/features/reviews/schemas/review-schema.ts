import { z } from "zod";
import { PUBLISHERS } from "@/lib/constants/catalog";

const optionalUrl = z
  .union([z.literal(""), z.string().trim().url("Enter a valid URL")])
  .optional();

const optionalRating = z
  .number()
  .int()
  .min(1, "Rate from 1 to 5")
  .max(5, "Rate from 1 to 5")
  .optional();

export const createReviewSchema = z.object({
  editionTitle: z
    .string()
    .trim()
    .min(3, "Edition title must be at least 3 characters")
    .max(160, "Keep the edition title under 160 characters"),
  publisher: z.enum(PUBLISHERS),
  coverImageUrl: optionalUrl,
  overallRating: z
    .number()
    .int()
    .min(1, "Rate from 1 to 5")
    .max(5, "Rate from 1 to 5"),
  reviewText: z
    .string()
    .trim()
    .min(10, "Review must be at least 10 characters")
    .max(2000, "Keep the review under 2000 characters"),
  bindingRating: optionalRating,
  paperQualityRating: optionalRating,
  mappingRating: optionalRating,
  extrasRating: optionalRating,
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
