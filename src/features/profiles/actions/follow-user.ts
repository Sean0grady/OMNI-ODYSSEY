"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type FollowUserResult =
  | { success: true }
  | { success: false; error: string };

export async function followUserAction(
  targetUserId: string,
  targetUsername: string
): Promise<FollowUserResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "You must be signed in to do that." };
  }

  if (user.id === targetUserId) {
    return { success: false, error: "You can't follow yourself." };
  }

  const { error: insertError } = await supabase
    .from("follows")
    .insert({ follower_id: user.id, following_id: targetUserId });

  // A unique-violation means already following — treat as idempotent
  // success rather than surfacing an error for what the user asked for.
  if (insertError && insertError.code !== "23505") {
    return {
      success: false,
      error: "Something went wrong following this collector. Please try again.",
    };
  }

  revalidatePath(`/users/${targetUsername}`);

  return { success: true };
}
