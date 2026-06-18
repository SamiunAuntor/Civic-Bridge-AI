const simulationRepository = require("../repositories/simulation.repository");

const { simulateDecision, } = require("./ai/consequence-simulator.service");

const createSimulation = async ({ assessment, analysis, decision, }) => {
    const simulation =
        await simulateDecision(
            assessment.situation_text,
            analysis,
            decision
        );

    const { data } =
        await simulationRepository.createSimulation({
            assessment_id: assessment.id,

            decision,

            housing_impact:
                simulation.housingImpact,

            income_impact:
                simulation.incomeImpact,

            health_impact:
                simulation.healthImpact,

            summary:
                simulation.summary,

            recommended_action:
                simulation.recommendedAction,
        });

    return {
        simulation,
        savedSimulation: data,
    };
};

module.exports = {
    createSimulation,
};