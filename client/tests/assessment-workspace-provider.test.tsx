import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach } from "vitest";
import { describe, expect, it, vi } from "vitest";
import {
  AssessmentWorkspaceProvider,
  type AssessmentWorkspace,
} from "@/providers/assessment-workspace-provider";
import { useAssessmentWorkspace } from "@/hooks/use-assessment-workspace";

const authState = {
  status: "authenticated" as const,
  firebaseUser: { uid: "firebase-user-1" },
  profile: {
    id: "user-1",
    firebase_uid: "firebase-user-1",
    email: "user-1@example.com",
    name: "User One",
  },
};

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => authState,
}));

function Probe() {
  const { selectedCaseId, setWorkspace, workspace, workspaceReady } =
    useAssessmentWorkspace();

  return (
    <div>
      <div data-testid="ready">{String(workspaceReady)}</div>
      <div data-testid="case-id">{selectedCaseId ?? "null"}</div>
      <div data-testid="workspace">
        {workspace ? JSON.stringify(workspace) : "null"}
      </div>
      <button
        type="button"
        onClick={() =>
          setWorkspace(
            {
              situation: "I need help staying housed.",
              assessment: {
                id: "assessment-2",
                user_id: "user-1",
                situation_text: "I need help staying housed.",
                stability_score: 38,
              },
              analysis: {
                stabilityScore: 38,
                housingRisk: "HIGH",
                incomeRisk: "MEDIUM",
                healthcareRisk: "LOW",
                overallRisk: "HIGH",
                summary: "summary",
              },
              priorities: [],
              roadmap: [],
              resources: [],
              simulations: [],
              currentCase: {
                id: "case-2",
                user_id: "user-1",
                title: "Case 2",
                status: "ACTIVE",
                last_activity_at: "2026-06-20T00:00:00.000Z",
              },
              resourceInteractions: [],
              resourceInteractionsAvailable: false,
              comparison: null,
            },
            { selectedCaseId: "case-2" },
          )
        }
      >
        Save workspace
      </button>
    </div>
  );
}

function renderProvider() {
  return render(
    <AssessmentWorkspaceProvider>
      <Probe />
    </AssessmentWorkspaceProvider>,
  );
}

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

