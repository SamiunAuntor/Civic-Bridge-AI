const buildRoadmapPrompt = (situation, analysis, priorities) => `
You are an expert crisis recovery planner.

Situation:
${situation}

Analysis:
${JSON.stringify(analysis)}

Priorities:
${JSON.stringify(priorities)}

Generate an actionable roadmap.

Return ONLY JSON.

{
  "roadmap": [
    {
      "timeline": "TODAY",
      "task": "Apply for emergency housing support"
    },
    {
      "timeline": "THIS_WEEK",
      "task": "Submit unemployment claim"
    }
  ]
}
`;

module.exports = {
    buildRoadmapPrompt,
};