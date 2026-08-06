import { beforeEach, describe, expect, it, vi } from "vitest";
import { createFakeSupabase } from "@/test/fake-supabase";
import { deleteReadingOrderAction } from "./delete-reading-order";

const mockCreateClient = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createClient: () => mockCreateClient(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

beforeEach(() => {
  mockCreateClient.mockReset();
});

describe("deleteReadingOrderAction", () => {
  it("rejects an unauthenticated request", async () => {
    mockCreateClient.mockResolvedValue(createFakeSupabase({ user: null }));

    const result = await deleteReadingOrderAction("order-1");

    expect(result).toEqual({
      success: false,
      error: "You must be signed in to do that.",
    });
  });

  it("rejects when the reading order doesn't exist", async () => {
    const supabase = createFakeSupabase({
      tables: { reading_orders: [{ data: null, error: null }] },
    });
    mockCreateClient.mockResolvedValue(supabase);

    const result = await deleteReadingOrderAction("order-1");

    expect(result).toEqual({
      success: false,
      error: "You don't have permission to delete this reading order.",
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

    const result = await deleteReadingOrderAction("order-1");

    expect(result).toEqual({
      success: false,
      error: "You don't have permission to delete this reading order.",
    });
  });

  it("deletes and succeeds for the owner", async () => {
    const supabase = createFakeSupabase({
      tables: {
        reading_orders: [
          { data: { id: "order-1", slug: "order-1", creator_id: "user-1" }, error: null },
          { data: null, error: null }, // the delete() call itself
        ],
      },
    });
    mockCreateClient.mockResolvedValue(supabase);

    const result = await deleteReadingOrderAction("order-1");

    expect(result).toEqual({ success: true });
  });

  it("reports a generic error when the delete itself fails", async () => {
    const supabase = createFakeSupabase({
      tables: {
        reading_orders: [
          { data: { id: "order-1", slug: "order-1", creator_id: "user-1" }, error: null },
          { data: null, error: { message: "db exploded" } },
        ],
      },
    });
    mockCreateClient.mockResolvedValue(supabase);

    const result = await deleteReadingOrderAction("order-1");

    expect(result).toEqual({
      success: false,
      error: "Something went wrong deleting your reading order. Please try again.",
    });
  });
});
