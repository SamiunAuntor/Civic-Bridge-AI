"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { LoadingState } from "@/components/ui/loading-state";
import { useAssessmentWorkspace } from "@/hooks/use-assessment-workspace";

export default function RoadmapPage() {
  const router = useRouter();
  const { selectedCaseId, workspaceReady } = useAssessmentWorkspace();

  useEffect(() => {
    if (!workspaceReady) {
      return;
    }

    if (selectedCaseId) {
      router.replace(`/cases/${selectedCaseId}`);
      return;
    }

    router.replace("/cases");
  }, [router, selectedCaseId, workspaceReady]);

  if (!workspaceReady) {
    return <LoadingState title="Opening your roadmap" />;
  }

  return <LoadingState title="Opening your roadmap" />;
}
