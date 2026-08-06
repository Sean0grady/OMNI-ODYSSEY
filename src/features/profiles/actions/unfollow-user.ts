"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type UnfollowUserResult =
  | { success: true }
  | { success: false; error: string };

export async function unfollowUserAction(
  targetUserId: string,
  targetUsername: string
): Promise<UnfollowUserResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "You must be signed in to do that." };
  }

  const { error: deleteError } = await supabase
    .from("follows")
    .delete()
    .eq("follower_id", user.id)
    .eq("following_id", targetUserId);

  if (deleteError) {
    return {
      success: false,
      error: "Something went wrong unfollowing this collector. Please try again.",
    };
  }

  revalidatePath(`/users/${targetUsername}`);

  return { success: true };
}
