const { buildResourcePrompt, } = require("../../prompts/resource-matching.prompt");
const { runPrompt } = require("../../utils/ai-executor");
const { normalizeResourceRecommendations } = require("../../utils/ai-normalizers");

const matchResources = async (situation, analysis) => {
    const normalized = await runPrompt({
        prompt: buildResourcePrompt(
            situation,
            analysis,
        ),
        validator: (payload) => typeof payload === "object" && payload !== null,
        normalizer: normalizeResourceRecommendations,
    });

    return {
        resources: normalized.resources.map((match) => ({
            resourceId: null,
            name: match.title,
            reason: match.reason,
            priority: match.priority,
            category: match.category,
            contact: match.contact,
            eligibility: match.eligibility,
        })),
    };
};

module.exports = {
    matchResources,
};
