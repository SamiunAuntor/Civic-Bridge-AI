const supabase = require("../config/supabase");

const createRoadmapTasks = async (tasks) => {
    return await supabase
        .from("roadmaps")
        .insert(tasks)
        .select();
};

const getRoadmapByAssessmentId = async (assessmentId) => {
    return await supabase
        .from("roadmaps")
        .select("*")
        .eq("assessment_id", assessmentId);
};

module.exports = {
    createRoadmapTasks,
    getRoadmapByAssessmentId,
};