"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type SaveReadingOrderResult =
  | { success: true }
  | { success: false; error: string };

export async function saveReadingOrderAction(
  readingOrderId: string,
  slug: string
): Promise<SaveReadingOrderResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "You must be signed in to do that." };
  }

  const { error: insertError } = await supabase
    .from("saved_reading_orders")
    .insert({ user_id: user.id, reading_order_id: readingOrderId });

  // A unique-violation means it's already saved — treat as idempotent
  // success rather than surfacing an error for what the user asked for.
  if (insertError && insertError.code !== "23505") {
    return {
      success: false,
      error: "Something went wrong saving this reading order. Please try again.",
    };
  }

  revalidatePath(`/reading-orders/${slug}`);

  return { success: true };
}
