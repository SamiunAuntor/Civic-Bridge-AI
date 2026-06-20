export interface User {
  id: string;
  firebase_uid: string;
  email: string;
  name: string;
}

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

export type CaseStatus =
  | "ACTIVE"
  | "URGENT"
  | "STABLE"
  | "RESOLVED"
  | "ARCHIVED";

export interface Assessment {
  id: string;
  user_id: string;
  case_id?: string | null;
  situation_text: string;
  stability_score: number;
  assessment_kind?: "INITIAL" | "REASSESSMENT";
  change_note?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface RiskAnalysis {
  stabilityScore: number;
  housingRisk: RiskLevel | null;
  incomeRisk: RiskLevel | null;
  healthcareRisk: RiskLevel | null;
  overallRisk: RiskLevel | null;
  summary: string;
}

export interface CaseInitialSnapshot {
  assessment: Assessment;
  analysis: RiskAnalysis;
}

export interface CaseRecord {
  id: string;
  user_id: string;
  title: string;
  summary?: string | null;
  status: CaseStatus;
  main_risk?: RiskLevel | string | null;
  initial_stability_score?: number | null;
  latest_stability_score?: number | null;
  current_assessment_id?: string | null;
  last_activity_at: string;
  archived_at?: string | null;
  resolved_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface Priority {
  id?: string;
  assessment_id?: string;
  order?: number;
  priority_order?: number;
  title: string;
  reasoning: string;
  confidence?: number;
  confidence_score?: number;
}

export interface RoadmapItem {
  id?: string;
  assessment_id?: string;
  timeline: string;
  task: string;
  status?: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "BLOCKED";
  due_at?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  user_note?: string | null;
  outcome?: string | null;
  sort_order?: number | null;
  is_user_created?: boolean;
  updated_at?: string | null;
}

export interface Simulation {
  id?: string;
  assessment_id?: string;
  assessmentVersion?: string | null;
  decision: string;
  housingImpact?: string;
  incomeImpact?: string;
  healthImpact?: string;
  housing_impact?: string;
  income_impact?: string;
  health_impact?: string;
  summary: string;
  recommendedAction?: string;
  recommended_action?: string;
}

export interface ResourceRecommendation {
  resourceId?: string | null;
  name: string;
  reason: string;
  priority: string;
  category?: string | null;
  contact?: string | null;
  eligibility?: string | null;
}

export interface ResourceInteraction {
  id?: string;
  case_id?: string;
  resource_id?: string;
  status?: "SAVED" | "CONTACTED" | "WAITING_FOR_RESPONSE" | "COMPLETED" | "REJECTED";
  contacted_at?: string | null;
  follow_up_at?: string | null;
  response_note?: string | null;
  application_reference?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  resource?: {
    id?: string;
    title?: string | null;
    name?: string | null;
    category?: string | null;
    contact_info?: string | null;
  } | null;
}

export interface TimelineEvent {
  id: string;
  case_id: string;
  assessment_id?: string | null;
  roadmap_id?: string | null;
  resource_interaction_id?: string | null;
  event_type: string;
  payload?: Record<string, unknown> | null;
  created_by?: string | null;
  created_at?: string | null;
}

export interface ReassessmentComparison {
  previousAssessmentId?: string;
  previousStabilityScore: number;
  currentStabilityScore: number;
  scoreDelta: number;
  previousHousingRisk?: string | null;
  currentHousingRisk?: string | null;
  previousIncomeRisk?: string | null;
  currentIncomeRisk?: string | null;
  previousHealthcareRisk?: string | null;
  currentHealthcareRisk?: string | null;
  previousOverallRisk?: string | null;
  currentOverallRisk?: string | null;
  summary: string;
}

export interface EligibilityGuidance {
  likelihood: "LOW" | "MEDIUM" | "HIGH" | "INSUFFICIENT_INFORMATION";
  reasons: string[];
  missingInformation: string[];
  requiredDocuments: string[];
  disclaimer: string;
}

export interface ApplicationAssistance {
  checklist: string[];
  emailDraft: string;
  phoneScript: string;
  requestLetter: string;
  questionsToAsk: string[];
  documentChecklist: string[];
  disclaimer: string;
}

export interface CaseWorkspacePayload {
  case: CaseRecord;
  initialSnapshot?: CaseInitialSnapshot;
  latestAssessment: Assessment;
  analysis: RiskAnalysis;
  priorities: Priority[];
  roadmap: RoadmapItem[];
  simulations: Simulation[];
  resourceInteractions: ResourceInteraction[];
  resourceInteractionsAvailable?: boolean;
  comparison?: ReassessmentComparison | null;
}
