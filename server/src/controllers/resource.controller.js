const { matchResources, } = require("../services/ai/resource-matching.service");
const { sendError } = require("../utils/http-error");

const getRecommendations = async (req, res) => {
    try {
        const { situation, analysis, } = req.body;

        const result =
            await matchResources(
                situation,
                analysis,
            );

        res.json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error(error);

        return sendError(
            res,
            error,
            "Unable to match resources right now."
        );
    }
};

module.exports = {
    getRecommendations,
};
