import { apiClient } from "@/lib/api-client";
import type { ApiSuccessResponse } from "@/types/api";
import type { Assessment, Priority, RiskAnalysis, RoadmapItem } from "@/types/domain";

export interface CreateAssessmentBody {
  situation: string;
}

export interface CreateAssessmentResult {
  assessment: Assessment;
  analysis: RiskAnalysis;
  priorities: {
    priorities: Priority[];
  };
  roadmap: {
    roadmap: RoadmapItem[];
  };
}

export function createAssessment(body: CreateAssessmentBody) {
  return apiClient.post<ApiSuccessResponse<CreateAssessmentResult>, CreateAssessmentBody>(
    "/assessments",
    body,
  );
}
