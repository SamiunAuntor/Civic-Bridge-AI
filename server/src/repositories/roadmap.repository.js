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
        .eq("assessment_id", assessmentId)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });
};

const deleteRoadmapByAssessmentId = async (assessmentId) => {
    return await supabase
        .from("roadmaps")
        .delete()
        .eq("assessment_id", assessmentId);
};

const getRoadmapTaskById = async (roadmapId) => {
    return await supabase
        .from("roadmaps")
        .select("*")
        .eq("id", roadmapId)
        .single();
};

const updateRoadmapTask = async (roadmapId, patch) => {
    return await supabase
        .from("roadmaps")
        .update(patch)
        .eq("id", roadmapId)
        .select()
        .single();
};

const isTaskProgressSchemaReady = async () => {
    const { error } = await supabase
        .from("roadmaps")
        .select("id,status,due_at,started_at,completed_at,user_note,outcome,updated_at")
        .limit(1);

    return !error;
};

module.exports = {
    createRoadmapTasks,
    getRoadmapByAssessmentId,
    deleteRoadmapByAssessmentId,
    getRoadmapTaskById,
    updateRoadmapTask,
    isTaskProgressSchemaReady,
};
