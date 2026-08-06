import { createClient } from "@/lib/supabase/server";
import { toReadingOrder, toEmbeddedCreator } from "@/lib/repositories/reading-orders";
import type { ReadingOrderWithCreator } from "@/features/reading-orders/utils/filter-sort";

export async function getSaveStatus(
  readingOrderId: string,
  userId: string
): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("saved_reading_orders")
    .select("id")
    .eq("reading_order_id", readingOrderId)
    .eq("user_id", userId)
    .maybeSingle();

  return data !== null;
}

/**
 * Reading orders a user has saved, most recently saved first.
 *
 * No visibility filter is applied here on purpose — Row Level Security on
 * `reading_orders` already decides what the *viewer* may see. If a saved
 * order is private and belongs to someone else, PostgREST returns a null
 * embedded object rather than the row, and the flatMap below drops it. The
 * practical effect: you always see your own saved private orders, and never
 * leak someone else's private order to a viewer who saved it before it was
 * made private. Do not "fix" this into a `.eq('visibility', 'public')`.
 */
export async function getSavedReadingOrders(
  userId: string
): Promise<ReadingOrderWithCreator[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("saved_reading_orders")
    .select(
      "created_at, reading_order:reading_orders(*, creator:profiles(*), entries:reading_order_entries(*))"
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return (data ?? []).flatMap((row) => {
    const order = row.reading_order;
    return order && order.creator
      ? [
          {
            order: toReadingOrder(order, order.entries),
            creator: toEmbeddedCreator(order.creator),
          },
        ]
      : [];
  });
}
