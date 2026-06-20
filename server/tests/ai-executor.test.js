import { describe, expect, it } from "vitest";

const { extractJsonCandidate } = require("../src/utils/ai-executor");

describe("ai-executor", () => {
  it("extracts a JSON object from wrapped text", () => {
    const candidate = extractJsonCandidate(
      'Here is the result:\n```json\n{"ok":true,"value":42}\n```\nUse it carefully.',
    );

    expect(candidate).toBe('{"ok":true,"value":42}');
  });
});
