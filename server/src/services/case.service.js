const assessmentRepository = require("../repositories/assessment.repository");
const caseRepository = require("../repositories/case.repository");
const priorityRepository = require("../repositories/priority.repository");
const resourceInteractionRepository = require("../repositories/resource-interaction.repository");
const riskRepository = require("../repositories/risk.repository");
const roadmapRepository = require("../repositories/roadmap.repository");
const simulationRepository = require("../repositories/simulation.repository");
const {
  enableCaseHistory,
  enableResourceInteractions,
} = require("../config/features");
const { createHttpError } = require("../utils/http-error");
const { addTimelineEvent } = require("./timeline.service");

function buildFallbackCaseTitle(situation) {
  const compact = String(situation || "")
    .replace(/\s+/g, " ")
    .trim();

  if (!compact) {
    return "Support Case";
  }

  const words = compact
    .replace(/[^\w\s-]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 4);

  return words.join(" ").slice(0, 48) || "Support Case";
}

function buildCaseTitle(analysis, situation) {
  const aiTitle = String(analysis?.caseTitle || "")
    .replace(/\s+/g, " ")
    .trim();

  if (aiTitle) {
    return aiTitle;
  }

  return buildFallbackCaseTitle(situation);
}

function deriveCaseStatus(analysis) {
  if (analysis?.overallRisk === "HIGH") {
    return "URGENT";
  }

  if (analysis?.overallRisk === "LOW") {
    return "STABLE";
  }

  return "ACTIVE";
}

async function ensureCaseHistoryAvailable() {
  if (!enableCaseHistory) {
    throw createHttpError(
      503,
      "Case history is disabled",
      "Case history is not available yet.",
    );
  }

  const schemaReady = await caseRepository.isCaseHistorySchemaReady();

  if (!schemaReady) {
    throw createHttpError(
      503,
      "Case history schema is unavailable",
      "Case history is not available yet.",
    );
  }
}

async function createCaseForAssessment({ userId, assessment, situation, analysis }) {
  const casePayload = {
    user_id: userId,
    title: buildCaseTitle(analysis, situation),
    summary: analysis.summary ?? null,
    status: deriveCaseStatus(analysis),
    main_risk: analysis.overallRisk ?? null,
    initial_stability_score: analysis.stabilityScore ?? null,
    latest_stability_score: analysis.stabilityScore ?? null,
    current_assessment_id: assessment.id,
    last_activity_at:
      assessment.updated_at || assessment.created_at || new Date().toISOString(),
  };

  let createdCase;
  let error;
  ({ data: createdCase, error } = await caseRepository.createCase(casePayload));

  if (
    error &&
    String(error.message || "").toLowerCase().includes("initial_stability_score")
  ) {
    ({ data: createdCase, error } = await caseRepository.createCase({
      user_id: casePayload.user_id,
      title: casePayload.title,
      summary: casePayload.summary,
      status: casePayload.status,
      main_risk: casePayload.main_risk,
      latest_stability_score: casePayload.latest_stability_score,
      current_assessment_id: casePayload.current_assessment_id,
      last_activity_at: casePayload.last_activity_at,
    }));
  }

  if (error) {
    throw error;
  }

  const { error: linkError } = await caseRepository.linkAssessmentToCase({
    assessmentId: assessment.id,
    caseId: createdCase.id,
  });

  if (linkError) {
    throw linkError;
  }

  await addTimelineEvent({
    case_id: createdCase.id,
    assessment_id: assessment.id,
    event_type: "CASE_CREATED",
    payload: {
      title: createdCase.title,
      status: createdCase.status,
    },
    created_by: userId,
  });

  await addTimelineEvent({
    case_id: createdCase.id,
    assessment_id: assessment.id,
    event_type: "ASSESSMENT_CREATED",
    payload: {
      assessmentKind: "INITIAL",
      stabilityScore: analysis.stabilityScore,
      overallRisk: analysis.overallRisk,
    },
    created_by: userId,
  });

  return createdCase;
}

async function maybeCreateCaseForAssessment({ userId, assessment, situation, analysis }) {
  if (!enableCaseHistory) {
    return null;
  }

  const schemaReady = await caseRepository.isCaseHistorySchemaReady();

  if (!schemaReady) {
    return null;
  }

  return createCaseForAssessment({
    userId,
    assessment,
    situation,
    analysis,
  });
}

