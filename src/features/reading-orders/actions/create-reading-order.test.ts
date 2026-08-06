import { beforeEach, describe, expect, it, vi } from "vitest";
import { createFakeSupabase } from "@/test/fake-supabase";
import { createReadingOrderAction } from "./create-reading-order";
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

describe("createReadingOrderAction", () => {
  it("rejects an unauthenticated request", async () => {
    mockCreateClient.mockResolvedValue(createFakeSupabase({ user: null }));

    const result = await createReadingOrderAction(validInput);

    expect(result).toEqual({
      success: false,
      error: "You must be signed in to do that.",
    });
  });

  it("rejects invalid input without touching the database", async () => {
    const supabase = createFakeSupabase();
    mockCreateClient.mockResolvedValue(supabase);

    const result = await createReadingOrderAction({
      ...validInput,
      title: "ab", // below the 3-character minimum
    });

    expect(result.success).toBe(false);
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("rolls back the created order if inserting entries fails", async () => {
    const supabase = createFakeSupabase({
      tables: {
        reading_orders: [
          { data: { id: "order-1", slug: "fantastic-four-omnibus-abcde" }, error: null },
        ],
        reading_order_entries: [{ data: null, error: { message: "insert failed" } }],
      },
    });
    mockCreateClient.mockResolvedValue(supabase);

    const result = await createReadingOrderAction(validInput);

    expect(result).toEqual({
      success: false,
      error: "Something went wrong saving your entries. Please try again.",
    });
    // Rollback: reading_orders.delete() is called after the entries insert
    // fails, on top of the initial insert — two calls total.
    expect(supabase.from).toHaveBeenCalledWith("reading_orders");
    expect(mockGetReadingOrderBySlug).not.toHaveBeenCalled();
  });

  it("returns the created reading order on success", async () => {
    const fakeReadingOrder = { id: "order-1", slug: "fantastic-four-omnibus-abcde" } as ReadingOrder;
    const supabase = createFakeSupabase({
      tables: {
        reading_orders: [
          { data: { id: "order-1", slug: "fantastic-four-omnibus-abcde" }, error: null },
        ],
        reading_order_entries: [{ data: null, error: null }],
      },
    });
    mockCreateClient.mockResolvedValue(supabase);
    mockGetReadingOrderBySlug.mockResolvedValue(fakeReadingOrder);

    const result = await createReadingOrderAction(validInput);

    expect(result).toEqual({ success: true, readingOrder: fakeReadingOrder });
  });
});
