const model = require("../../config/gemini");

const { buildResourcePrompt, } = require("../../prompts/resource-matching.prompt");

const matchResources = async (situation, analysis, resources) => {
    const prompt =
        buildResourcePrompt(
            situation,
            analysis,
            resources
        );

    const result = await model.generateContent(prompt);

    const response = result.response.text();

    const cleaned = response
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

    return JSON.parse(cleaned);
};

module.exports = {
    matchResources,
};