const assessmentRepository = require("../repositories/assessment.repository");

const { analyzeSituation, } = require("./ai/situation-analysis.service");

const { generatePriorities, } = require("./ai/priority-engine.service");

const { saveRiskAssessment, } = require("./risk.service");

const { createRoadmap, } = require("./roadmap.service");

const { savePriorities, } = require("./priority.service");

const createAssessment = async (userId, situation) => {
    // 1. Analyze situation using Gemini
    const analysis = await analyzeSituation(situation);

    // 2. Save assessment
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

    // 3. Save risk assessment
    await saveRiskAssessment(
        assessment.id,
        analysis
    );

    // 4. Generate priorities
    const priorities =
        await generatePriorities(
            situation,
            analysis
        );

    await savePriorities(
        data.id,
        priorities.priorities
    );

    // 5. Generate roadmap
    const roadmap =
        await createRoadmap(
            assessment.id,
            situation,
            analysis,
            priorities.priorities
        );

    return {
        assessment,
        analysis,
        priorities,
        roadmap,
    };
};

module.exports = {
    createAssessment,
};