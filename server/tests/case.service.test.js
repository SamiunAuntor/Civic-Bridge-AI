import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/services/timeline.service", () => ({
  addTimelineEvent: vi.fn().mockResolvedValue(null),
}));

describe("case service", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("passes the authenticated user into case listing queries", async () => {
    process.env.ENABLE_CASE_HISTORY = "true";

    const caseRepository = require("../src/repositories/case.repository");
    vi.spyOn(caseRepository, "isCaseHistorySchemaReady").mockResolvedValue(true);
    const listCasesForUserSpy = vi.spyOn(
      caseRepository,
      "listCasesForUser",
    ).mockResolvedValue({
      data: [{ id: "case-1", user_id: "user-1" }],
      error: null,
      count: 1,
    });

    const caseService = require("../src/services/case.service");
    const result = await caseService.listCasesForUser("user-1", {
      page: "1",
      limit: "10",
    });

    expect(listCasesForUserSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
      }),
    );
    expect(result.items).toHaveLength(1);
  });

  it("returns 404 when a case is missing for the current user", async () => {
    process.env.ENABLE_CASE_HISTORY = "true";

    const caseRepository = require("../src/repositories/case.repository");
    vi.spyOn(caseRepository, "isCaseHistorySchemaReady").mockResolvedValue(true);
    vi.spyOn(caseRepository, "getCaseByIdForUser").mockResolvedValue({
      data: null,
      error: null,
    });

    const caseService = require("../src/services/case.service");

    await expect(
      caseService.getCaseWorkspace("case-1", "user-1"),
    ).rejects.toMatchObject({
      statusCode: 404,
      message: "Case not found",
    });
  });

  it("prefers the AI-generated short case title when available", async () => {
    const caseService = require("../src/services/case.service");

    expect(
      caseService.buildCaseTitle(
        { caseTitle: "Rent Support Plan" },
        "I lost my job and need help with rent.",
      ),
    ).toBe("Rent Support Plan");
  });

  it("falls back to a short compact title when no AI title exists", async () => {
    const caseService = require("../src/services/case.service");

    expect(
      caseService.buildCaseTitle(
        null,
        "I lost my full-time job six weeks ago and currently need help.",
      ),
    ).toBe("I lost my full-time");
  });
  it("preserves the core case workspace when resource interactions are enabled but the schema is unavailable", async () => {
    process.env.ENABLE_CASE_HISTORY = "true";
    process.env.ENABLE_RESOURCE_INTERACTIONS = "true";

    const caseRepository = require("../src/repositories/case.repository");
    const riskRepository = require("../src/repositories/risk.repository");
    const priorityRepository = require("../src/repositories/priority.repository");
    const roadmapRepository = require("../src/repositories/roadmap.repository");
    const simulationRepository = require("../src/repositories/simulation.repository");
    const resourceInteractionRepository = require(
      "../src/repositories/resource-interaction.repository",
    );

    vi.spyOn(caseRepository, "isCaseHistorySchemaReady").mockResolvedValue(true);
    vi.spyOn(caseRepository, "getCaseByIdForUser").mockResolvedValue({
      data: {
        id: "case-1",
        user_id: "user-1",
        title: "Case",
        summary: "Summary",
        current_assessment_id: "assessment-1",
      },
      error: null,
    });
    vi.spyOn(caseRepository, "getLatestAssessmentForCase").mockResolvedValue({
      data: {
        id: "assessment-1",
        stability_score: 34,
        situation_text: "Need help",
      },
      error: null,
    });
    vi.spyOn(riskRepository, "getRiskAssessment").mockResolvedValue({
      data: {
        housing_risk: "HIGH",
        income_risk: "HIGH",
        healthcare_risk: "LOW",
        overall_risk: "HIGH",
      },
      error: null,
    });
    vi.spyOn(priorityRepository, "getPrioritiesByAssessmentId").mockResolvedValue({
      data: [],
      error: null,
    });
    vi.spyOn(roadmapRepository, "getRoadmapByAssessmentId").mockResolvedValue({
      data: [],
      error: null,
    });
    vi.spyOn(simulationRepository, "getSimulationsByAssessmentId").mockResolvedValue({
      data: [],
      error: null,
    });
    vi.spyOn(
      resourceInteractionRepository,
      "isResourceInteractionsSchemaReady",
    ).mockResolvedValue(false);

    const caseService = require("../src/services/case.service");
    const result = await caseService.getCaseWorkspace("case-1", "user-1");

    expect(result.case.id).toBe("case-1");
    expect(result.resourceInteractions).toEqual([]);
    expect(result.resourceInteractionsAvailable).toBe(false);
  });
});
