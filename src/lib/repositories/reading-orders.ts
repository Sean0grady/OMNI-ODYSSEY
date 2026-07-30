import { MOCK_READING_ORDERS, MOCK_USERS } from "@/lib/mock-data";
import { MOCK_CURRENT_USER } from "@/lib/mock-current-user";
import { slugify } from "@/lib/utilities/slug";
import { filterAndSortReadingOrders } from "@/features/reading-orders/utils/filter-sort";
import type { CreateReadingOrderInput } from "@/features/reading-orders/schemas/reading-order-schema";
import type { ReadingOrderSearchFilters } from "@/features/reading-orders/types/search";
import type { ReadingOrder, ReadingOrderEntry } from "@/types/domain";

const readingOrders: ReadingOrder[] = [...MOCK_READING_ORDERS];

function byUpdatedAtDesc(a: ReadingOrder, b: ReadingOrder): number {
  return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
}

export function getFeaturedReadingOrders(limit = 4): ReadingOrder[] {
  return readingOrders
    .filter((order) => order.visibility === "public")
    .sort((a, b) => b.saveCount - a.saveCount)
    .slice(0, limit);
}

export function getRecentReadingOrders(limit = 8): ReadingOrder[] {
  return readingOrders
    .filter((order) => order.visibility === "public")
    .sort(byUpdatedAtDesc)
    .slice(0, limit);
}

export function getReadingOrderBySlug(slug: string): ReadingOrder | undefined {
  return readingOrders.find((order) => order.slug === slug);
}

export function getReadingOrdersByUserId(userId: string): ReadingOrder[] {
  return readingOrders
    .filter((order) => order.creatorId === userId)
    .sort(byUpdatedAtDesc);
}

export function getRelatedReadingOrders(
  readingOrder: ReadingOrder,
  limit = 3
): ReadingOrder[] {
  return readingOrders
    .filter(
      (order) =>
        order.id !== readingOrder.id &&
        order.visibility === "public" &&
        (order.publishers.some((publisher) =>
          readingOrder.publishers.includes(publisher)
        ) ||
          order.categories.some((category) =>
            readingOrder.categories.includes(category)
          ))
    )
    .sort((a, b) => b.saveCount - a.saveCount)
    .slice(0, limit);
}

export function searchReadingOrders(
  filters: ReadingOrderSearchFilters = {}
): ReadingOrder[] {
  const publicOrdersWithCreators = readingOrders
    .filter((order) => order.visibility === "public")
    .flatMap((order) => {
      const creator = MOCK_USERS.find(
        (candidate) => candidate.id === order.creatorId
      );
      return creator ? [{ order, creator }] : [];
    });

  return filterAndSortReadingOrders(publicOrdersWithCreators, filters).map(
    (item) => item.order
  );
}

export function saveReadingOrderMock(readingOrderId: string): { success: boolean } {
  const order = readingOrders.find((candidate) => candidate.id === readingOrderId);

  if (!order) {
    return { success: false };
  }

  order.saveCount += 1;
  return { success: true };
}

export function createReadingOrderMock(input: CreateReadingOrderInput): ReadingOrder {
  const now = new Date().toISOString();
  const id = `ro-${slugify(input.title)}-${Date.now()}`;
  const slug = `${slugify(input.title)}-${Math.random().toString(36).slice(2, 7)}`;

  const entries: ReadingOrderEntry[] = input.entries.map((entry, index) => ({
    id: `${id}-entry-${index + 1}`,
    readingOrderId: id,
    position: index + 1,
    entryType: entry.entryType,
    title: entry.title,
    issueRange: entry.issueRange || undefined,
    notes: entry.notes || undefined,
    isOptional: entry.isOptional,
  }));

  const newOrder: ReadingOrder = {
    id,
    slug,
    creatorId: MOCK_CURRENT_USER.id,
    title: input.title,
    summary: input.summary,
    description: input.summary,
    coverImageUrl: input.coverImageUrl || "",
    publishers: input.publishers,
    categories: input.categories,
    visibility: input.visibility,
    entries,
    saveCount: 0,
    viewCount: 0,
    estimatedBookCount: entries.length,
    createdAt: now,
    updatedAt: now,
  };

  readingOrders.unshift(newOrder);
  return newOrder;
}
