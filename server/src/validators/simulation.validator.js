const validateSimulation = (req, res, next) => {
    const {
        assessmentId,
        decision,
    } = req.body;

    if (!assessmentId) {
        return res.status(400).json({
            success: false,
            message:
                "assessmentId required",
        });
    }

    if (!decision) {
        return res.status(400).json({
            success: false,
            message:
                "decision required",
        });
    }

    next();
};

module.exports =
    validateSimulation;