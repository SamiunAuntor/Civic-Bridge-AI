"use client";

import Link from "next/link";
import {
  ArrowRight,
  CircleDollarSign,
  HeartPulse,
  House,
  ShieldAlert,
} from "lucide-react";

import { RiskSummaryCard } from "@/components/dashboard/risk-summary-card";
import { RoadmapPlanCard } from "@/components/dashboard/roadmap-plan-card";
import { StabilityScoreCard } from "@/components/dashboard/stability-score-card";
import { UrgentTasksCard } from "@/components/dashboard/urgent-tasks-card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import { useAssessmentWorkspace } from "@/hooks/use-assessment-workspace";
import { useAuth } from "@/hooks/use-auth";
import type { RiskLevel } from "@/types/domain";

function normalizeRiskLevel(level: RiskLevel | null): RiskLevel {
  return level ?? "MEDIUM";
}

function riskCopy(level: RiskLevel | null, domain: string) {
  const normalizedLevel = normalizeRiskLevel(level);

  if (normalizedLevel === "HIGH") {
    return `${domain} risk needs immediate attention based on the latest assessment.`;
  }

  if (normalizedLevel === "MEDIUM") {
    return `${domain} pressure is present and should be monitored in the near term.`;
  }

  return `${domain} appears more stable right now, but should still be reviewed.`;
}

export default function DashboardPage() {
  const { profile, profileLoading, profileError } = useAuth();
  const { workspace, workspaceReady } = useAssessmentWorkspace();
  const activeCaseId =
    workspace?.currentCase?.id && workspace.currentCase.id !== "undefined"
      ? workspace.currentCase.id
      : null;

  if (profileLoading || !workspaceReady) {
    return <LoadingState title="Loading your dashboard" />;
  }

  if (profileError) {
    return (
      <ErrorState
        title="Unable to load your Civic Bridge AI profile"
        message={profileError}
      />
    );
  }

  if (!workspace) {
    return (
      <EmptyState
        title="No case yet"
        message="Start your first case to open a workspace with your score, top priorities, roadmap, support options, and planning tools in one place."
        action={
          <Link
            href="/assessments/new"
            className="inline-flex items-center gap-2 rounded-[12px] bg-[#173b72] px-4 py-2.5 font-semibold text-white"
          >
            Start New Case
            <ArrowRight className="h-4 w-4" />
          </Link>
        }
      />
    );
  }

  const riskCards = [
    {
      title: "Housing",
      level: normalizeRiskLevel(workspace.analysis.housingRisk),
      description: riskCopy(workspace.analysis.housingRisk, "Housing"),
      icon: House,
    },
    {
      title: "Income",
      level: normalizeRiskLevel(workspace.analysis.incomeRisk),
      description: riskCopy(workspace.analysis.incomeRisk, "Income"),
      icon: CircleDollarSign,
    },
    {
      title: "Healthcare",
      level: normalizeRiskLevel(workspace.analysis.healthcareRisk),
      description: riskCopy(workspace.analysis.healthcareRisk, "Healthcare"),
      icon: HeartPulse,
    },
    {
      title: "Overall",
      level: normalizeRiskLevel(workspace.analysis.overallRisk),
      description: workspace.analysis.summary,
      icon: ShieldAlert,
    },
  ] as const;

  return (
    <div className="space-y-8">
      <section className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[17px] text-[#62728f]">
            Here is the current case summary and active work for,
            {profile?.name ? ` ${profile.name}` : ""}.
          </p>
          {workspace.currentCase ? (
            <p className="mt-3 text-sm font-semibold text-[#173b72]">
              Current case: {workspace.currentCase.title}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {activeCaseId ? (
            <Link
              href={`/cases/${activeCaseId}`}
              className="inline-flex items-center gap-3 rounded-[10px] border border-[#d9deea] bg-white px-5 py-3 text-[14px] font-semibold text-[#173b72]"
            >
              Open Case Workspace
            </Link>
          ) : null}
          <Link
            href="/assessments/new"
            className="inline-flex items-center gap-3 rounded-[10px] bg-[#173b72] px-5 py-3 text-[14px] font-semibold text-white shadow-[0_10px_24px_-20px_rgba(23,59,114,0.8)]"
          >
            <span className="text-[16px]">+</span>
            Start New Case
          </Link>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[280px_1fr]">
        <StabilityScoreCard
          score={workspace.analysis.stabilityScore}
          summary={workspace.analysis.summary}
        />

        <div className="grid gap-4 md:grid-cols-2">
          {riskCards.map((card) => (
            <RiskSummaryCard
              key={card.title}
              title={card.title}
              level={card.level}
              description={card.description}
              icon={card.icon}
            />
          ))}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <UrgentTasksCard priorities={workspace.priorities} />
        <RoadmapPlanCard roadmap={workspace.roadmap} />
      </section>
    </div>
  );
}
