const roadmapRepository = require("../repositories/roadmap.repository");

const { verifyAssessmentOwnership, } = require("../services/ownership.service");

const getRoadmap = async (req, res) => {
    try {
        const { assessmentId } = req.params;

        await verifyAssessmentOwnership(
            assessmentId,
            req.dbUser.id
        );

        const { data, error } =
            await roadmapRepository.getRoadmapByAssessmentId(
                assessmentId
            );

        if (error) {
            throw error;
        }

        return res.json({
            success: true,
            data,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    getRoadmap,
};