"use client";

import { useContext } from "react";

import { AssessmentWorkspaceContext } from "@/providers/assessment-workspace-provider";

export function useAssessmentWorkspace() {
  const context = useContext(AssessmentWorkspaceContext);

  if (!context) {
    throw new Error(
      "useAssessmentWorkspace must be used inside AssessmentWorkspaceProvider",
    );
  }

  return context;
}
