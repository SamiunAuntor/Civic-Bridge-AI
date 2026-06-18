const roadmapRepository = require("../repositories/roadmap.repository");

const { generateRoadmap, } = require("./ai/roadmap-generator.service");

const createRoadmap = async (assessmentId, situation, analysis, priorities) => {
    const roadmapResult =
        await generateRoadmap(
            situation,
            analysis,
            priorities
        );

    const roadmapTasks =
        roadmapResult.roadmap.map(
            (item) => ({
                assessment_id: assessmentId,
                timeline: item.timeline,
                task: item.task,
            })
        );

    await roadmapRepository.createRoadmapTasks(
        roadmapTasks
    );

    return roadmapResult;
};

module.exports = {
    createRoadmap,
};