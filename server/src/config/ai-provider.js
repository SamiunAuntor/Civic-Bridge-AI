const { GoogleGenerativeAI } = require("@google/generative-ai");

const { createHttpError } = require("../utils/http-error");

function resolveAiProviderConfig() {
  const provider = String(process.env.AI_PROVIDER || "gemini").trim().toLowerCase();

  if (provider === "groq") {
    return {
      provider,
      apiKey: process.env.GROQ_API_KEY || "",
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      baseUrl: "https://api.groq.com/openai/v1/chat/completions",
    };
  }

  return {
    provider: "gemini",
    apiKey: process.env.GEMINI_API_KEY || "",
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
  };
}

async function generateWithGemini(prompt, config) {
  if (!config.apiKey.trim()) {
    throw createHttpError(
      500,
      "GEMINI_API_KEY is not configured",
      "The configured Gemini provider is missing its API key.",
    );
  }

  const genAI = new GoogleGenerativeAI(config.apiKey);
  const model = genAI.getGenerativeModel({ model: config.model });
  const result = await model.generateContent(prompt);

  return result?.response?.text?.() ?? "";
}

async function generateWithGroq(prompt, config) {
  if (!config.apiKey.trim()) {
    throw createHttpError(
      500,
      "GROQ_API_KEY is not configured",
      "The configured Groq provider is missing its API key.",
    );
  }

  const response = await fetch(config.baseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      temperature: 0.2,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const providerMessage =
      payload?.error?.message ||
      payload?.message ||
      `Groq request failed with status ${response.status}`;

    throw createHttpError(response.status, providerMessage, providerMessage);
  }

  return payload?.choices?.[0]?.message?.content ?? "";
}

async function generateText(prompt) {
  const config = resolveAiProviderConfig();

  if (config.provider === "groq") {
    return generateWithGroq(prompt, config);
  }

  if (config.provider === "gemini") {
    return generateWithGemini(prompt, config);
  }

  throw createHttpError(
    500,
    `Unsupported AI_PROVIDER: ${config.provider}`,
    "The configured AI provider is not supported.",
  );
}

module.exports = {
  generateText,
  resolveAiProviderConfig,
};
