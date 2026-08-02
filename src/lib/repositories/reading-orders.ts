import { createClient } from "@/lib/supabase/server";
import { filterAndSortReadingOrders } from "@/features/reading-orders/utils/filter-sort";
import type { ReadingOrderWithCreator } from "@/features/reading-orders/utils/filter-sort";
import type { ReadingOrderSearchFilters } from "@/features/reading-orders/types/search";
import type { Database } from "@/types/database.types";
import type {
  Publisher,
  ReadingOrder,
  ReadingOrderCategory,
  ReadingOrderEntry,
  ReadingOrderEntryType,
  ReadingOrderVisibility,
  UserProfile,
} from "@/types/domain";

type ReadingOrderRow = Database["public"]["Tables"]["reading_orders"]["Row"];
type ReadingOrderEntryRow =
  Database["public"]["Tables"]["reading_order_entries"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

function toReadingOrderEntry(row: ReadingOrderEntryRow): ReadingOrderEntry {
  return {
    id: row.id,
    readingOrderId: row.reading_order_id,
    position: row.position,
    entryType: row.entry_type as ReadingOrderEntryType,
    title: row.title,
    subtitle: row.subtitle ?? undefined,
    issueRange: row.issue_range ?? undefined,
    coverImageUrl: row.cover_image_url ?? undefined,
    notes: row.notes ?? undefined,
    isOptional: row.is_optional,
  };
}

function toReadingOrder(
  row: ReadingOrderRow,
  entryRows: ReadingOrderEntryRow[]
): ReadingOrder {
  const entries = [...entryRows]
    .sort((a, b) => a.position - b.position)
    .map(toReadingOrderEntry);

  return {
    id: row.id,
    slug: row.slug,
    creatorId: row.creator_id,
    title: row.title,
    summary: row.summary,
    description: row.description,
    coverImageUrl: row.cover_image_url,
    publishers: row.publishers as Publisher[],
    categories: row.categories as ReadingOrderCategory[],
    visibility: row.visibility as ReadingOrderVisibility,
    entries,
    saveCount: row.save_count,
    viewCount: row.view_count,
    estimatedBookCount: entries.length,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Builds a UserProfile from a creator row embedded in a reading-order
 * listing query. Aggregate counts (followers/following/reviews/published
 * orders) are NOT computed here — doing so per row would reintroduce the
 * N+1 problem this embedding is meant to avoid, and none of the listing
 * components that consume this (ReadingOrderCard, CreatorSummary) render
 * those counts. Accurate counts only come from getUserByUsername /
 * getUserById / getCurrentUser, which are single-profile lookups.
 */
function toEmbeddedCreator(row: ProfileRow): UserProfile {
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    bio: row.bio,
    avatarUrl: row.avatar_url,
    location: row.location ?? undefined,
    favoritePublishers: row.favorite_publishers as Publisher[],
    followerCount: 0,
    followingCount: 0,
    reviewCount: 0,
    publishedReadingOrderCount: 0,
    createdAt: row.created_at,
  };
}

export async function getFeaturedReadingOrders(
  limit = 4
): Promise<ReadingOrderWithCreator[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reading_orders")
    .select("*, creator:profiles(*), entries:reading_order_entries(*)")
    .eq("visibility", "public")
    .order("save_count", { ascending: false })
    .limit(limit);

  return (data ?? []).flatMap((row) =>
    row.creator
      ? [{ order: toReadingOrder(row, row.entries), creator: toEmbeddedCreator(row.creator) }]
      : []
  );
}

export async function getRecentReadingOrders(
  limit = 8
): Promise<ReadingOrderWithCreator[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reading_orders")
    .select("*, creator:profiles(*), entries:reading_order_entries(*)")
    .eq("visibility", "public")
    .order("updated_at", { ascending: false })
    .limit(limit);

  return (data ?? []).flatMap((row) =>
    row.creator
      ? [{ order: toReadingOrder(row, row.entries), creator: toEmbeddedCreator(row.creator) }]
      : []
  );
}

export async function getReadingOrderBySlug(
  slug: string
): Promise<ReadingOrder | undefined> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reading_orders")
    .select("*, entries:reading_order_entries(*)")
    .eq("slug", slug)
    .maybeSingle();

  return data ? toReadingOrder(data, data.entries) : undefined;
}

/**
 * All reading orders by a creator, visible to the current viewer. No
 * visibility filter is applied here on purpose: Row Level Security already
 * returns private rows only when the viewer IS the creator, and public rows
 * to everyone else. Adding `.eq('visibility', 'public')` here (the way
 * searchReadingOrders intentionally does) would defeat that and hide a
 * user's own private orders from their own profile page.
 */
export async function getReadingOrdersByUserId(
  userId: string
): Promise<ReadingOrder[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reading_orders")
    .select("*, entries:reading_order_entries(*)")
    .eq("creator_id", userId)
    .order("updated_at", { ascending: false });

  return (data ?? []).map((row) => toReadingOrder(row, row.entries));
}

export async function getRelatedReadingOrders(
  readingOrder: ReadingOrder,
  limit = 3
): Promise<ReadingOrder[]> {
  const supabase = await createClient();
  const orFilters = [
    readingOrder.publishers.length > 0
      ? `publishers.ov.{${readingOrder.publishers.join(",")}}`
      : null,
    readingOrder.categories.length > 0
      ? `categories.ov.{${readingOrder.categories.join(",")}}`
      : null,
  ].filter((clause): clause is string => clause !== null);

  if (orFilters.length === 0) {
    return [];
  }

  const { data } = await supabase
    .from("reading_orders")
    .select("*, entries:reading_order_entries(*)")
    .eq("visibility", "public")
    .neq("id", readingOrder.id)
    .or(orFilters.join(","))
    .order("save_count", { ascending: false })
    .limit(limit);

  return (data ?? []).map((row) => toReadingOrder(row, row.entries));
}

/**
 * Public reading orders only, matching Discover's "public browsing" intent
 * — deliberately not RLS's full "public or mine" visibility, even for the
 * signed-in viewer's own account.
 */
export async function searchReadingOrders(
  filters: ReadingOrderSearchFilters = {}
): Promise<ReadingOrderWithCreator[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reading_orders")
    .select("*, creator:profiles(*), entries:reading_order_entries(*)")
    .eq("visibility", "public");

  const items: ReadingOrderWithCreator[] = (data ?? []).flatMap((row) =>
    row.creator
      ? [{ order: toReadingOrder(row, row.entries), creator: toEmbeddedCreator(row.creator) }]
      : []
  );

  return filterAndSortReadingOrders(items, filters);
}
