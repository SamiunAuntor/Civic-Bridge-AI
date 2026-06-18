const buildPriorityPrompt = (
    situation,
    riskAnalysis
) => `
You are an expert crisis decision advisor.

Given:

Situation:
${situation}

Risk Analysis:
${JSON.stringify(riskAnalysis)}

Generate the top 3 priorities.

Return ONLY JSON.

{
  "priorities": [
    {
      "order": 1,
      "title": "",
      "reasoning": "",
      "confidence": 95
    }
  ]
}
`;

module.exports = {
    buildPriorityPrompt,
};