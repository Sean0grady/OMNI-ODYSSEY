import { createClient } from "@/lib/supabase/server";

export async function getFollowStatus(
  followerId: string,
  followingId: string
): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("follows")
    .select("id")
    .eq("follower_id", followerId)
    .eq("following_id", followingId)
    .maybeSingle();

  return data !== null;
}
