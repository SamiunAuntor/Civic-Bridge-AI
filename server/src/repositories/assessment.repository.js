const supabase = require("../config/supabase");

const createAssessment = async (assessmentData) => {
    return await supabase
        .from("assessments")
        .insert(assessmentData)
        .select()
        .single();
};

const getAssessmentById = async (assessmentId) => {
    return await supabase
        .from("assessments")
        .select("*")
        .eq("id", assessmentId)
        .single();
};

module.exports = {
    createAssessment,
    getAssessmentById
};