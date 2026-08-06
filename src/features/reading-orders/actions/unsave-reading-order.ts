"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type UnsaveReadingOrderResult =
  | { success: true }
  | { success: false; error: string };

export async function unsaveReadingOrderAction(
  readingOrderId: string,
  slug: string
): Promise<UnsaveReadingOrderResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "You must be signed in to do that." };
  }

  const { error: deleteError } = await supabase
    .from("saved_reading_orders")
    .delete()
    .eq("user_id", user.id)
    .eq("reading_order_id", readingOrderId);

  if (deleteError) {
    return {
      success: false,
      error: "Something went wrong unsaving this reading order. Please try again.",
    };
  }

  revalidatePath(`/reading-orders/${slug}`);

  return { success: true };
}
