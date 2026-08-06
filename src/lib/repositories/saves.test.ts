import { beforeEach, describe, expect, it, vi } from "vitest";
import { createFakeSupabase } from "@/test/fake-supabase";
import { getSavedReadingOrders, getSaveStatus } from "./saves";

const mockCreateClient = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createClient: () => mockCreateClient(),
}));

function makeProfileRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "user-2",
    username: "marcus.reads",
    display_name: "Marcus",
    bio: "",
    avatar_url: "",
    location: null,
    favorite_publishers: [],
    created_at: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function makeOrderRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "order-1",
    slug: "order-1",
    creator_id: "user-2",
    title: "Fantastic Four Omnibus",
    summary: "The complete Hickman run.",
    description: "",
    cover_image_url: "",
    publishers: ["marvel"],
    categories: ["character"],
    visibility: "public",
    save_count: 3,
    view_count: 10,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    creator: makeProfileRow(),
    entries: [],
    ...overrides,
  };
}

beforeEach(() => {
  mockCreateClient.mockReset();
});

describe("getSaveStatus", () => {
  it("is true when a save row exists", async () => {
    mockCreateClient.mockResolvedValue(
      createFakeSupabase({
        tables: { saved_reading_orders: [{ data: { id: "save-1" }, error: null }] },
      })
    );

    expect(await getSaveStatus("order-1", "user-1")).toBe(true);
  });

  it("is false when no save row exists", async () => {
    mockCreateClient.mockResolvedValue(
      createFakeSupabase({
        tables: { saved_reading_orders: [{ data: null, error: null }] },
      })
    );

    expect(await getSaveStatus("order-1", "user-1")).toBe(false);
  });
});

describe("getSavedReadingOrders", () => {
  it("maps saved rows into reading orders with their creator", async () => {
    mockCreateClient.mockResolvedValue(
      createFakeSupabase({
        tables: {
          saved_reading_orders: [
            {
              data: [{ created_at: "2026-02-01T00:00:00.000Z", reading_order: makeOrderRow() }],
              error: null,
            },
          ],
        },
      })
    );

    const result = await getSavedReadingOrders("user-1");

    expect(result).toHaveLength(1);
    expect(result[0].order.title).toBe("Fantastic Four Omnibus");
    expect(result[0].creator.username).toBe("marcus.reads");
  });

  /**
   * The privacy-relevant path: RLS on `reading_orders` returns a null
   * embedded object for an order the viewer may not see, rather than
   * omitting the saved row. Those must be dropped, not rendered as blanks.
   */
  it("drops saves whose reading order was filtered out by RLS", async () => {
    mockCreateClient.mockResolvedValue(
      createFakeSupabase({
        tables: {
          saved_reading_orders: [
            {
              data: [
                { created_at: "2026-02-02T00:00:00.000Z", reading_order: null },
                { created_at: "2026-02-01T00:00:00.000Z", reading_order: makeOrderRow() },
              ],
              error: null,
            },
          ],
        },
      })
    );

    const result = await getSavedReadingOrders("user-1");

    expect(result).toHaveLength(1);
    expect(result[0].order.id).toBe("order-1");
  });

  it("drops saves whose creator profile is missing", async () => {
    mockCreateClient.mockResolvedValue(
      createFakeSupabase({
        tables: {
          saved_reading_orders: [
            {
              data: [
                {
                  created_at: "2026-02-01T00:00:00.000Z",
                  reading_order: makeOrderRow({ creator: null }),
                },
              ],
              error: null,
            },
          ],
        },
      })
    );

    expect(await getSavedReadingOrders("user-1")).toEqual([]);
  });

  it("returns an empty array when the query yields no rows", async () => {
    mockCreateClient.mockResolvedValue(
      createFakeSupabase({
        tables: { saved_reading_orders: [{ data: null, error: null }] },
      })
    );

    expect(await getSavedReadingOrders("user-1")).toEqual([]);
  });
});
