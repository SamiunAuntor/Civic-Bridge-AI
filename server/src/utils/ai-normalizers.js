const RISK_LEVELS = ["LOW", "MEDIUM", "HIGH"];
const ELIGIBILITY_LEVELS = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "INSUFFICIENT_INFORMATION",
];
const STABILITY_WEIGHTS = {
  housingStability: 0.25,
  incomeStability: 0.2,
  essentialNeedsStability: 0.15,
  healthcareStability: 0.15,
  personalSafety: 0.1,
  supportAndOptions: 0.1,
  timeUrgencyStability: 0.05,
};
const CRITICAL_CONDITION_PATTERNS = [
  /no safe shelter|unsafe shelter|homeless/i,
  /immediate eviction|immediate displacement|eviction now|displacement now/i,
  /immediate physical danger|violence|unsafe environment|assault/i,
  /severe medical emergency|medical emergency|emergency treatment/i,
  /essential medication unavailable|medication unavailable|can'?t get medication/i,
  /no food|no essential needs|no basic needs|food unavailable/i,
  /self-harm|suicide risk|suicidal/i,
  /immediate survival threat/i,
];

function normalizeRiskLevel(value) {
  const normalized = String(value || "").trim().toUpperCase();
  return RISK_LEVELS.includes(normalized) ? normalized : "MEDIUM";
}

function normalizeScore(value) {
  const numeric = Number(value);

  if (Number.isNaN(numeric)) {
    return 50;
  }

  return Math.max(0, Math.min(100, Math.round(numeric)));
}

function normalizeConfidence(value) {
  const numeric = Number(value);

  if (Number.isNaN(numeric)) {
    return 0.5;
  }

  return Math.max(0, Math.min(1, numeric));
}

function normalizeStringArray(value, limit = 8) {
  return Array.isArray(value)
    ? value.map((item) => String(item || "").trim()).filter(Boolean).slice(0, limit)
      : [];
}

function normalizeCaseTitle(value, summary) {
  const direct = String(value || "")
    .replace(/\s+/g, " ")
    .trim();
  const fallbackSource = String(summary || "")
    .replace(/\s+/g, " ")
    .trim();
  const candidate = direct || fallbackSource;

  if (!candidate) {
    return "Support Case";
  }

  const words = candidate
    .replace(/[^\w\s-]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 4);

  return words.join(" ").slice(0, 48) || "Support Case";
}

