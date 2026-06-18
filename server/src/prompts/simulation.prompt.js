const buildSimulationPrompt = (situation, analysis, decision) => `
You are a crisis outcome simulation AI.

Situation:
${situation}

Risk Analysis:
${JSON.stringify(analysis)}

Decision:
${decision}

Predict realistic consequences.

Return ONLY JSON.

{
  "housingImpact": "LOW|MEDIUM|HIGH",
  "incomeImpact": "LOW|MEDIUM|HIGH",
  "healthImpact": "LOW|MEDIUM|HIGH",
  "summary": "Short explanation",
  "recommendedAction": "Recommended next step"
}
`;

module.exports = {
  buildSimulationPrompt,
};