"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getReadingOrderBySlug } from "@/lib/repositories";
import {
  createReadingOrderSchema,
  type CreateReadingOrderInput,
} from "@/features/reading-orders/schemas/reading-order-schema";
import type { ReadingOrder } from "@/types/domain";

export type UpdateReadingOrderResult =
  | { success: true; readingOrder: ReadingOrder }
  | { success: false; error: string };

export async function updateReadingOrderAction(
  readingOrderId: string,
  input: CreateReadingOrderInput
): Promise<UpdateReadingOrderResult> {
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

  // Verify ownership independently — don't rely solely on RLS letting the
  // update through (a 0-row update from RLS denial looks identical to
  // "not found" otherwise, and we want an explicit, honest error).
  const { data: existing } = await supabase
    .from("reading_orders")
    .select("id, slug, creator_id")
    .eq("id", readingOrderId)
    .maybeSingle();

  if (!existing || existing.creator_id !== user.id) {
    return {
      success: false,
      error: "You don't have permission to edit this reading order.",
    };
  }

  const { title, summary, publishers, categories, visibility, coverImageUrl, entries } =
    parsed.data;

  const { error: updateError } = await supabase
    .from("reading_orders")
    .update({
      title,
      summary,
      description: summary,
      cover_image_url: coverImageUrl || "",
      publishers,
      categories,
      visibility,
    })
    .eq("id", readingOrderId)
    .eq("creator_id", user.id);

  if (updateError) {
    return {
      success: false,
      error: "Something went wrong updating your reading order. Please try again.",
    };
  }

  // Entries are fully replaced on every edit — matches how the field-array
  // form already treats the whole entry list as one unit on submit.
  const { error: deleteEntriesError } = await supabase
    .from("reading_order_entries")
    .delete()
    .eq("reading_order_id", readingOrderId);

  if (deleteEntriesError) {
    return {
      success: false,
      error: "Something went wrong updating your entries. Please try again.",
    };
  }

  const { error: insertEntriesError } = await supabase.from("reading_order_entries").insert(
    entries.map((entry, index) => ({
      reading_order_id: readingOrderId,
      position: index + 1,
      entry_type: entry.entryType,
      title: entry.title,
      issue_range: entry.issueRange || null,
      notes: entry.notes || null,
      is_optional: entry.isOptional,
    }))
  );

  if (insertEntriesError) {
    return {
      success: false,
      error: "Something went wrong saving your entries. Please try again.",
    };
  }

  const readingOrder = await getReadingOrderBySlug(existing.slug);
  if (!readingOrder) {
    return {
      success: false,
      error: "Your changes were saved, but couldn't be reloaded. Refresh to see them.",
    };
  }

  revalidatePath("/discover");
  revalidatePath(`/reading-orders/${existing.slug}`);

  return { success: true, readingOrder };
}
