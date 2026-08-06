import { beforeEach, describe, expect, it, vi } from "vitest";
import { createFakeSupabase } from "@/test/fake-supabase";
import { createProfileAction } from "./create-profile";
import type { CreateProfileInput } from "@/features/profiles/schemas/profile-schema";

const mockCreateClient = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createClient: () => mockCreateClient(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const validInput: CreateProfileInput = {
  username: "marcus.reads",
  displayName: "Marcus",
  bio: "",
  location: "",
  favoritePublishers: [],
};

beforeEach(() => {
  mockCreateClient.mockReset();
});

describe("createProfileAction", () => {
  it("rejects an unauthenticated request", async () => {
    mockCreateClient.mockResolvedValue(createFakeSupabase({ user: null }));

    const result = await createProfileAction(validInput);

    expect(result).toEqual({
      success: false,
      error: "You must be signed in to do that.",
    });
  });

  it("rejects an invalid username with a field error", async () => {
    mockCreateClient.mockResolvedValue(createFakeSupabase());

    const result = await createProfileAction({ ...validInput, username: "AB" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.fieldErrors?.username).toBeDefined();
    }
  });

  it("maps a unique-violation on insert to a friendly username-taken error", async () => {
    const supabase = createFakeSupabase({
      tables: {
        profiles: [{ data: null, error: { code: "23505", message: "duplicate key" } }],
      },
    });
    mockCreateClient.mockResolvedValue(supabase);

    const result = await createProfileAction(validInput);

    expect(result).toEqual({
      success: false,
      error: "Please fix the errors below.",
      fieldErrors: { username: "That username is already taken." },
    });
  });

  it("returns a generic error for other insert failures", async () => {
    const supabase = createFakeSupabase({
      tables: {
        profiles: [{ data: null, error: { code: "23503", message: "fk violation" } }],
      },
    });
    mockCreateClient.mockResolvedValue(supabase);

    const result = await createProfileAction(validInput);

    expect(result).toEqual({
      success: false,
      error: "Something went wrong creating your profile. Please try again.",
    });
  });

  it("succeeds and returns the new username", async () => {
    const supabase = createFakeSupabase({
      tables: { profiles: [{ data: null, error: null }] },
    });
    mockCreateClient.mockResolvedValue(supabase);

    const result = await createProfileAction(validInput);

    expect(result).toEqual({ success: true, username: "marcus.reads" });
  });
});
