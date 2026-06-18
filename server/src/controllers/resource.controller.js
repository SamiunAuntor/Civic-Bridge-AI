const resourceRepository = require("../repositories/resource.repository");

const { matchResources, } = require("../services/ai/resource-matching.service");

const getRecommendations = async (req, res) => {
    try {
        const { situation, analysis, } = req.body;

        const { data: resources, } = await resourceRepository.getAllResources();

        const result =
            await matchResources(
                situation,
                analysis,
                resources
            );

        res.json({
            success: true,
            data: result,
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
    getRecommendations,
};