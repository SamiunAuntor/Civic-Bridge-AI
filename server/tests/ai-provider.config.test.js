import { afterEach, describe, expect, it } from "vitest";

const { resolveAiProviderConfig } = require("../src/config/ai-provider");

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("ai provider config", () => {
  it("defaults to gemini when AI_PROVIDER is not set", () => {
    delete process.env.AI_PROVIDER;
    process.env.GEMINI_API_KEY = "gem-key";

    const config = resolveAiProviderConfig();

    expect(config.provider).toBe("gemini");
    expect(config.model).toBe("gemini-2.5-flash");
  });

  it("uses groq configuration when AI_PROVIDER=groq", () => {
    process.env.AI_PROVIDER = "groq";
    process.env.GROQ_API_KEY = "groq-key";
    process.env.GROQ_MODEL = "llama-3.1-8b-instant";

    const config = resolveAiProviderConfig();

    expect(config.provider).toBe("groq");
    expect(config.apiKey).toBe("groq-key");
    expect(config.model).toBe("llama-3.1-8b-instant");
    expect(config.baseUrl).toBe("https://api.groq.com/openai/v1/chat/completions");
  });
});
