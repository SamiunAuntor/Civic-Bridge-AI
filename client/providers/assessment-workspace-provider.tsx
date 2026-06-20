"use client";

import { createContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/use-auth";

import type {
  Assessment,
  CaseRecord,
  CaseInitialSnapshot,
  CaseWorkspacePayload,
  Priority,
  ReassessmentComparison,
  ResourceInteraction,
  ResourceRecommendation,
  RiskAnalysis,
  RoadmapItem,
  Simulation,
} from "@/types/domain";

const LEGACY_STORAGE_KEY = "civicbridge.latest-assessment-workspace";
const WORKSPACE_VERSION = 2;

export interface AssessmentWorkspace {
  situation: string;
  assessment: Assessment;
  analysis: RiskAnalysis;
  initialSnapshot?: CaseInitialSnapshot | null;
  priorities: Priority[];
  roadmap: RoadmapItem[];
  resources: ResourceRecommendation[];
  simulations: Simulation[];
  currentCase: CaseRecord | null;
  resourceInteractions: ResourceInteraction[];
  resourceInteractionsAvailable: boolean;
  comparison: ReassessmentComparison | null;
}

interface PersistedAssessmentWorkspace {
  workspaceVersion: number;
  ownerKey?: string | null;
  selectedCaseId: string | null;
  savedAt: string;
  workspace: AssessmentWorkspace;
}

function buildStorageKey(ownerKey: string) {
  return `${LEGACY_STORAGE_KEY}:${ownerKey}`;
}

function isValidCaseId(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0 && value !== "undefined";
}

function sanitizeWorkspace(
  value: AssessmentWorkspace | null,
): AssessmentWorkspace | null {
  if (!value) {
    return null;
  }

  const currentCase = value.currentCase && isValidCaseId(value.currentCase.id)
    ? value.currentCase
    : null;

  return {
    ...value,
    currentCase,
  };
}

function workspaceBelongsToProfile(
  workspace: AssessmentWorkspace | null,
  profileUserId: string | null,
) {
  if (!workspace || !profileUserId) {
    return true;
  }

  const assessmentOwnerId = workspace.assessment.user_id;
  const caseOwnerId = workspace.currentCase?.user_id ?? null;

  return assessmentOwnerId === profileUserId || caseOwnerId === profileUserId;
}

interface AssessmentWorkspaceContextValue {
  workspace: AssessmentWorkspace | null;
  workspaceReady: boolean;
  selectedCaseId: string | null;
  savedAt: string | null;
  setWorkspace: (
    workspace: AssessmentWorkspace,
    options?: { selectedCaseId?: string | null },
  ) => void;
  hydrateCaseWorkspace: (payload: CaseWorkspacePayload) => void;
  updateResources: (resources: ResourceRecommendation[]) => void;
  updateResourceInteractions: (
    interactions: ResourceInteraction[],
    options?: { selectedCaseId?: string | null },
  ) => void;
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
  const { firebaseUser, profile, status } = useAuth();
  const [workspace, setWorkspaceState] = useState<AssessmentWorkspace | null>(
    null,
  );
  const [workspaceReady, setWorkspaceReady] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const ownerKey = firebaseUser?.uid ?? profile?.firebase_uid ?? null;
  const storageKey = ownerKey ? buildStorageKey(ownerKey) : null;

  useEffect(() => {
    if (status === "loading") {
      return;
    }

    setWorkspaceState(null);
    setSelectedCaseId(null);
    setSavedAt(null);

    if (!ownerKey || !storageKey) {
      setWorkspaceReady(true);
      return;
    }

    setWorkspaceReady(false);

    try {
      window.localStorage.removeItem(LEGACY_STORAGE_KEY);

      const stored = window.localStorage.getItem(storageKey);

      if (stored) {
        const parsed = JSON.parse(stored) as
          | PersistedAssessmentWorkspace
          | AssessmentWorkspace;

        if (
          typeof parsed === "object" &&
          parsed !== null &&
          "workspaceVersion" in parsed &&
          "workspace" in parsed
        ) {
          const persisted = parsed as PersistedAssessmentWorkspace;
          const persistedOwnerKey =
            typeof persisted.ownerKey === "string" ? persisted.ownerKey : null;

          if (persistedOwnerKey && persistedOwnerKey !== ownerKey) {
            return;
          }

          const sanitizedWorkspace = sanitizeWorkspace(persisted.workspace);
          const sanitizedSelectedCaseId = isValidCaseId(persisted.selectedCaseId)
            ? persisted.selectedCaseId
            : sanitizedWorkspace?.currentCase?.id ?? null;

          if (workspaceBelongsToProfile(sanitizedWorkspace, profile?.id ?? null)) {
            setWorkspaceState(sanitizedWorkspace);
            setSelectedCaseId(sanitizedSelectedCaseId);
            setSavedAt(persisted.savedAt ?? null);
          }
        } else {
          const sanitizedWorkspace = sanitizeWorkspace(parsed as AssessmentWorkspace);

          if (workspaceBelongsToProfile(sanitizedWorkspace, profile?.id ?? null)) {
            setWorkspaceState(sanitizedWorkspace);
          }
        }
      }
    } catch {
    } finally {
      setWorkspaceReady(true);
    }
  }, [ownerKey, profile?.id, status, storageKey]);

  function persist(
    nextWorkspace: AssessmentWorkspace | null,
    nextSelectedCaseId: string | null,
  ) {
    const sanitizedWorkspace = sanitizeWorkspace(nextWorkspace);
    const profileUserId = profile?.id ?? null;
    const sanitizedSelectedCaseId = isValidCaseId(nextSelectedCaseId)
      ? nextSelectedCaseId
      : sanitizedWorkspace?.currentCase?.id ?? null;

    if (!workspaceBelongsToProfile(sanitizedWorkspace, profileUserId)) {
      setWorkspaceState(null);
      setSelectedCaseId(null);
      setSavedAt(null);

      if (storageKey) {
        window.localStorage.removeItem(storageKey);
      }
      return;
    }

    setWorkspaceState(sanitizedWorkspace);
    setSelectedCaseId(sanitizedSelectedCaseId);

    if (sanitizedWorkspace) {
      const nextSavedAt = new Date().toISOString();
      const payload: PersistedAssessmentWorkspace = {
        workspaceVersion: WORKSPACE_VERSION,
        ownerKey,
        selectedCaseId: sanitizedSelectedCaseId,
        savedAt: nextSavedAt,
        workspace: sanitizedWorkspace,
      };

      setSavedAt(nextSavedAt);
      if (storageKey) {
        window.localStorage.setItem(storageKey, JSON.stringify(payload));
      }
      return;
    }

    setSavedAt(null);
    if (storageKey) {
      window.localStorage.removeItem(storageKey);
    }
  }

  const value = useMemo<AssessmentWorkspaceContextValue>(
    () => ({
      workspace,
      workspaceReady,
      selectedCaseId,
      savedAt,
      setWorkspace: (nextWorkspace, options) =>
        persist(nextWorkspace, options?.selectedCaseId ?? selectedCaseId),
      hydrateCaseWorkspace: (payload) => {
        const keepCachedResources =
          selectedCaseId === payload.case.id ? workspace?.resources ?? [] : [];

        persist(
          {
            situation: payload.latestAssessment.situation_text,
            assessment: payload.latestAssessment,
            analysis: payload.analysis,
            initialSnapshot: payload.initialSnapshot,
            priorities: payload.priorities,
            roadmap: payload.roadmap,
            resources: keepCachedResources,
            simulations: payload.simulations,
            currentCase: payload.case,
            resourceInteractions: payload.resourceInteractions ?? [],
            resourceInteractionsAvailable:
              payload.resourceInteractionsAvailable ?? false,
            comparison: payload.comparison ?? null,
          },
          payload.case.id,
        );
      },
      updateResources: (resources) => {
        if (!workspace) {
          return;
        }

        persist({
          ...workspace,
          resources,
        }, selectedCaseId);
      },
      updateResourceInteractions: (resourceInteractions, options) => {
        if (!workspace) {
          return;
        }

        persist(
          {
            ...workspace,
            resourceInteractions,
          },
          options?.selectedCaseId ?? selectedCaseId,
        );
      },
      updatePriorities: (priorities) => {
        if (!workspace) {
          return;
        }

        persist({
          ...workspace,
          priorities,
        }, selectedCaseId);
      },
      updateRoadmap: (roadmap) => {
        if (!workspace) {
          return;
        }

        persist({
          ...workspace,
          roadmap,
        }, selectedCaseId);
      },
      appendSimulation: (simulation) => {
        if (!workspace) {
          return;
        }

        persist({
          ...workspace,
          simulations: [simulation, ...workspace.simulations],
        }, selectedCaseId);
      },
      clearWorkspace: () => persist(null, null),
    }),
    [savedAt, selectedCaseId, workspace, workspaceReady],
  );

  return (
    <AssessmentWorkspaceContext.Provider value={value}>
      {children}
    </AssessmentWorkspaceContext.Provider>
  );
}
