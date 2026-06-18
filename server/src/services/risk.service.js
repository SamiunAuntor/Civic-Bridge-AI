const riskRepository = require("../repositories/risk.repository");

const saveRiskAssessment = async (assessmentId, analysis) => {
    return await riskRepository.createRiskAssessment({
        assessment_id: assessmentId,

        housing_risk:
            analysis.housingRisk,

        income_risk:
            analysis.incomeRisk,

        healthcare_risk:
            analysis.healthcareRisk,

        overall_risk:
            analysis.overallRisk,
    });
};

module.exports = {
    saveRiskAssessment,
};