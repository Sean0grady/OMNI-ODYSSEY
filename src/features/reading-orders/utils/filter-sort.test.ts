import { describe, expect, it } from "vitest";
import {
  filterAndSortReadingOrders,
  matchesReadingOrderFilters,
  sortReadingOrders,
  type ReadingOrderWithCreator,
} from "./filter-sort";
import type { ReadingOrder, UserProfile } from "@/types/domain";

function makeOrder(overrides: Partial<ReadingOrder> = {}): ReadingOrder {
  return {
    id: "order-1",
    slug: "order-1",
    creatorId: "user-1",
    title: "Fantastic Four Omnibus",
    summary: "The complete Hickman run.",
    description: "",
    coverImageUrl: "",
    publishers: ["marvel"],
    categories: ["character"],
    visibility: "public",
    entries: [],
    saveCount: 10,
    viewCount: 100,
    estimatedBookCount: 0,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function makeCreator(overrides: Partial<UserProfile> = {}): UserProfile {
  return {
    id: "user-1",
    username: "marcus.reads",
    displayName: "Marcus",
    bio: "",
    avatarUrl: "",
    favoritePublishers: [],
    followerCount: 0,
    followingCount: 0,
    publishedReadingOrderCount: 0,
    reviewCount: 0,
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function makeItem(
  orderOverrides: Partial<ReadingOrder> = {},
  creatorOverrides: Partial<UserProfile> = {}
): ReadingOrderWithCreator {
  return { order: makeOrder(orderOverrides), creator: makeCreator(creatorOverrides) };
}

describe("matchesReadingOrderFilters", () => {
  it("matches when no filters are set", () => {
    expect(matchesReadingOrderFilters(makeItem(), {})).toBe(true);
  });

  it("filters out items missing the requested publisher", () => {
    const item = makeItem({ publishers: ["dc"] });
    expect(matchesReadingOrderFilters(item, { publisher: "marvel" })).toBe(false);
  });

  it("filters out items missing the requested category", () => {
    const item = makeItem({ categories: ["event"] });
    expect(matchesReadingOrderFilters(item, { category: "character" })).toBe(false);
  });

  it("matches a query against the title", () => {
    const item = makeItem({ title: "X-Men: Age of Apocalypse" });
    expect(matchesReadingOrderFilters(item, { query: "apocalypse" })).toBe(true);
  });

  it("matches a query against the creator's username", () => {
    const item = makeItem({}, { username: "collector.dave" });
    expect(matchesReadingOrderFilters(item, { query: "dave" })).toBe(true);
  });

  it("is case-insensitive", () => {
    const item = makeItem({ title: "Saga" });
    expect(matchesReadingOrderFilters(item, { query: "SAGA" })).toBe(true);
  });

  it("excludes items that match none of the query terms", () => {
    const item = makeItem({ title: "Saga" });
    expect(matchesReadingOrderFilters(item, { query: "batman" })).toBe(false);
  });
});

describe("sortReadingOrders", () => {
  const items = [
    makeItem({ id: "a", saveCount: 5, viewCount: 50, createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-03T00:00:00.000Z" }),
    makeItem({ id: "b", saveCount: 20, viewCount: 10, createdAt: "2026-02-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" }),
    makeItem({ id: "c", saveCount: 10, viewCount: 90, createdAt: "2026-03-01T00:00:00.000Z", updatedAt: "2026-01-02T00:00:00.000Z" }),
  ];

  it("defaults to most-saved descending", () => {
    expect(sortReadingOrders(items).map((i) => i.order.id)).toEqual(["b", "c", "a"]);
  });

  it("sorts by most-viewed", () => {
    expect(
      sortReadingOrders(items, "most-viewed").map((i) => i.order.id)
    ).toEqual(["c", "a", "b"]);
  });

  it("sorts by newest (createdAt descending)", () => {
    expect(sortReadingOrders(items, "newest").map((i) => i.order.id)).toEqual([
      "c",
      "b",
      "a",
    ]);
  });

  it("sorts by recently-updated (updatedAt descending)", () => {
    expect(
      sortReadingOrders(items, "recently-updated").map((i) => i.order.id)
    ).toEqual(["a", "c", "b"]);
  });

  it("does not mutate the input array", () => {
    const original = [...items];
    sortReadingOrders(items, "newest");
    expect(items).toEqual(original);
  });
});

describe("filterAndSortReadingOrders", () => {
  it("filters then sorts in one pass", () => {
    const items = [
      makeItem({ id: "a", publishers: ["marvel"], saveCount: 5 }),
      makeItem({ id: "b", publishers: ["dc"], saveCount: 50 }),
      makeItem({ id: "c", publishers: ["marvel"], saveCount: 20 }),
    ];

    const result = filterAndSortReadingOrders(items, { publisher: "marvel" });

    expect(result.map((i) => i.order.id)).toEqual(["c", "a"]);
  });
});