async function listCasesForUser(userId, query) {
  await ensureCaseHistoryAvailable();

  const page = Number.parseInt(query.page || "1", 10);
  const limit = Number.parseInt(query.limit || "10", 10);
  const archived = ["true", "1"].includes(String(query.archived).toLowerCase());
  const sort = query.sort || "updated_desc";

  const { data, error, count } = await caseRepository.listCasesForUser({
    userId,
    page,
    limit,
    status: query.status,
    archived,
    sort,
  });

  if (error) {
    throw error;
  }

  return {
    items: data,
    pagination: {
      page,
      limit,
      total: count ?? data.length,
      totalPages: Math.max(1, Math.ceil((count ?? data.length) / limit)),
      hasNextPage: count ? page * limit < count : false,
      hasPreviousPage: page > 1,
    },
  };
}

async function getCaseWorkspace(caseId, userId) {
  await ensureCaseHistoryAvailable();

  const { data: caseRecord, error } = await caseRepository.getCaseByIdForUser(
    caseId,
    userId,
  );

  if (error || !caseRecord) {
    throw createHttpError(404, "Case not found");
  }

  const { data: assessment, error: assessmentError } =
    await caseRepository.getLatestAssessmentForCase(
      caseRecord.id,
      caseRecord.current_assessment_id,
    );

  if (assessmentError || !assessment) {
    throw createHttpError(404, "Assessment not found");
  }

  let resourceInteractionsAvailable = false;
  const resourceInteractionsPromise =
    enableResourceInteractions
      ? resourceInteractionRepository.isResourceInteractionsSchemaReady().then((ready) => {
          if (!ready) {
            return {
              data: [],
              error: null,
              available: false,
            };
          }

          resourceInteractionsAvailable = true;
          return resourceInteractionRepository
            .listResourceInteractionsByCaseId(caseRecord.id)
            .then(({ data, error }) => ({
              data,
              error,
              available: true,
            }));
        })
      : Promise.resolve({
          data: [],
          error: null,
          available: false,
        });

  const [
    { data: riskAnalysis, error: riskError },
    { data: priorities, error: prioritiesError },
    { data: roadmap, error: roadmapError },
    { data: simulations, error: simulationsError },
    { data: resourceInteractions, error: resourceInteractionsError },
    { data: initialAssessment, error: initialAssessmentError },
  ] = await Promise.all([
    riskRepository.getRiskAssessment(assessment.id),
    priorityRepository.getPrioritiesByAssessmentId(assessment.id),
    roadmapRepository.getRoadmapByAssessmentId(assessment.id),
    simulationRepository.getSimulationsByAssessmentId(assessment.id),
    resourceInteractionsPromise,
    assessmentRepository.getInitialAssessmentByCaseId(caseRecord.id),
  ]);

  if (riskError) {
    throw riskError;
  }

  if (prioritiesError) {
    throw prioritiesError;
  }

  if (roadmapError) {
    throw roadmapError;
  }

  if (simulationsError) {
    throw simulationsError;
  }

  if (resourceInteractionsError) {
    throw resourceInteractionsError;
  }

  if (initialAssessmentError) {
    throw initialAssessmentError;
  }

  const initialStabilityScore =
    caseRecord.initial_stability_score ?? initialAssessment?.stability_score ?? null;

  const { data: initialRiskAnalysis, error: initialRiskError } = initialAssessment
    ? await riskRepository.getRiskAssessment(initialAssessment.id)
    : { data: null, error: null };

  if (initialRiskError) {
    throw initialRiskError;
  }

  let comparison = null;
  if (
    assessment.assessment_kind === "REASSESSMENT" &&
    assessment.previous_assessment_id
  ) {
    const [
      { data: previousAssessment, error: previousAssessmentError },
      { data: previousRisk, error: previousRiskError },
    ] = await Promise.all([
      assessmentRepository.getAssessmentById(assessment.previous_assessment_id),
      riskRepository.getRiskAssessment(assessment.previous_assessment_id),
    ]);

    if (previousAssessmentError) {
      throw previousAssessmentError;
    }

    if (previousRiskError) {
      throw previousRiskError;
    }

    if (previousAssessment) {
      comparison = {
        previousAssessmentId: previousAssessment.id,
        previousStabilityScore: Number(previousAssessment.stability_score),
        currentStabilityScore: Number(assessment.stability_score),
        scoreDelta:
          Number(assessment.stability_score) - Number(previousAssessment.stability_score),
        previousHousingRisk: previousRisk?.housing_risk || null,
        currentHousingRisk: riskAnalysis?.housing_risk || null,
        previousIncomeRisk: previousRisk?.income_risk || null,
        currentIncomeRisk: riskAnalysis?.income_risk || null,
        previousHealthcareRisk: previousRisk?.healthcare_risk || null,
        currentHealthcareRisk: riskAnalysis?.healthcare_risk || null,
        previousOverallRisk: previousRisk?.overall_risk || null,
        currentOverallRisk: riskAnalysis?.overall_risk || null,
        summary:
          Number(assessment.stability_score) > Number(previousAssessment.stability_score)
            ? "Overall stability appears to have improved."
            : Number(assessment.stability_score) < Number(previousAssessment.stability_score)
              ? "Overall stability appears to have worsened."
              : "Overall stability appears unchanged.",
      };
    }
  }

  return {
    case: {
      ...caseRecord,
      initial_stability_score:
        initialStabilityScore !== null ? Number(initialStabilityScore) : null,
    },
    initialSnapshot: {
      assessment: initialAssessment || assessment,
      analysis: {
        stabilityScore:
          initialStabilityScore !== null
            ? Number(initialStabilityScore)
            : Number(assessment.stability_score),
        housingRisk: initialRiskAnalysis?.housing_risk || riskAnalysis?.housing_risk || null,
        incomeRisk: initialRiskAnalysis?.income_risk || riskAnalysis?.income_risk || null,
        healthcareRisk:
          initialRiskAnalysis?.healthcare_risk || riskAnalysis?.healthcare_risk || null,
        overallRisk: initialRiskAnalysis?.overall_risk || riskAnalysis?.overall_risk || null,
        summary: "",
      },
    },
    latestAssessment: assessment,
    analysis: {
      stabilityScore: Number(assessment.stability_score),
      housingRisk: riskAnalysis?.housing_risk || null,
      incomeRisk: riskAnalysis?.income_risk || null,
      healthcareRisk: riskAnalysis?.healthcare_risk || null,
      overallRisk: riskAnalysis?.overall_risk || null,
      summary: caseRecord.summary || "",
    },
    priorities,
    roadmap,
    simulations,
    resourceInteractions: resourceInteractions || [],
    resourceInteractionsAvailable,
    comparison,
  };
}

