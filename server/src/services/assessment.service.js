const assessmentRepository = require("../repositories/assessment.repository");
const priorityRepository = require("../repositories/priority.repository");
const riskRepository = require("../repositories/risk.repository");
const roadmapRepository = require("../repositories/roadmap.repository");

const { analyzeSituation, } = require("./ai/situation-analysis.service");

const { generatePriorities, } = require("./ai/priority-engine.service");

const { saveRiskAssessment, } = require("./risk.service");

const { createRoadmap, } = require("./roadmap.service");

const { savePriorities, } = require("./priority.service");
const caseRepository = require("../repositories/case.repository");
const { maybeCreateCaseForAssessment, deriveCaseStatus, } = require("./case.service");
const { addTimelineEvent, } = require("./timeline.service");

function buildAssessmentInput(situation, intakeProfile) {
    if (!intakeProfile || typeof intakeProfile !== "object") {
        return String(situation || "").trim();
    }

    const concernList =
        Array.isArray(intakeProfile.primaryConcerns) && intakeProfile.primaryConcerns.length
            ? intakeProfile.primaryConcerns.join(", ")
            : "Not specified";

    const structuredLines = [
        ["Case topic", intakeProfile.topic],
        ["Primary concerns", concernList],
        ["Time pressure", intakeProfile.timePressure],
        ["Housing status", intakeProfile.housingStatus],
        ["Income status", intakeProfile.incomeStatus],
        ["Essential needs", intakeProfile.essentialNeedsStatus],
        ["Healthcare access", intakeProfile.healthcareStatus],
        ["Personal safety", intakeProfile.safetyStatus],
        ["Support network", intakeProfile.supportLevel],
    ]
        .filter(([, value]) => typeof value === "string" && value.trim().length)
        .map(([label, value]) => `- ${label}: ${String(value).trim()}`);

    if (!structuredLines.length) {
        return String(situation || "").trim();
    }

    return `${String(situation || "").trim()}\n\nStructured intake signals:\n${structuredLines.join("\n")}`;
}

async function cleanupAssessmentWrite(assessmentId) {
    await Promise.allSettled([
        roadmapRepository.deleteRoadmapByAssessmentId(assessmentId),
        priorityRepository.deletePrioritiesByAssessmentId(assessmentId),
        riskRepository.deleteRiskAssessmentByAssessmentId(assessmentId),
    ]);

    await assessmentRepository.deleteAssessmentById(assessmentId);
}

async function carryForwardRoadmapProgress(previousAssessmentId, nextAssessmentId) {
    const [
        { data: previousRoadmap, error: previousRoadmapError },
        { data: nextRoadmap, error: nextRoadmapError },
    ] = await Promise.all([
        roadmapRepository.getRoadmapByAssessmentId(previousAssessmentId),
        roadmapRepository.getRoadmapByAssessmentId(nextAssessmentId),
    ]);

    if (previousRoadmapError) {
        throw previousRoadmapError;
    }

    if (nextRoadmapError) {
        throw nextRoadmapError;
    }

    const previousItems = previousRoadmap || [];
    const nextItems = nextRoadmap || [];
    const patches = nextItems
        .map((item, index) => {
            const previousItem = previousItems[index];

            if (!item?.id || !previousItem) {
                return null;
            }

            const previousStatus = previousItem.status || "NOT_STARTED";
            const patch = {};

            if (previousStatus !== "NOT_STARTED") {
                patch.status = previousStatus;
                patch.started_at = previousItem.started_at || new Date().toISOString();
                patch.completed_at =
                    previousStatus === "COMPLETED"
                        ? previousItem.completed_at || new Date().toISOString()
                        : null;
            }

            if (previousItem.user_note) {
                patch.user_note = previousItem.user_note;
            }

            if (previousItem.outcome) {
                patch.outcome = previousItem.outcome;
            }

            if (!Object.keys(patch).length) {
                return null;
            }

            patch.updated_at = new Date().toISOString();

            return roadmapRepository.updateRoadmapTask(item.id, patch);
        })
        .filter(Boolean);

    if (patches.length) {
        await Promise.all(patches);
    }

    const { data: carriedRoadmap, error: carriedRoadmapError } =
        await roadmapRepository.getRoadmapByAssessmentId(nextAssessmentId);

    if (carriedRoadmapError) {
        throw carriedRoadmapError;
    }

    return carriedRoadmap || [];
}

