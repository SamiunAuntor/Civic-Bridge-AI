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

function riskCopy(level: "LOW" | "MEDIUM" | "HIGH", domain: string) {
  if (level === "HIGH") {
    return `${domain} risk needs immediate attention based on the latest assessment.`;
  }

  if (level === "MEDIUM") {
    return `${domain} pressure is present and should be monitored in the near term.`;
  }

  return `${domain} appears more stable right now, but should still be reviewed.`;
}

export default function DashboardPage() {
  const { profile, profileLoading, profileError } = useAuth();
  const { workspace, workspaceReady } = useAssessmentWorkspace();

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
        title="No assessment yet"
        message="Start your first assessment to see your stability score, top priorities, roadmap, resources, and planning tools in one place."
        action={
          <Link
            href="/assessments/new"
            className="inline-flex items-center gap-2 rounded-[12px] bg-[#173b72] px-4 py-2.5 font-semibold text-white"
          >
            Start Assessment
            <ArrowRight className="h-4 w-4" />
          </Link>
        }
      />
    );
  }

  const riskCards = [
    {
      title: "Housing",
      level: workspace.analysis.housingRisk,
      description: riskCopy(workspace.analysis.housingRisk, "Housing"),
      icon: House,
    },
    {
      title: "Income",
      level: workspace.analysis.incomeRisk,
      description: riskCopy(workspace.analysis.incomeRisk, "Income"),
      icon: CircleDollarSign,
    },
    {
      title: "Healthcare",
      level: workspace.analysis.healthcareRisk,
      description: riskCopy(workspace.analysis.healthcareRisk, "Healthcare"),
      icon: HeartPulse,
    },
    {
      title: "Overall",
      level: workspace.analysis.overallRisk,
      description: workspace.analysis.summary,
      icon: ShieldAlert,
    },
  ] as const;

  return (
    <div className="space-y-8">
      <section className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-heading text-[48px] font-bold leading-none tracking-[-0.05em] text-[#173b72]">
            Overview
          </h2>
          <p className="mt-4 text-[17px] text-[#62728f]">
            Here is your current stability summary and active tasks,
            {profile?.name ? ` ${profile.name}` : ""}.
          </p>
        </div>

        <Link
          href="/assessments/new"
          className="inline-flex items-center gap-3 rounded-[10px] bg-[#173b72] px-5 py-3 text-[14px] font-semibold text-white shadow-[0_10px_24px_-20px_rgba(23,59,114,0.8)]"
        >
          <span className="text-[16px]">+</span>
          New Assessment
        </Link>
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
