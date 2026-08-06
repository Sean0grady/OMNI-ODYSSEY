import { beforeEach, describe, expect, it, vi } from "vitest";
import { createFakeSupabase } from "@/test/fake-supabase";
import { updateReadingOrderAction } from "./update-reading-order";
import type { CreateReadingOrderInput } from "@/features/reading-orders/schemas/reading-order-schema";
import type { ReadingOrder } from "@/types/domain";

const mockCreateClient = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createClient: () => mockCreateClient(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const mockGetReadingOrderBySlug = vi.fn();
vi.mock("@/lib/repositories", () => ({
  getReadingOrderBySlug: (...args: unknown[]) => mockGetReadingOrderBySlug(...args),
}));

const validInput: CreateReadingOrderInput = {
  title: "Fantastic Four Omnibus",
  summary: "The complete Jonathan Hickman run in one place.",
  publishers: ["marvel"],
  categories: ["character"],
  visibility: "public",
  coverImageUrl: "",
  entries: [
    {
      title: "Fantastic Four Vol. 1",
      entryType: "collected-edition",
      issueRange: "",
      notes: "",
      isOptional: false,
    },
  ],
};

beforeEach(() => {
  mockCreateClient.mockReset();
  mockGetReadingOrderBySlug.mockReset();
});

describe("updateReadingOrderAction", () => {
  it("rejects an unauthenticated request", async () => {
    mockCreateClient.mockResolvedValue(createFakeSupabase({ user: null }));

    const result = await updateReadingOrderAction("order-1", validInput);

    expect(result).toEqual({
      success: false,
      error: "You must be signed in to do that.",
    });
  });

  it("rejects invalid input", async () => {
    mockCreateClient.mockResolvedValue(createFakeSupabase());

    const result = await updateReadingOrderAction("order-1", {
      ...validInput,
      entries: [], // schema requires at least one entry
    });

    expect(result.success).toBe(false);
  });

  it("rejects when the reading order doesn't exist", async () => {
    const supabase = createFakeSupabase({
      tables: { reading_orders: [{ data: null, error: null }] },
    });
    mockCreateClient.mockResolvedValue(supabase);

    const result = await updateReadingOrderAction("order-1", validInput);

    expect(result).toEqual({
      success: false,
      error: "You don't have permission to edit this reading order.",
    });
  });

  it("rejects when the authenticated user isn't the owner", async () => {
    const supabase = createFakeSupabase({
      user: { id: "user-2" },
      tables: {
        reading_orders: [
          { data: { id: "order-1", slug: "order-1", creator_id: "user-1" }, error: null },
        ],
      },
    });
    mockCreateClient.mockResolvedValue(supabase);

    const result = await updateReadingOrderAction("order-1", validInput);

    expect(result).toEqual({
      success: false,
      error: "You don't have permission to edit this reading order.",
    });
  });

  it("updates and returns the reading order on success", async () => {
    const fakeReadingOrder = { id: "order-1", slug: "order-1" } as ReadingOrder;
    const supabase = createFakeSupabase({
      tables: {
        reading_orders: [
          { data: { id: "order-1", slug: "order-1", creator_id: "user-1" }, error: null },
          { data: null, error: null }, // the update() call itself
        ],
        reading_order_entries: [
          { data: null, error: null }, // delete existing entries
          { data: null, error: null }, // insert new entries
        ],
      },
    });
    mockCreateClient.mockResolvedValue(supabase);
    mockGetReadingOrderBySlug.mockResolvedValue(fakeReadingOrder);

    const result = await updateReadingOrderAction("order-1", validInput);

    expect(result).toEqual({ success: true, readingOrder: fakeReadingOrder });
  });
});
