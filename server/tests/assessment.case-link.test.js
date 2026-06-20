import { beforeEach, describe, expect, it, vi } from "vitest";

describe("assessment service case linking", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("adds caseId when case history linkage succeeds", async () => {
    const assessmentRepository = require("../src/repositories/assessment.repository");
    const situationAnalysisService = require(
      "../src/services/ai/situation-analysis.service",
    );
    const priorityEngineService = require(
      "../src/services/ai/priority-engine.service",
    );
    const riskService = require("../src/services/risk.service");
    const priorityService = require("../src/services/priority.service");
    const roadmapService = require("../src/services/roadmap.service");
    const roadmapRepository = require("../src/repositories/roadmap.repository");
    const caseService = require("../src/services/case.service");

    vi.spyOn(situationAnalysisService, "analyzeSituation").mockResolvedValue({
      stabilityScore: 40,
      housingRisk: "HIGH",
      incomeRisk: "HIGH",
      healthcareRisk: "LOW",
      overallRisk: "HIGH",
      summary: "summary",
    });
    vi.spyOn(assessmentRepository, "createAssessment").mockResolvedValue({
      data: {
        id: "assessment-1",
        user_id: "user-1",
        situation_text: "I need help with rent and food.",
        stability_score: 40,
      },
      error: null,
    });
    vi.spyOn(riskService, "saveRiskAssessment").mockResolvedValue({});
    vi.spyOn(priorityEngineService, "generatePriorities").mockResolvedValue({
      priorities: [{ order: 1, title: "Priority", reasoning: "Reason", confidence: 90 }],
    });
    vi.spyOn(priorityService, "savePriorities").mockResolvedValue({});
    vi.spyOn(roadmapService, "createRoadmap").mockResolvedValue({
      roadmap: [{ timeline: "TODAY", task: "Task" }],
    });
    vi.spyOn(roadmapRepository, "getRoadmapByAssessmentId").mockResolvedValue({
      data: [{ id: "roadmap-1", timeline: "TODAY", task: "Task", status: "NOT_STARTED" }],
      error: null,
    });
    vi.spyOn(caseService, "maybeCreateCaseForAssessment").mockResolvedValue({
      id: "case-1",
    });

    const assessmentService = require("../src/services/assessment.service");
    const result = await assessmentService.createAssessment(
      "user-1",
      "I need help with rent and food.",
    );

    expect(caseService.maybeCreateCaseForAssessment).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
      }),
    );
    expect(result.caseId).toBe("case-1");
  });
});
