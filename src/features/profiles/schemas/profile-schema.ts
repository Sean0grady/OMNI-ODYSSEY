import { z } from "zod";
import { PUBLISHERS } from "@/lib/constants/catalog";

export const createProfileSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be under 30 characters")
    .regex(
      /^[a-z0-9](?:[a-z0-9._-]{1,28}[a-z0-9])?$/,
      "Use lowercase letters, numbers, dots, underscores, or hyphens"
    ),
  displayName: z
    .string()
    .trim()
    .min(1, "Display name is required")
    .max(80, "Display name must be under 80 characters"),
  bio: z
    .string()
    .trim()
    .max(280, "Keep your bio under 280 characters")
    .optional()
    .or(z.literal("")),
  location: z
    .string()
    .trim()
    .max(80, "Keep your location under 80 characters")
    .optional()
    .or(z.literal("")),
  favoritePublishers: z.array(z.enum(PUBLISHERS)),
});

export type CreateProfileInput = z.infer<typeof createProfileSchema>;
