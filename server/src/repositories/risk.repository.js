const supabase = require("../config/supabase");

const createRiskAssessment = async (riskData) => {
    return await supabase
        .from("risk_assessments")
        .insert(riskData)
        .select()
        .single();
};

const getRiskAssessment = async (assessmentId) => {
    return await supabase
        .from("risk_assessments")
        .select("*")
        .eq("assessment_id", assessmentId)
        .single();
};

module.exports = {
    createRiskAssessment,
    getRiskAssessment,
};