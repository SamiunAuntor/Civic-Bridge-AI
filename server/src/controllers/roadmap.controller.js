const roadmapRepository = require("../repositories/roadmap.repository");

const getRoadmap = async (req, res) => {
    try {
        const { assessmentId } =
            req.params;

        const { data, error } =
            await roadmapRepository.getRoadmapByAssessmentId(
                assessmentId
            );

        if (error) {
            throw error;
        }

        res.json({
            success: true,
            data,
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
    getRoadmap,
};