"use client";

import Link from "next/link";

import { EmptyState } from "@/components/ui/empty-state";
import { useAssessmentWorkspace } from "@/hooks/use-assessment-workspace";

export default function ResourcesPage() {
  const { workspace, workspaceReady } = useAssessmentWorkspace();

  if (!workspaceReady) {
    return null;
  }

  if (!workspace) {
    return (
      <EmptyState
        title="No resource recommendations yet"
        message="Complete an assessment first so we can match support options to your situation."
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

  if (!workspace.resources.length) {
    return (
      <EmptyState
        title="Recommendations are still on the way"
        message="We have your latest assessment. Resource suggestions will appear here as soon as they are available."
      />
    );
  }

  return (
    <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {workspace.resources.map((resource, index) => (
        <article
          key={`${resource.name}-${index}`}
          className="rounded-[18px] border border-[#dbe4f4] bg-white p-5 shadow-[0_8px_20px_-18px_rgba(17,43,89,0.3)]"
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-heading text-[20px] font-bold text-[#173b72]">
              {resource.name}
            </h2>
            <span className="rounded-full bg-[#eef4ff] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#173b72]">
              {resource.priority}
            </span>
          </div>
          <p className="mt-4 text-[14px] leading-[1.85] text-[#5f6f8a]">
            {resource.reason}
          </p>
        </article>
      ))}
    </section>
  );
}
