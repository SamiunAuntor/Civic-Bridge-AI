const validateAssessment = (req, res, next) => {
    const { situation } =
        req.body;

    if (
        !situation ||
        situation.trim().length < 10
    ) {
        return res.status(400).json({
            success: false,
            message:
                "Situation must contain at least 10 characters",
        });
    }

    next();
};

module.exports =
    validateAssessment;