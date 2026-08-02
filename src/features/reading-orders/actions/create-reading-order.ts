"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getReadingOrderBySlug } from "@/lib/repositories";
import { slugify } from "@/lib/utilities/slug";
import {
  createReadingOrderSchema,
  type CreateReadingOrderInput,
} from "@/features/reading-orders/schemas/reading-order-schema";
import type { ReadingOrder } from "@/types/domain";

export type CreateReadingOrderResult =
  | { success: true; readingOrder: ReadingOrder }
  | { success: false; error: string };

export async function createReadingOrderAction(
  input: CreateReadingOrderInput
): Promise<CreateReadingOrderResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "You must be signed in to do that." };
  }

  const parsed = createReadingOrderSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Please fix the errors in the form and try again." };
  }

  const { title, summary, publishers, categories, visibility, coverImageUrl, entries } =
    parsed.data;

  const slug = `${slugify(title)}-${Math.random().toString(36).slice(2, 7)}`;

  const { data: insertedOrder, error: insertError } = await supabase
    .from("reading_orders")
    .insert({
      slug,
      creator_id: user.id,
      title,
      summary,
      description: summary,
      cover_image_url: coverImageUrl || "",
      publishers,
      categories,
      visibility,
    })
    .select("id, slug")
    .single();

  if (insertError || !insertedOrder) {
    return {
      success: false,
      error: "Something went wrong creating your reading order. Please try again.",
    };
  }

  const { error: entriesError } = await supabase.from("reading_order_entries").insert(
    entries.map((entry, index) => ({
      reading_order_id: insertedOrder.id,
      position: index + 1,
      entry_type: entry.entryType,
      title: entry.title,
      issue_range: entry.issueRange || null,
      notes: entry.notes || null,
      is_optional: entry.isOptional,
    }))
  );

  if (entriesError) {
    // Roll back the order so we don't leave an entry-less row behind.
    await supabase.from("reading_orders").delete().eq("id", insertedOrder.id);
    return {
      success: false,
      error: "Something went wrong saving your entries. Please try again.",
    };
  }

  const readingOrder = await getReadingOrderBySlug(insertedOrder.slug);
  if (!readingOrder) {
    return {
      success: false,
      error: "Your reading order was created, but couldn't be loaded. Refresh and try again.",
    };
  }

  revalidatePath("/discover");
  revalidatePath(`/reading-orders/${readingOrder.slug}`);

  return { success: true, readingOrder };
}
