"use client";

import { createContext, useEffect, useMemo, useState } from "react";

import type {
  Assessment,
  Priority,
  ResourceRecommendation,
  RiskAnalysis,
  RoadmapItem,
  Simulation,
} from "@/types/domain";

const STORAGE_KEY = "civicbridge.latest-assessment-workspace";

export interface AssessmentWorkspace {
  situation: string;
  assessment: Assessment;
  analysis: RiskAnalysis;
  priorities: Priority[];
  roadmap: RoadmapItem[];
  resources: ResourceRecommendation[];
  simulations: Simulation[];
}

interface AssessmentWorkspaceContextValue {
  workspace: AssessmentWorkspace | null;
  workspaceReady: boolean;
  setWorkspace: (workspace: AssessmentWorkspace) => void;
  updateResources: (resources: ResourceRecommendation[]) => void;
  updatePriorities: (priorities: Priority[]) => void;
  updateRoadmap: (roadmap: RoadmapItem[]) => void;
  appendSimulation: (simulation: Simulation) => void;
  clearWorkspace: () => void;
}

export const AssessmentWorkspaceContext =
  createContext<AssessmentWorkspaceContextValue | null>(null);

export function AssessmentWorkspaceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [workspace, setWorkspaceState] = useState<AssessmentWorkspace | null>(
    null,
  );
  const [workspaceReady, setWorkspaceReady] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);

      if (stored) {
        setWorkspaceState(JSON.parse(stored) as AssessmentWorkspace);
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setWorkspaceReady(true);
    }
  }, []);

  function persist(nextWorkspace: AssessmentWorkspace | null) {
    setWorkspaceState(nextWorkspace);

    if (nextWorkspace) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextWorkspace));
      return;
    }

    window.localStorage.removeItem(STORAGE_KEY);
  }

  const value = useMemo<AssessmentWorkspaceContextValue>(
    () => ({
      workspace,
      workspaceReady,
      setWorkspace: (nextWorkspace) => persist(nextWorkspace),
      updateResources: (resources) => {
        if (!workspace) {
          return;
        }

        persist({
          ...workspace,
          resources,
        });
      },
      updatePriorities: (priorities) => {
        if (!workspace) {
          return;
        }

        persist({
          ...workspace,
          priorities,
        });
      },
      updateRoadmap: (roadmap) => {
        if (!workspace) {
          return;
        }

        persist({
          ...workspace,
          roadmap,
        });
      },
      appendSimulation: (simulation) => {
        if (!workspace) {
          return;
        }

        persist({
          ...workspace,
          simulations: [simulation, ...workspace.simulations],
        });
      },
      clearWorkspace: () => persist(null),
    }),
    [workspace, workspaceReady],
  );

  return (
    <AssessmentWorkspaceContext.Provider value={value}>
      {children}
    </AssessmentWorkspaceContext.Provider>
  );
}