async function buildAssessmentSnapshot({
    userId,
    situation,
    intakeProfile = null,
    caseContext = null,
    assessmentKind = "INITIAL",
    changeNote = null,
    previousAssessmentId = null,
}) {
    const assessmentInput = buildAssessmentInput(situation, intakeProfile);
    const analysis = await analyzeSituation(assessmentInput);

    const {
        data: assessment,
        error: assessmentError,
    } = await assessmentRepository.createAssessment({
        user_id: userId,
        situation_text: situation,
        stability_score:
            analysis.stabilityScore,
    });

    if (assessmentError) {
        throw assessmentError;
    }

    try {
        await saveRiskAssessment(
            assessment.id,
            analysis
        );

        const priorities =
            await generatePriorities(
                assessmentInput,
                analysis
            );

        await savePriorities(
            assessment.id,
            priorities.priorities
        );

        await createRoadmap(
            assessment.id,
            assessmentInput,
            analysis,
            priorities.priorities
        );

        const { data: persistedRoadmap, error: persistedRoadmapError } =
            await roadmapRepository.getRoadmapByAssessmentId(assessment.id);

        if (persistedRoadmapError) {
            throw persistedRoadmapError;
        }

        const roadmap = previousAssessmentId
            ? {
                roadmap: await carryForwardRoadmapProgress(
                    previousAssessmentId,
                    assessment.id
                ),
            }
            : {
                roadmap: persistedRoadmap || [],
            };

        return {
            assessment,
            analysis,
            priorities,
            roadmap,
            caseContext,
            assessmentKind,
            changeNote,
            previousAssessmentId,
        };
    } catch (error) {
        await cleanupAssessmentWrite(assessment.id);
        throw error;
    }
}

const createAssessment = async (userId, situation, intakeProfile = null) => {
    const {
        assessment,
        analysis,
        priorities,
        roadmap,
    } = await buildAssessmentSnapshot({
        userId,
        situation,
        intakeProfile,
    });

    const caseRecord =
        await maybeCreateCaseForAssessment({
            userId,
            assessment,
            situation,
            analysis,
        });

    return {
        assessment,
        analysis,
        priorities,
        roadmap,
        caseId:
            caseRecord?.id || null,
    };
};

async function createReassessment({
    caseRecord,
    userId,
    whatChanged,
    updatedSituationDetails,
    userNote,
}) {
    const { data: previousAssessment } =
        await assessmentRepository.getAssessmentById(caseRecord.current_assessment_id);

    if (!previousAssessment) {
        throw new Error("Previous assessment not found");
    }

    const nextSituation =
        String(updatedSituationDetails || "").trim() ||
        `${previousAssessment.situation_text}\n\nWhat changed:\n${whatChanged}`;

    const {
        assessment,
        analysis,
        priorities,
        roadmap,
    } = await buildAssessmentSnapshot({
        userId,
        situation: nextSituation,
        caseContext: caseRecord,
        assessmentKind: "REASSESSMENT",
        changeNote: userNote || whatChanged,
        previousAssessmentId: previousAssessment.id,
    });

    const { error: linkError } =
        await caseRepository.linkAssessmentToCase({
            assessmentId: assessment.id,
            caseId: caseRecord.id,
            assessmentKind: "REASSESSMENT",
            changeNote: userNote || whatChanged,
            previousAssessmentId: previousAssessment.id,
        });

    if (linkError) {
        await cleanupAssessmentWrite(assessment.id);
        throw linkError;
    }

    const patch = {
        current_assessment_id: assessment.id,
        summary: analysis.summary,
        status: deriveCaseStatus(analysis),
        main_risk: analysis.overallRisk,
        latest_stability_score: analysis.stabilityScore,
        last_activity_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };

    const { data: updatedCase, error: updateCaseError } =
        await caseRepository.updateCaseById(caseRecord.id, patch);

    if (updateCaseError) {
        await cleanupAssessmentWrite(assessment.id);
        throw updateCaseError;
    }

    await addTimelineEvent({
        case_id: caseRecord.id,
        assessment_id: assessment.id,
        event_type: "REASSESSMENT_COMPLETED",
        payload: {
            previousAssessmentId: previousAssessment.id,
            stabilityScore: analysis.stabilityScore,
            overallRisk: analysis.overallRisk,
        },
        created_by: userId,
    });

    return {
        assessment,
        analysis,
        priorities,
        roadmap,
        case: updatedCase,
        comparison: {
            previousAssessmentId: previousAssessment.id,
            previousStabilityScore: Number(previousAssessment.stability_score),
            currentStabilityScore: analysis.stabilityScore,
            scoreDelta:
                analysis.stabilityScore - Number(previousAssessment.stability_score),
        },
    };
}

module.exports = {
    createAssessment,
    createReassessment,
    cleanupAssessmentWrite,
};
