import { apiClient } from "@/lib/api-client";
import type { ApiSuccessResponse } from "@/types/api";
import type { ResourceRecommendation, RiskAnalysis } from "@/types/domain";

export interface ResourceRecommendationBody {
  situation: string;
  analysis: Pick<
    RiskAnalysis,
    "housingRisk" | "incomeRisk" | "healthcareRisk" | "overallRisk"
  >;
}

export interface ResourceRecommendationResult {
  resources: ResourceRecommendation[];
}

export function fetchRecommendedResources(body: ResourceRecommendationBody) {
  return apiClient.post<
    ApiSuccessResponse<ResourceRecommendationResult>,
    ResourceRecommendationBody
  >("/resources/recommend", body);
}
