const model = require("../../config/gemini");

const { buildRoadmapPrompt, } = require("../../prompts/roadmap.prompt");

const generateRoadmap = async (situation, analysis, priorities) => {
    const prompt = buildRoadmapPrompt(
        situation,
        analysis,
        priorities
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
    generateRoadmap,
};