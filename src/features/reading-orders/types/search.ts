import type { Publisher, ReadingOrderCategory } from "@/types/domain";

export type ReadingOrderSortOption =
  | "most-saved"
  | "recently-updated"
  | "newest"
  | "most-viewed";

export interface ReadingOrderSearchFilters {
  query?: string;
  publisher?: Publisher;
  category?: ReadingOrderCategory;
  sort?: ReadingOrderSortOption;
}

export const READING_ORDER_SORT_LABELS: Record<ReadingOrderSortOption, string> = {
  "most-saved": "Most saved",
  "recently-updated": "Recently updated",
  newest: "Newest",
  "most-viewed": "Most viewed",
};

export const READING_ORDER_SORT_OPTIONS = Object.keys(
  READING_ORDER_SORT_LABELS
) as ReadingOrderSortOption[];
