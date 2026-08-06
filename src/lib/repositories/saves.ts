import { createClient } from "@/lib/supabase/server";

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
