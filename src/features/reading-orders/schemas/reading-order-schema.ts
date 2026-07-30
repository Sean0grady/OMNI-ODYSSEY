import { z } from "zod";
import { PUBLISHERS, READING_ORDER_CATEGORIES, READING_ORDER_ENTRY_TYPES } from "@/lib/constants/catalog";

const optionalUrl = z
  .union([z.literal(""), z.string().trim().url("Enter a valid URL")])
  .optional();

export const readingOrderEntryInputSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Entry title is required")
    .max(160, "Keep entry titles under 160 characters"),
  entryType: z.enum(READING_ORDER_ENTRY_TYPES),
  issueRange: z
    .string()
    .trim()
    .max(120, "Keep the issue range under 120 characters")
    .optional()
    .or(z.literal("")),
  notes: z
    .string()
    .trim()
    .max(600, "Keep notes under 600 characters")
    .optional()
    .or(z.literal("")),
  isOptional: z.boolean(),
});

export const createReadingOrderSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(120, "Title must be under 120 characters"),
  summary: z
    .string()
    .trim()
    .min(10, "Summary must be at least 10 characters")
    .max(240, "Keep the summary under 240 characters"),
  publishers: z
    .array(z.enum(PUBLISHERS))
    .min(1, "Select at least one publisher"),
  categories: z
    .array(z.enum(READING_ORDER_CATEGORIES))
    .min(1, "Select at least one category"),
  visibility: z.enum(["public", "private"]),
  coverImageUrl: optionalUrl,
  entries: z
    .array(readingOrderEntryInputSchema)
    .min(1, "Add at least one entry before submitting"),
});

export type CreateReadingOrderInput = z.infer<typeof createReadingOrderSchema>;
export type ReadingOrderEntryInput = z.infer<typeof readingOrderEntryInputSchema>;

export const emptyReadingOrderEntry: ReadingOrderEntryInput = {
  title: "",
  entryType: "collected-edition",
  issueRange: "",
  notes: "",
  isOptional: false,
};
