import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";
import type { Publisher, UserProfile } from "@/types/domain";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

interface ProfileCounts {
  publishedReadingOrderCount: number;
  followerCount: number;
  followingCount: number;
  reviewCount: number;
}

function toUserProfile(row: ProfileRow, counts: ProfileCounts): UserProfile {
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    bio: row.bio,
    avatarUrl: row.avatar_url,
    location: row.location ?? undefined,
    favoritePublishers: row.favorite_publishers as Publisher[],
    followerCount: counts.followerCount,
    followingCount: counts.followingCount,
    reviewCount: counts.reviewCount,
    publishedReadingOrderCount: counts.publishedReadingOrderCount,
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

async function countFollowers(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<number> {
  const { count } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("following_id", userId);

  return count ?? 0;
}

async function countFollowing(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<number> {
  const { count } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("follower_id", userId);

  return count ?? 0;
}

async function countReviews(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<number> {
  const { count } = await supabase
    .from("reviews")
    .select("*", { count: "exact", head: true })
    .eq("author_id", userId);

  return count ?? 0;
}

async function getProfileCounts(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<ProfileCounts> {
  const [publishedReadingOrderCount, followerCount, followingCount, reviewCount] =
    await Promise.all([
      countPublishedReadingOrders(supabase, userId),
      countFollowers(supabase, userId),
      countFollowing(supabase, userId),
      countReviews(supabase, userId),
    ]);

  return {
    publishedReadingOrderCount,
    followerCount,
    followingCount,
    reviewCount,
  };
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

  const counts = await getProfileCounts(supabase, profile.id);

  return toUserProfile(profile, counts);
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

  const counts = await getProfileCounts(supabase, profile.id);

  return toUserProfile(profile, counts);
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

  const counts = await getProfileCounts(supabase, profile.id);

  return toUserProfile(profile, counts);
}
