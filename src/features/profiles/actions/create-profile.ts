"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  createProfileSchema,
  type CreateProfileInput,
} from "@/features/profiles/schemas/profile-schema";

export type CreateProfileResult =
  | { success: true; username: string }
  | { success: false; error: string; fieldErrors?: Record<string, string> };

export async function createProfileAction(
  input: CreateProfileInput
): Promise<CreateProfileResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "You must be signed in to do that." };
  }

  const parsed = createProfileSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
    return { success: false, error: "Please fix the errors below.", fieldErrors };
  }

  const { avatarUrl, username, displayName, bio, location, favoritePublishers } =
    parsed.data;

  const { error: insertError } = await supabase.from("profiles").insert({
    id: user.id,
    username,
    display_name: displayName,
    bio: bio || "",
    avatar_url: avatarUrl || "",
    location: location || null,
    favorite_publishers: favoritePublishers,
  });

  if (insertError) {
    if (insertError.code === "23505") {
      return {
        success: false,
        error: "Please fix the errors below.",
        fieldErrors: { username: "That username is already taken." },
      };
    }
    return {
      success: false,
      error: "Something went wrong creating your profile. Please try again.",
    };
  }

  revalidatePath("/", "layout");
  return { success: true, username };
}
