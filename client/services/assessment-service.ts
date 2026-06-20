import { apiClient } from "@/lib/api-client";
import type { ApiSuccessResponse } from "@/types/api";
import type { Assessment, Priority, RiskAnalysis, RoadmapItem } from "@/types/domain";

export interface CreateAssessmentBody {
  situation: string;
  intakeProfile?: {
    topic?: string;
    primaryConcerns?: string[];
    timePressure?: string;
    housingStatus?: string;
    incomeStatus?: string;
    essentialNeedsStatus?: string;
    healthcareStatus?: string;
    safetyStatus?: string;
    supportLevel?: string;
  };
}

export interface SafetyScreeningResult {
  isUrgent: boolean;
  categories: string[];
  message: string;
  recommendedImmediateAction: string;
  continueNormalAssessment: boolean;
}

export interface CreateAssessmentResult {
  assessment: Assessment;
  caseId?: string | null;
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

export function screenAssessmentSafety(body: CreateAssessmentBody) {
  return apiClient.post<ApiSuccessResponse<SafetyScreeningResult>, CreateAssessmentBody>(
    "/assessments/safety-screening",
    body,
  );
}
