import { MOCK_USERS } from "@/lib/mock-data";
import type { UserProfile } from "@/types/domain";

/**
 * There is no real authentication in this MVP. Every "signed in" affordance
 * (create reading order, save, follow) acts as this fixed mock user. This is
 * NOT a security boundary — treat it strictly as UI state for demonstrating
 * the intended logged-in experience.
 */
export const MOCK_CURRENT_USER: UserProfile = MOCK_USERS[0];
