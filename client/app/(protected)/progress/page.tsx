"use client";

import Link from "next/link";

import { EmptyState } from "@/components/ui/empty-state";
import { useAssessmentWorkspace } from "@/hooks/use-assessment-workspace";

export default function ProgressPage() {
  const { workspace, workspaceReady } = useAssessmentWorkspace();

  if (!workspaceReady) {
    return null;
  }

  if (!workspace) {
    return (
      <EmptyState
        title="No progress data yet"
        message="Create an assessment first so decision simulations and roadmap momentum can be tracked."
        action={
          <Link
            href="/assessments/new"
            className="inline-flex rounded-[12px] bg-[#173b72] px-4 py-2.5 font-semibold text-white"
          >
            New Assessment
          </Link>
        }
      />
    );
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[0.92fr_1.08fr]">
      <section className="rounded-[18px] border border-[#dbe4f4] bg-white p-5 shadow-[0_8px_20px_-18px_rgba(17,43,89,0.3)]">
        <h2 className="font-heading text-[22px] font-bold text-[#173b72]">
          Stability Progress
        </h2>
        <div className="mt-6 space-y-4">
          <div className="rounded-[14px] border border-[#e3e9f3] bg-[#fbfcff] p-4">
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#7c8ba4]">
              Current Score
            </p>
            <p className="mt-2 font-heading text-[38px] font-bold text-[#173b72]">
              {workspace.analysis.stabilityScore}
            </p>
          </div>
          <div className="rounded-[14px] border border-[#e3e9f3] bg-[#fbfcff] p-4">
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#7c8ba4]">
              Overall Risk
            </p>
            <p className="mt-2 font-heading text-[26px] font-bold text-[#173b72]">
              {workspace.analysis.overallRisk}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[18px] border border-[#dbe4f4] bg-white p-5 shadow-[0_8px_20px_-18px_rgba(17,43,89,0.3)]">
        <h2 className="font-heading text-[22px] font-bold text-[#173b72]">
          Simulation History
        </h2>

        {workspace.simulations.length ? (
          <div className="mt-5 space-y-4">
            {workspace.simulations.map((simulation, index) => (
              <div
                key={`${simulation.decision}-${index}`}
                className="rounded-[14px] border border-[#e3e9f3] bg-[#fbfcff] p-4"
              >
                <p className="font-heading text-[18px] font-bold text-[#173b72]">
                  {simulation.decision}
                </p>
                <p className="mt-3 text-[14px] leading-[1.8] text-[#5f6f8a]">
                  {simulation.summary}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No simulations yet"
            message="Run a decision simulation from the assessment page to see outcomes here."
          />
        )}
      </section>
    </div>
  );
}
