import type { ReadingOrder, UserProfile } from "@/types/domain";
import type { ReadingOrderSearchFilters } from "@/features/reading-orders/types/search";

export interface ReadingOrderWithCreator {
  order: ReadingOrder;
  creator: UserProfile;
}

export function matchesReadingOrderFilters(
  item: ReadingOrderWithCreator,
  filters: ReadingOrderSearchFilters
): boolean {
  const { query, publisher, category } = filters;

  if (publisher && !item.order.publishers.includes(publisher)) {
    return false;
  }

  if (category && !item.order.categories.includes(category)) {
    return false;
  }

  const normalizedQuery = query?.trim().toLowerCase();
  if (normalizedQuery) {
    const haystack = [
      item.order.title,
      item.order.summary,
      item.creator.username,
      item.creator.displayName,
      ...item.order.publishers,
      ...item.order.categories,
    ]
      .join(" ")
      .toLowerCase();

    if (!haystack.includes(normalizedQuery)) {
      return false;
    }
  }

  return true;
}

export function sortReadingOrders<T extends { order: ReadingOrder }>(
  items: T[],
  sort: ReadingOrderSearchFilters["sort"] = "most-saved"
): T[] {
  const sorted = [...items];

  switch (sort) {
    case "recently-updated":
      return sorted.sort(
        (a, b) =>
          new Date(b.order.updatedAt).getTime() -
          new Date(a.order.updatedAt).getTime()
      );
    case "newest":
      return sorted.sort(
        (a, b) =>
          new Date(b.order.createdAt).getTime() -
          new Date(a.order.createdAt).getTime()
      );
    case "most-viewed":
      return sorted.sort((a, b) => b.order.viewCount - a.order.viewCount);
    case "most-saved":
    default:
      return sorted.sort((a, b) => b.order.saveCount - a.order.saveCount);
  }
}

export function filterAndSortReadingOrders<T extends ReadingOrderWithCreator>(
  items: T[],
  filters: ReadingOrderSearchFilters
): T[] {
  return sortReadingOrders(
    items.filter((item) => matchesReadingOrderFilters(item, filters)),
    filters.sort
  );
}
