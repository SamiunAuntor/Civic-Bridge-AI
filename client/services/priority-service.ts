import { apiClient } from "@/lib/api-client";
import type { ApiSuccessResponse } from "@/types/api";
import type { Priority } from "@/types/domain";

export function fetchPriorities(assessmentId: string) {
  return apiClient.get<ApiSuccessResponse<Priority[]>>(
    `/priorities/${assessmentId}`,
  );
}
