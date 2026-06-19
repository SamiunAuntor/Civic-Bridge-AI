import { apiClient } from "@/lib/api-client";
import type { ApiSuccessResponse } from "@/types/api";
import type { RoadmapItem } from "@/types/domain";

export function fetchRoadmap(assessmentId: string) {
  return apiClient.get<ApiSuccessResponse<RoadmapItem[]>>(
    `/roadmaps/${assessmentId}`,
  );
}
