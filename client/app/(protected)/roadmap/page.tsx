"use client";

import Link from "next/link";

import { EmptyState } from "@/components/ui/empty-state";
import { useAssessmentWorkspace } from "@/hooks/use-assessment-workspace";

export default function RoadmapPage() {
  const { workspace, workspaceReady } = useAssessmentWorkspace();

  if (!workspaceReady) {
    return null;
  }

  if (!workspace) {
    return (
      <EmptyState
        title="No roadmap yet"
        message="Start an assessment to generate a step-by-step roadmap tailored to your situation."
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
    <div className="space-y-6">
      <section className="rounded-[20px] border border-[#dbe4f4] bg-white p-6 shadow-[0_8px_20px_-18px_rgba(17,43,89,0.3)]">
        <h2 className="font-heading text-[30px] font-bold tracking-[-0.04em] text-[#173b72]">
          Recovery Roadmap
        </h2>
        <p className="mt-3 max-w-3xl text-[15px] leading-[1.8] text-[#62728f]">
          Follow the most important next steps in order, so you can move
          through the situation with clarity.
        </p>
      </section>

      <section className="rounded-[20px] border border-[#dbe4f4] bg-white p-6 shadow-[0_8px_20px_-18px_rgba(17,43,89,0.3)]">
        <div className="space-y-5">
          {workspace.roadmap.map((item, index) => (
            <div key={`${item.timeline}-${item.task}-${index}`} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e8f0ff] text-[13px] font-semibold text-[#173b72]">
                  {index + 1}
                </div>
                {index < workspace.roadmap.length - 1 ? (
                  <div className="mt-2 h-14 w-px bg-[#dbe3f1]" />
                ) : null}
              </div>
              <div className="rounded-[16px] border border-[#e6ebf4] bg-[#fbfcff] px-5 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7b8aa3]">
                  {item.timeline}
                </p>
                <p className="mt-2 font-heading text-[20px] font-bold text-[#173b72]">
                  {item.task}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