async function updateCase(caseId, userId, updates) {
  await ensureCaseHistoryAvailable();

  const { data: existingCase, error } = await caseRepository.getCaseByIdForUser(
    caseId,
    userId,
  );

  if (error || !existingCase) {
    throw createHttpError(404, "Case not found");
  }

  const nextStatus = updates.status || existingCase.status;
  const nextTitle =
    updates.title !== undefined ? String(updates.title).trim() : existingCase.title;
  const patch = {
    title: nextTitle,
    status: nextStatus,
    updated_at: new Date().toISOString(),
    last_activity_at: new Date().toISOString(),
  };

  if (nextStatus === "ARCHIVED") {
    patch.archived_at = existingCase.archived_at || new Date().toISOString();
  } else if (existingCase.archived_at) {
    patch.archived_at = null;
  }

  if (nextStatus === "RESOLVED") {
    patch.resolved_at = existingCase.resolved_at || new Date().toISOString();
  } else if (existingCase.resolved_at) {
    patch.resolved_at = null;
  }

  const { data: updatedCase, error: updateError } =
    await caseRepository.updateCaseById(caseId, patch);

  if (updateError) {
    throw updateError;
  }

  if (existingCase.status !== nextStatus) {
    await addTimelineEvent({
      case_id: caseId,
      event_type: "CASE_STATUS_CHANGED",
      payload: {
        previousStatus: existingCase.status,
        status: nextStatus,
      },
      created_by: userId,
    });
  }

  return updatedCase;
}

module.exports = {
  buildCaseTitle,
  createCaseForAssessment,
  deriveCaseStatus,
  ensureCaseHistoryAvailable,
  maybeCreateCaseForAssessment,
  listCasesForUser,
  getCaseWorkspace,
  updateCase,
};
