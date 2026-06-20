const { generateText } = require("../config/ai-provider");
const { createHttpError } = require("./http-error");

function cleanJson(text) {
  return String(text || "")
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();
}

function extractJsonCandidate(text) {
  const cleaned = cleanJson(text);

  if (!cleaned) {
    return cleaned;
  }

  const objectStart = cleaned.indexOf("{");
  const objectEnd = cleaned.lastIndexOf("}");

  if (objectStart !== -1 && objectEnd !== -1 && objectEnd > objectStart) {
    return cleaned.slice(objectStart, objectEnd + 1);
  }

  const arrayStart = cleaned.indexOf("[");
  const arrayEnd = cleaned.lastIndexOf("]");

  if (arrayStart !== -1 && arrayEnd !== -1 && arrayEnd > arrayStart) {
    return cleaned.slice(arrayStart, arrayEnd + 1);
  }

  return cleaned;
}

function mapProviderError(error) {
  const status = Number(error?.status || error?.statusCode || 0);
  const message = String(error?.message || "");

  if (status === 429 || message.includes("Too Many Requests") || message.includes("Quota exceeded")) {
    return createHttpError(
      429,
      message || "AI provider quota exceeded",
      "The AI provider request limit has been reached for now. Please wait and try again, or update the provider quota/billing.",
    );
  }

  if (status === 401 || status === 403 || message.includes("API key")) {
    return createHttpError(
      502,
      message || "AI provider authentication failed",
      "The AI provider credentials are not working right now. Please verify the configured API key.",
    );
  }

  return null;
}

async function runPrompt({
  prompt,
  validator,
  normalizer,
  maxRetries = 1,
  timeoutMs = 45000,
}) {
  let lastError = null;

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    let timeoutId = null;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(
          createHttpError(
            504,
            "AI request timed out",
            "We couldn't finish the AI response in time.",
          ),
        );
      }, timeoutMs);
    });

    try {
      const resultText = await Promise.race([
        generateText(prompt),
        timeoutPromise,
      ]);
      clearTimeout(timeoutId);

      const cleaned = extractJsonCandidate(resultText);
      const parsed = JSON.parse(cleaned);

      if (validator && !validator(parsed)) {
        throw createHttpError(
          502,
          "AI response failed validation",
          "We couldn't safely use the AI response.",
        );
      }

      return normalizer ? normalizer(parsed) : parsed;
    } catch (error) {
      clearTimeout(timeoutId);
      lastError = error;
      const mappedProviderError = mapProviderError(error);

      const isJsonError =
        error instanceof SyntaxError ||
        String(error?.message || "").includes("Unexpected");

      if (mappedProviderError) {
        throw mappedProviderError;
      }

      if (attempt < maxRetries && isJsonError) {
        continue;
      }

      if (error?.statusCode) {
        throw error;
      }

      throw createHttpError(
        502,
        `AI execution failed: ${error?.message || "unknown error"}`,
        "We couldn't generate a reliable AI response right now.",
      );
    }
  }

  throw createHttpError(
    502,
    lastError?.message || "AI execution failed",
    "We couldn't generate a reliable AI response right now.",
  );
}

module.exports = {
  runPrompt,
  extractJsonCandidate,
};
