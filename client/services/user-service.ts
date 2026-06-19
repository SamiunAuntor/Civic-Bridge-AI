import { apiClient } from "@/lib/api-client";
import type { CurrentUserResponse } from "@/types/api";

export function fetchCurrentUser() {
  return apiClient.get<CurrentUserResponse>("/users/me");
}
