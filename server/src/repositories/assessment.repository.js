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

const getAssessmentsByCaseId = async (caseId) => {
    return await supabase
        .from("assessments")
        .select("*")
        .eq("case_id", caseId)
        .order("created_at", { ascending: false });
};

const getInitialAssessmentByCaseId = async (caseId) => {
    const { data, error } = await supabase
        .from("assessments")
        .select("*")
        .eq("case_id", caseId)
        .eq("assessment_kind", "INITIAL")
        .order("created_at", { ascending: true })
        .limit(1);

    if (data?.length) {
        return {
            data: data[0],
            error: null,
        };
    }

    const fallback = await supabase
        .from("assessments")
        .select("*")
        .eq("case_id", caseId)
        .order("created_at", { ascending: true })
        .limit(1);

    return {
        data: fallback.data?.[0] ?? null,
        error: fallback.error ?? null,
    };
};

const deleteAssessmentById = async (assessmentId) => {
    return await supabase
        .from("assessments")
        .delete()
        .eq("id", assessmentId);
};

module.exports = {
    createAssessment,
    getAssessmentById,
    getAssessmentsByCaseId,
    getInitialAssessmentByCaseId,
    deleteAssessmentById,
};