function normalizeDateValue(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function normalizeSubScores(value) {
  const source = value && typeof value === "object" ? value : {};

  return {
    housingStability: normalizeScore(source.housingStability),
    incomeStability: normalizeScore(source.incomeStability),
    essentialNeedsStability: normalizeScore(source.essentialNeedsStability),
    healthcareStability: normalizeScore(source.healthcareStability),
    personalSafety: normalizeScore(source.personalSafety),
    supportAndOptions: normalizeScore(source.supportAndOptions),
    timeUrgencyStability: normalizeScore(source.timeUrgencyStability),
  };
}

function calculateWeightedStabilityScore(subScores) {
  const total = Object.entries(STABILITY_WEIGHTS).reduce(
    (sum, [key, weight]) => sum + (subScores[key] ?? 0) * weight,
    0,
  );

  return normalizeScore(total);
}

function hasExplicitCriticalCondition(criticalConditions) {
  return criticalConditions.some((condition) =>
    CRITICAL_CONDITION_PATTERNS.some((pattern) => pattern.test(condition)),
  );
}

function hasMatchingCriticalCondition(criticalConditions, pattern) {
  return criticalConditions.some((condition) => pattern.test(condition));
}

function shouldApplyModerateFloor(subScores, criticalConditions) {
  return (
    !hasExplicitCriticalCondition(criticalConditions) &&
    subScores.incomeStability >= 25 &&
    subScores.essentialNeedsStability >= 40 &&
    subScores.housingStability >= 25 &&
    subScores.healthcareStability >= 25 &&
    subScores.supportAndOptions >= 25
  );
}

function applyStabilityGuardrails(score, subScores, criticalConditions) {
  let guardedScore = normalizeScore(score);
  const hasCriticalCondition = hasExplicitCriticalCondition(criticalConditions);

  if (guardedScore < 15 && !hasCriticalCondition) {
    guardedScore = 15;
  }

  if (guardedScore < 25 && shouldApplyModerateFloor(subScores, criticalConditions)) {
    guardedScore = 25;
  }

  if (
    subScores.healthcareStability <= 10 &&
    hasMatchingCriticalCondition(
      criticalConditions,
      /severe medical emergency|medical emergency|essential medication unavailable|medication unavailable/i,
    )
  ) {
    guardedScore = Math.min(guardedScore, 30);
  }

  return guardedScore;
}

function normalizeSituationAnalysis(output) {
  const subScores = normalizeSubScores(output?.subScores);
  const criticalConditions = normalizeStringArray(output?.criticalConditions, 8);
  const stabilizingFactors = normalizeStringArray(output?.stabilizingFactors, 10);
  const destabilizingFactors = normalizeStringArray(output?.destabilizingFactors, 10);
  const weightedScore = calculateWeightedStabilityScore(subScores);
  const stabilityScore = applyStabilityGuardrails(
    weightedScore,
    subScores,
    criticalConditions,
  );
  const explanation = String(output?.scoreExplanation || "").trim().slice(0, 1200);
  const summary = String(output?.summary || explanation || "").trim().slice(0, 800);
  const caseTitle = normalizeCaseTitle(output?.caseTitle, summary);

  return {
    caseTitle,
    subScores,
    stabilityScore,
    housingRisk: normalizeRiskLevel(output?.housingRisk),
    incomeRisk: normalizeRiskLevel(output?.incomeRisk),
    healthcareRisk: normalizeRiskLevel(output?.healthcareRisk),
    overallRisk: normalizeRiskLevel(output?.overallRisk),
    summary,
    destabilizingFactors,
    stabilizingFactors,
    criticalConditions,
    confidence: normalizeConfidence(output?.confidence),
    scoreExplanation: explanation || summary,
  };
}

function normalizePriorities(output) {
  const priorities = Array.isArray(output?.priorities) ? output.priorities : [];

  return {
    priorities: priorities
      .map((priority, index) => ({
        title: String(priority?.title || "").trim(),
        reasoning: String(priority?.reasoning || "").trim(),
        confidence: normalizeScore(priority?.confidence ?? priority?.confidence_score),
        priority_order: index + 1,
      }))
      .filter((priority) => priority.title && priority.reasoning)
      .slice(0, 6),
  };
}

function normalizeRoadmap(output) {
  const roadmap = Array.isArray(output?.roadmap) ? output.roadmap : [];

  return {
    roadmap: roadmap
      .map((item) => ({
        timeline: String(item?.timeline || "").trim().toUpperCase() || "NEXT",
        task: String(item?.task || "").trim(),
        due_at: normalizeDateValue(item?.dueAt ?? item?.due_at),
      }))
      .filter((item) => item.task)
      .slice(0, 10),
  };
}

function normalizeSimulation(output) {
  return {
    housingImpact: normalizeRiskLevel(output?.housingImpact ?? output?.housing_impact),
    incomeImpact: normalizeRiskLevel(output?.incomeImpact ?? output?.income_impact),
    healthImpact: normalizeRiskLevel(output?.healthImpact ?? output?.health_impact),
    summary: String(output?.summary || "").trim().slice(0, 1200),
    recommendedAction: String(
      output?.recommendedAction ?? output?.recommended_action ?? "",
    )
      .trim()
      .slice(0, 1200),
  };
}

function normalizeResourceRecommendations(output) {
  const resources = Array.isArray(output?.resources) ? output.resources : [];

  return {
    resources: resources
      .map((resource) => ({
        title: String(resource?.title ?? resource?.name ?? "")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 60),
        reason: String(resource?.reason || "")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 220),
        priority: normalizeRiskLevel(resource?.priority || "MEDIUM"),
        category: String(resource?.category || "")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 60),
        contact: String(resource?.contact || "")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 140),
        eligibility: String(resource?.eligibility || "")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 160),
      }))
      .filter(
        (resource) =>
          resource.title &&
          resource.reason &&
          !["none", "n/a", "no resource", "unknown"].includes(
            resource.title.toLowerCase(),
          ),
      )
      .slice(0, 8),
  };
}

function normalizeEligibility(output) {
  const likelihood = String(output?.likelihood || "").trim().toUpperCase();

  return {
    likelihood: ELIGIBILITY_LEVELS.includes(likelihood)
      ? likelihood
      : "INSUFFICIENT_INFORMATION",
    reasons: Array.isArray(output?.reasons)
      ? output.reasons.map((reason) => String(reason).trim()).filter(Boolean).slice(0, 6)
      : [],
    missingInformation: Array.isArray(output?.missingInformation)
      ? output.missingInformation
          .map((item) => String(item).trim())
          .filter(Boolean)
          .slice(0, 6)
      : [],
    requiredDocuments: Array.isArray(output?.requiredDocuments)
      ? output.requiredDocuments
          .map((item) => String(item).trim())
          .filter(Boolean)
          .slice(0, 8)
      : [],
    disclaimer: String(output?.disclaimer || "").trim().slice(0, 400),
  };
}

function normalizeApplicationAssistance(output) {
  return {
    checklist: Array.isArray(output?.checklist)
      ? output.checklist.map((item) => String(item).trim()).filter(Boolean).slice(0, 10)
      : [],
    emailDraft: String(output?.emailDraft || "").trim().slice(0, 2500),
    phoneScript: String(output?.phoneScript || "").trim().slice(0, 2500),
    requestLetter: String(output?.requestLetter || "").trim().slice(0, 2500),
    questionsToAsk: Array.isArray(output?.questionsToAsk)
      ? output.questionsToAsk
          .map((item) => String(item).trim())
          .filter(Boolean)
          .slice(0, 8)
      : [],
    documentChecklist: Array.isArray(output?.documentChecklist)
      ? output.documentChecklist
          .map((item) => String(item).trim())
          .filter(Boolean)
          .slice(0, 10)
      : [],
    disclaimer: String(output?.disclaimer || "").trim().slice(0, 400),
  };
}

module.exports = {
  calculateWeightedStabilityScore,
  normalizeApplicationAssistance,
  normalizeConfidence,
  normalizeEligibility,
  normalizePriorities,
  normalizeResourceRecommendations,
  normalizeRoadmap,
  normalizeSituationAnalysis,
  normalizeScore,
  normalizeSimulation,
  normalizeSubScores,
};
