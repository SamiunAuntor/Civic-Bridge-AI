const priorityRepository = require("../repositories/priority.repository");

const getPriorities = async (req, res) => {
    try {
        const { assessmentId } =
            req.params;

        const { data } =
            await priorityRepository.getPrioritiesByAssessmentId(
                assessmentId
            );

        res.json({
            success: true,
            data,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message:
                error.message,
        });
    }
};

module.exports = {
    getPriorities,
};