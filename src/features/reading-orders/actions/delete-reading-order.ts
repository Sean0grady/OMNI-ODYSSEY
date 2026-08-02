"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type DeleteReadingOrderResult =
  | { success: true }
  | { success: false; error: string };

export async function deleteReadingOrderAction(
  readingOrderId: string
): Promise<DeleteReadingOrderResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "You must be signed in to do that." };
  }

  // Verify ownership independently before deleting — don't rely solely on
  // RLS to silently no-op a delete of a row that isn't ours.
  const { data: existing } = await supabase
    .from("reading_orders")
    .select("id, slug, creator_id")
    .eq("id", readingOrderId)
    .maybeSingle();

  if (!existing || existing.creator_id !== user.id) {
    return {
      success: false,
      error: "You don't have permission to delete this reading order.",
    };
  }

  const { error: deleteError } = await supabase
    .from("reading_orders")
    .delete()
    .eq("id", readingOrderId)
    .eq("creator_id", user.id);

  if (deleteError) {
    return {
      success: false,
      error: "Something went wrong deleting your reading order. Please try again.",
    };
  }

  revalidatePath("/discover");
  revalidatePath(`/reading-orders/${existing.slug}`);

  return { success: true };
}
