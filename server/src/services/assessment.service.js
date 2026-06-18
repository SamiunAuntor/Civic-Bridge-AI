const assessmentRepository = require("../repositories/assessment.repository");

const priorityRepository = require("../repositories/priority.repository");

const { saveRiskAssessment, } = require("./risk.service");

const { analyzeSituation, } = require("./ai/situation-analysis.service");

const { generatePriorities, } = require("./ai/priority-engine.service");

const createAssessment = async (userId, situation) => {

    const analysis = await analyzeSituation(situation);

    const { data: assessment } =
        await assessmentRepository.createAssessment({
            user_id: userId,
            situation_text: situation,
            stability_score:
                analysis.stabilityScore,
        });

        await saveRiskAssessment(
            assessment.id,
            analysis
        );

    const priorityResult =
        await generatePriorities(
            situation,
            analysis
        );

    const priorities = priorityResult.priorities;

    await priorityRepository.createPriorities(
        priorities.map((priority) => ({
            assessment_id: assessment.id,
            priority_order: priority.order,
            title: priority.title,
            reasoning: priority.reasoning,
            confidence_score:
                priority.confidence,
        }))
    );

    return {
        assessment,
        analysis,
        priorities,
    };
};

module.exports = {
    createAssessment,
};