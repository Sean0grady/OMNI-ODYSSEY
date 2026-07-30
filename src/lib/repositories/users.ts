import { MOCK_USERS } from "@/lib/mock-data";
import { MOCK_CURRENT_USER } from "@/lib/mock-current-user";
import type { UserProfile } from "@/types/domain";

export function getUserByUsername(username: string): UserProfile | undefined {
  return MOCK_USERS.find((user) => user.username === username);
}

export function getUserById(userId: string): UserProfile | undefined {
  return MOCK_USERS.find((user) => user.id === userId);
}

export function getCurrentUser(): UserProfile {
  return MOCK_CURRENT_USER;
}
