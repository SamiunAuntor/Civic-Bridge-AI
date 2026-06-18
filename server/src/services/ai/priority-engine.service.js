const model = require("../../config/gemini");

const { buildPriorityPrompt, } = require("../../prompts/priority.prompt");

const generatePriorities = async (situation, riskAnalysis) => {
    const prompt =
        buildPriorityPrompt(
            situation,
            riskAnalysis
        );

    const result = await model.generateContent(prompt);

    const response =
        result.response.text();

    const cleaned = response
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

    return JSON.parse(cleaned);
};

module.exports = {
    generatePriorities,
};