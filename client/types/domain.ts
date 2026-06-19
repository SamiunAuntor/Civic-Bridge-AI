export interface User {
  id: string;
  firebase_uid: string;
  email: string;
  name: string;
}

export interface Assessment {
  id: string;
  user_id: string;
  situation_text: string;
  stability_score: number;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface RiskAnalysis {
  stabilityScore: number;
  housingRisk: "LOW" | "MEDIUM" | "HIGH";
  incomeRisk: "LOW" | "MEDIUM" | "HIGH";
  healthcareRisk: "LOW" | "MEDIUM" | "HIGH";
  overallRisk: "LOW" | "MEDIUM" | "HIGH";
  summary: string;
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
}

export interface Simulation {
  id?: string;
  assessment_id?: string;
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
  name: string;
  reason: string;
  priority: string;
}
