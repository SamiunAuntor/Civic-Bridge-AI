const model = require("../../config/gemini");

const { buildSimulationPrompt, } = require("../../prompts/simulation.prompt");

const simulateDecision = async (situation, analysis, decision) => {
    const prompt =
        buildSimulationPrompt(
            situation,
            analysis,
            decision
        );

    const result =
        await model.generateContent(prompt);

    const response =
        result.response.text();

    const cleaned = response
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

    return JSON.parse(cleaned);
};

module.exports = {
    simulateDecision,
};