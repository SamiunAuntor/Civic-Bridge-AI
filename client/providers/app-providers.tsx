"use client";

import { ThemeProvider } from "@/providers/theme-provider";
import { AssessmentWorkspaceProvider } from "@/providers/assessment-workspace-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { FeedbackProvider } from "@/providers/feedback-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AssessmentWorkspaceProvider>
          {children}
          <FeedbackProvider />
        </AssessmentWorkspaceProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