describe("AssessmentWorkspaceProvider", () => {
  it("starts empty when localStorage has no workspace", async () => {
    window.localStorage.removeItem(
      "civicbridge.latest-assessment-workspace:firebase-user-1",
    );

    renderProvider();

    await waitFor(() => {
      expect(screen.getByTestId("ready")).toHaveTextContent("true");
    });
    expect(screen.getByTestId("workspace")).toHaveTextContent("null");
  });

  it("removes malformed localStorage data safely", async () => {
    window.localStorage.setItem(
      "civicbridge.latest-assessment-workspace:firebase-user-1",
      "{bad-json",
    );

    renderProvider();

    await waitFor(() => {
      expect(screen.getByTestId("ready")).toHaveTextContent("true");
    });
    expect(
      window.localStorage.getItem(
        "civicbridge.latest-assessment-workspace:firebase-user-1",
      ),
    ).toBe("{bad-json");
    expect(screen.getByTestId("workspace")).toHaveTextContent("null");
  });

  it("restores a valid workspace from the signed-in user's storage key", async () => {
    const workspace: AssessmentWorkspace = {
      situation: "I lost my job and need help.",
      assessment: {
        id: "assessment-1",
        user_id: "user-1",
        situation_text: "I lost my job and need help.",
        stability_score: 42,
      },
      analysis: {
        stabilityScore: 42,
        housingRisk: "HIGH",
        incomeRisk: "HIGH",
        healthcareRisk: "LOW",
        overallRisk: "HIGH",
        summary: "summary",
      },
      priorities: [],
      roadmap: [],
      resources: [],
      simulations: [],
      currentCase: null,
      resourceInteractions: [],
      resourceInteractionsAvailable: false,
      comparison: null,
    };

    window.localStorage.setItem(
      "civicbridge.latest-assessment-workspace:firebase-user-1",
      JSON.stringify({
        workspaceVersion: 2,
        ownerKey: "firebase-user-1",
        selectedCaseId: null,
        savedAt: "2026-06-20T00:00:00.000Z",
        workspace,
      }),
    );

    renderProvider();

    await waitFor(() => {
      expect(screen.getByTestId("ready")).toHaveTextContent("true");
    });
    expect(screen.getByTestId("workspace")).toHaveTextContent(
      '"assessment-1"',
    );
  });

  it("restores a wrapped workspace with case metadata from localStorage", async () => {
    const workspace: AssessmentWorkspace = {
      situation: "I lost my job and need help.",
      assessment: {
        id: "assessment-1",
        user_id: "user-1",
        situation_text: "I lost my job and need help.",
        stability_score: 42,
      },
      analysis: {
        stabilityScore: 42,
        housingRisk: "HIGH",
        incomeRisk: "HIGH",
        healthcareRisk: "LOW",
        overallRisk: "HIGH",
        summary: "summary",
      },
      priorities: [],
      roadmap: [],
      resources: [],
      simulations: [],
      currentCase: null,
      resourceInteractions: [],
      resourceInteractionsAvailable: false,
      comparison: null,
    };

    window.localStorage.setItem(
      "civicbridge.latest-assessment-workspace:firebase-user-1",
      JSON.stringify({
        workspaceVersion: 2,
        ownerKey: "firebase-user-1",
        selectedCaseId: "case-1",
        savedAt: "2026-06-20T00:00:00.000Z",
        workspace,
      }),
    );

    renderProvider();

    await waitFor(() => {
      expect(screen.getByTestId("ready")).toHaveTextContent("true");
    });
    expect(screen.getByTestId("case-id")).toHaveTextContent("case-1");
    expect(screen.getByTestId("workspace")).toHaveTextContent(
      '"assessment-1"',
    );
  });

  it("persists the wrapped workspace format for new saves", async () => {
    renderProvider();

    await waitFor(() => {
      expect(screen.getByTestId("ready")).toHaveTextContent("true");
    });

    screen.getByRole("button", { name: "Save workspace" }).click();

    const stored = window.localStorage.getItem(
      "civicbridge.latest-assessment-workspace:firebase-user-1",
    );

    expect(stored).not.toBeNull();
    expect(stored).toContain('"workspaceVersion":2');
    expect(stored).toContain('"ownerKey":"firebase-user-1"');
    expect(stored).toContain('"selectedCaseId":"case-2"');
    expect(stored).toContain('"assessment-2"');
  });

  it("does not restore another user's cached workspace on the dashboard", async () => {
    const otherUserWorkspace: AssessmentWorkspace = {
      situation: "Another user case",
      assessment: {
        id: "assessment-9",
        user_id: "user-9",
        situation_text: "Another user case",
        stability_score: 22,
      },
      analysis: {
        stabilityScore: 22,
        housingRisk: "HIGH",
        incomeRisk: "HIGH",
        healthcareRisk: "MEDIUM",
        overallRisk: "HIGH",
        summary: "summary",
      },
      priorities: [],
      roadmap: [],
      resources: [],
      simulations: [],
      currentCase: {
        id: "case-9",
        user_id: "user-9",
        title: "Other user case",
        status: "ACTIVE",
        last_activity_at: "2026-06-20T00:00:00.000Z",
      },
      resourceInteractions: [],
      resourceInteractionsAvailable: false,
      comparison: null,
    };

    window.localStorage.setItem(
      "civicbridge.latest-assessment-workspace:firebase-user-9",
      JSON.stringify({
        workspaceVersion: 2,
        ownerKey: "firebase-user-9",
        selectedCaseId: "case-9",
        savedAt: "2026-06-20T00:00:00.000Z",
        workspace: otherUserWorkspace,
      }),
    );

    renderProvider();

    await waitFor(() => {
      expect(screen.getByTestId("ready")).toHaveTextContent("true");
    });
    expect(screen.getByTestId("workspace")).toHaveTextContent("null");
    expect(screen.getByTestId("case-id")).toHaveTextContent("null");
  });

  it("keeps cached resources when hydrating the same case from the backend", async () => {
    function HydrateProbe() {
      const { hydrateCaseWorkspace, setWorkspace, workspace, workspaceReady } =
        useAssessmentWorkspace();

      return (
        <div>
          <div data-testid="ready">{String(workspaceReady)}</div>
          <div data-testid="resource-count">{workspace?.resources.length ?? 0}</div>
          <button
            type="button"
            onClick={() =>
              setWorkspace(
                {
                  situation: "Initial",
                  assessment: {
                    id: "assessment-a",
                    user_id: "user-1",
                    situation_text: "Initial",
                    stability_score: 41,
                  },
                  analysis: {
                    stabilityScore: 41,
                    housingRisk: "HIGH",
                    incomeRisk: "MEDIUM",
                    healthcareRisk: "LOW",
                    overallRisk: "HIGH",
                    summary: "Initial summary",
                  },
                  priorities: [],
                  roadmap: [],
                  resources: [
                    {
                      resourceId: "resource-1",
                      name: "Housing Support",
                      reason: "Recommended",
                      priority: "HIGH",
                    },
                  ],
                  simulations: [],
                  currentCase: {
                    id: "case-a",
                    user_id: "user-1",
                    title: "Case A",
                    status: "ACTIVE",
                    last_activity_at: "2026-06-20T00:00:00.000Z",
                  },
                  resourceInteractions: [],
                  resourceInteractionsAvailable: false,
                  comparison: null,
                },
                { selectedCaseId: "case-a" },
              )
            }
          >
            Seed workspace
          </button>
          <button
            type="button"
            onClick={() =>
              hydrateCaseWorkspace({
                case: {
                  id: "case-a",
                  user_id: "user-1",
                  title: "Case A",
                  status: "ACTIVE",
                  last_activity_at: "2026-06-20T00:00:00.000Z",
                },
                latestAssessment: {
                  id: "assessment-b",
                  user_id: "user-1",
                  case_id: "case-a",
                  situation_text: "Updated",
                  stability_score: 40,
                },
                analysis: {
                  stabilityScore: 40,
                  housingRisk: "HIGH",
                  incomeRisk: "MEDIUM",
                  healthcareRisk: "LOW",
                  overallRisk: "HIGH",
                  summary: "Updated summary",
                },
                priorities: [],
                roadmap: [],
                simulations: [],
                resourceInteractions: [],
                resourceInteractionsAvailable: false,
                comparison: null,
              })
            }
          >
            Hydrate same case
          </button>
        </div>
      );
    }

    render(
      <AssessmentWorkspaceProvider>
        <HydrateProbe />
      </AssessmentWorkspaceProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("ready")).toHaveTextContent("true");
    });

    screen.getByRole("button", { name: "Seed workspace" }).click();
    await waitFor(() => {
      expect(screen.getByTestId("resource-count")).toHaveTextContent("1");
    });
    screen.getByRole("button", { name: "Hydrate same case" }).click();
    await waitFor(() => {
      expect(screen.getByTestId("resource-count")).toHaveTextContent("1");
    });
  });
});
