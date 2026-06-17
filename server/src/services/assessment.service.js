const assessmentRepository = require("../repositories/assessment.repository");

const { analyzeSituation, } = require("./ai/situation-analysis.service");

const { generatePriorities, } = require("./ai/priority-engine.service");

const createAssessment = async (userId, situation) => {

    const analysis = await analyzeSituation(situation);

    const { data } =
        await assessmentRepository.createAssessment({
            user_id: userId,
            situation_text: situation,
            stability_score:
                analysis.stabilityScore,
        });

    return {
        assessment: data,
        analysis,
    };
};

module.exports = {
    createAssessment,
};