const assessmentRepository = require("../repositories/assessment.repository");

const verifyAssessmentOwnership = async (assessmentId, userId) => {
    const {
        data: assessment,
        error,
    } =
        await assessmentRepository.getAssessmentById(
            assessmentId
        );

    if (error || !assessment) {
        const err = new Error(
            "Assessment not found"
        );

        err.statusCode = 404;

        throw err;
    }

    if (
        assessment.user_id !== userId
    ) {
        const err = new Error(
            "Access denied"
        );

        err.statusCode = 403;

        throw err;
    }

    return assessment;
};

module.exports = {
    verifyAssessmentOwnership,
};