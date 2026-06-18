const buildResourcePrompt = (situation, analysis, resources) => `
You are a civic resource matching AI.

Situation:
${situation}

Analysis:
${JSON.stringify(analysis)}

Available Resources:
${JSON.stringify(resources)}

Match the most relevant resources.

Return ONLY JSON.

{
  "resources":[
    {
      "title":"",
      "reason":""
    }
  ]
}
`;

module.exports = {
    buildResourcePrompt,
};