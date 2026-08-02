import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";
import type { Publisher, UserProfile } from "@/types/domain";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

function toUserProfile(
  row: ProfileRow,
  publishedReadingOrderCount: number
): UserProfile {
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    bio: row.bio,
    avatarUrl: row.avatar_url,
    location: row.location ?? undefined,
    favoritePublishers: row.favorite_publishers as Publisher[],
    // Follows and reviews aren't implemented against Supabase yet — these
    // are honest placeholders, not fake data, until those phases land.
    followerCount: 0,
    followingCount: 0,
    reviewCount: 0,
    publishedReadingOrderCount,
    createdAt: row.created_at,
  };
}

async function countPublishedReadingOrders(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<number> {
  const { count } = await supabase
    .from("reading_orders")
    .select("*", { count: "exact", head: true })
    .eq("creator_id", userId)
    .eq("visibility", "public");

  return count ?? 0;
}

export async function getUserByUsername(
  username: string
): Promise<UserProfile | undefined> {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .maybeSingle();

  if (!profile) {
    return undefined;
  }

  const publishedReadingOrderCount = await countPublishedReadingOrders(
    supabase,
    profile.id
  );

  return toUserProfile(profile, publishedReadingOrderCount);
}

export async function getUserById(
  userId: string
): Promise<UserProfile | undefined> {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (!profile) {
    return undefined;
  }

  const publishedReadingOrderCount = await countPublishedReadingOrders(
    supabase,
    profile.id
  );

  return toUserProfile(profile, publishedReadingOrderCount);
}

/**
 * The current authenticated user's public profile, or null if signed out
 * or signed in but not yet onboarded (no profiles row yet).
 */
export async function getCurrentUser(): Promise<UserProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    return null;
  }

  const publishedReadingOrderCount = await countPublishedReadingOrders(
    supabase,
    profile.id
  );

  return toUserProfile(profile, publishedReadingOrderCount);
}
