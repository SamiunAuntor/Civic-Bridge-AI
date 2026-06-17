const buildSituationPrompt = (
    situation
) => `
You are a crisis assessment AI.

Analyze the user's situation.

Return ONLY valid JSON.

Required format:

{
  "stabilityScore": number,
  "housingRisk": "LOW|MEDIUM|HIGH",
  "incomeRisk": "LOW|MEDIUM|HIGH",
  "healthcareRisk": "LOW|MEDIUM|HIGH",
  "overallRisk": "LOW|MEDIUM|HIGH",
  "summary": "brief summary"
}

Situation:

${situation}
`;

module.exports = {
    buildSituationPrompt,
};