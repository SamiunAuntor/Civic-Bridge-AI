const assessmentRepository = require("../repositories/assessment.repository");

const riskRepository = require("../repositories/risk.repository");

const simulationService = require("../services/simulation.service");

const createSimulation = async (req, res) => {
    try {
        const {
            assessmentId,
            decision,
        } = req.body;

        const {
            data: assessment,
        } =
            await assessmentRepository.getAssessmentById(
                assessmentId
            );

        const {
            data: riskAnalysis,
        } =
            await riskRepository.getRiskAssessment(
                assessmentId
            );

        const result =
            await simulationService.createSimulation({
                assessment,
                analysis: riskAnalysis,
                decision,
            });

        res.json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    createSimulation,
};