"use client";

import Link from "next/link";
import { useEffect, useEffectEvent, useMemo, useState } from "react";
import {
  Archive,
  ArrowLeft,
  CheckCircle2,
  Edit3,
  FileText,
  Save,
  ShieldPlus,
} from "lucide-react";

import { CaseRoadmapFlow } from "@/components/cases/case-roadmap-flow";
import { CaseStatusBadge } from "@/components/cases/case-status-badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import { useAssessmentWorkspace } from "@/hooks/use-assessment-workspace";
import { frontendFeatures } from "@/lib/features";
import { fetchCaseDetail, updateCase } from "@/services/case-service";
import { confirmDialog, notify } from "@/lib/feedback";
import { createReassessment } from "@/services/reassessment-service";
import { fetchRecommendedResources } from "@/services/resource-service";
import type {
  CaseRecord,
  CaseWorkspacePayload,
  ReassessmentComparison,
} from "@/types/domain";

function formatDate(value?: string | null) {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function truncateText(value?: string | null, maxLength = 180) {
  if (!value) {
    return "";
  }

  const cleaned = value.replace(/\s+/g, " ").trim();

  if (cleaned.length <= maxLength) {
    return cleaned;
  }

  return `${cleaned.slice(0, maxLength).trimEnd()}...`;
}

function riskToneClass(value?: string | null) {
  switch (value) {
    case "HIGH":
      return "border-[#f3d1cb] bg-[#fff5f2] text-[#bf4a34]";
    case "MEDIUM":
      return "border-[#f3e4b8] bg-[#fffaf0] text-[#9a6a00]";
    case "LOW":
      return "border-[#d7ede4] bg-[#f1fbf6] text-[#2c7d5b]";
    default:
      return "border-[#d9deea] bg-[#f7f9fe] text-[#62728f]";
  }
}

function stabilityToneClass(score?: number | null) {
  if (typeof score !== "number") {
    return "border-[#d9deea] bg-[#f7f9fe] text-[#62728f]";
  }

  if (score < 40) {
    return "border-[#f3d1cb] bg-[#fff5f2] text-[#bf4a34]";
  }

  if (score < 70) {
    return "border-[#f3e4b8] bg-[#fffaf0] text-[#9a6a00]";
  }

  return "border-[#d7ede4] bg-[#f1fbf6] text-[#2c7d5b]";
}

function neutralToneClass() {
  return "border-[#dbe4f4] bg-[#f7f9fe] text-[#173b72]";
}

function buildFallbackCaseRecord(caseId: string, title: string): CaseRecord {
  return {
    id: caseId,
    user_id: "",
    title,
    status: "ACTIVE",
    last_activity_at: new Date().toISOString(),
    created_at: null,
    updated_at: null,
  };
}

export function CaseDetailPageContent({ caseId }: { caseId: string }) {
  const {
    hydrateCaseWorkspace,
    savedAt,
    selectedCaseId,
    updateResources,
    updateRoadmap,
    workspace,
    workspaceReady,
  } = useAssessmentWorkspace();
  const [caseWorkspace, setCaseWorkspace] = useState<CaseWorkspacePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingCache, setUsingCache] = useState(false);
  const [reassessmentChange, setReassessmentChange] = useState("");
  const [reassessmentSubmitting, setReassessmentSubmitting] = useState(false);
  const [comparison, setComparison] = useState<ReassessmentComparison | null>(null);
  const [titleDraft, setTitleDraft] = useState("");
  const [savingCase, setSavingCase] = useState(false);
  const [resourceLoading, setResourceLoading] = useState(false);
  const applyWorkspace = useEffectEvent((payload: CaseWorkspacePayload) => {
    hydrateCaseWorkspace(payload);
    setCaseWorkspace(payload);
  });
  const hasValidCaseId = Boolean(caseId && caseId !== "undefined");

  const cachedWorkspace = useMemo(() => {
    if (!workspace || selectedCaseId !== caseId) {
      return null;
    }

    return {
      case:
        workspace.currentCase ||
        buildFallbackCaseRecord(caseId, workspace.situation.slice(0, 80) || "Saved Case"),
      initialSnapshot:
        workspace.initialSnapshot || {
          assessment: workspace.assessment,
          analysis: workspace.analysis,
        },
      latestAssessment: workspace.assessment,
      analysis: workspace.analysis,
      priorities: workspace.priorities,
      roadmap: workspace.roadmap,
      simulations: workspace.simulations,
      resourceInteractions: workspace.resourceInteractions,
      resourceInteractionsAvailable: workspace.resourceInteractionsAvailable,
      comparison: workspace.comparison,
    } satisfies CaseWorkspacePayload;
  }, [caseId, selectedCaseId, workspace]);

  useEffect(() => {
    if (!frontendFeatures.enableCaseHistory) {
      setLoading(false);
      return;
    }

    if (!hasValidCaseId) {
      setLoading(false);
      setError("The requested case link is invalid.");
      return;
    }

    if (!workspaceReady) {
      return;
    }

    let cancelled = false;
    let finished = false;

    async function loadCase() {
      setLoading(true);
      setError(null);
      setUsingCache(false);

      try {
        const response = await fetchCaseDetail(caseId);

        if (cancelled) {
          return;
        }

        applyWorkspace(response.data);
        finished = true;
      } catch (loadError) {
        if (cancelled) {
          return;
        }

        if (cachedWorkspace) {
          setCaseWorkspace(cachedWorkspace);
          setUsingCache(true);
          finished = true;
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "We couldn't reopen this case right now.",
        );
        finished = true;
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadCase();

    return () => {
      cancelled = true;
      if (!finished) {
        setLoading(false);
      }
    };
  }, [caseId, hasValidCaseId, workspaceReady]);

  const visibleResources =
    selectedCaseId === caseId ? workspace?.resources ?? [] : [];

  useEffect(() => {
    setTitleDraft(caseWorkspace?.case.title ?? "");
    setComparison(caseWorkspace?.comparison ?? null);
  }, [caseWorkspace?.case.title, caseWorkspace?.comparison]);

  useEffect(() => {
    if (!caseWorkspace || !hasValidCaseId) {
      return;
    }

    let cancelled = false;
    const currentWorkspace = caseWorkspace;

    async function loadRecommendedResources() {
      setResourceLoading(true);

      try {
        const response = await fetchRecommendedResources({
          situation: currentWorkspace.latestAssessment.situation_text,
          analysis: {
            housingRisk: currentWorkspace.analysis.housingRisk,
            incomeRisk: currentWorkspace.analysis.incomeRisk,
            healthcareRisk: currentWorkspace.analysis.healthcareRisk,
            overallRisk: currentWorkspace.analysis.overallRisk,
          },
        });

        if (!cancelled) {
          updateResources(response.data.resources);
        }
      } catch {
        if (!cancelled && selectedCaseId === caseId && !workspace?.resources?.length) {
          updateResources([]);
        }
      } finally {
        if (!cancelled) {
          setResourceLoading(false);
        }
      }
    }

    void loadRecommendedResources();

    return () => {
      cancelled = true;
    };
  }, [
    caseId,
    caseWorkspace?.latestAssessment.id,
    caseWorkspace?.analysis.housingRisk,
    caseWorkspace?.analysis.incomeRisk,
    caseWorkspace?.analysis.healthcareRisk,
    caseWorkspace?.analysis.overallRisk,
    hasValidCaseId,
  ]);

  async function applyCasePatch(
    patch: { title?: string; status?: CaseRecord["status"] },
    successMessage: string,
    confirmOptions?: {
      title: string;
      text: string;
      confirmButtonText: string;
    },
  ) {
    if (!caseWorkspace) {
      return;
    }

    if (confirmOptions) {
      const result = await confirmDialog(confirmOptions);
      if (!result.isConfirmed) {
        return;
      }
    }

    setSavingCase(true);

    try {
      const response = await updateCase(caseId, patch);
      const nextPayload = {
        ...caseWorkspace,
        case: response.data,
        analysis: {
          ...caseWorkspace.analysis,
          summary: response.data.summary ?? caseWorkspace.analysis.summary,
        },
      } satisfies CaseWorkspacePayload;

      applyWorkspace(nextPayload);
      notify.success(successMessage);
    } catch (patchError) {
      notify.error(
        patchError instanceof Error
          ? patchError.message
          : "We couldn't update this case right now.",
      );
    } finally {
      setSavingCase(false);
    }
  }

  if (!frontendFeatures.enableCaseHistory) {
    return (
      <EmptyState
        title="Case history is unavailable right now"
        message="We couldn't open this saved case until the secure history service is available again."
      />
    );
  }

  if (loading || !workspaceReady) {
    return <LoadingState title="Opening your case" />;
  }

  if (error || !caseWorkspace) {
    return (
      <ErrorState
        title="We couldn't reopen this case"
        message={error || "The requested case is unavailable."}
      />
    );
  }

  const initialSnapshot =
    caseWorkspace.initialSnapshot ?? {
      assessment: caseWorkspace.latestAssessment,
      analysis: caseWorkspace.analysis,
    };

  return (
    <div className="space-y-8">
      <section className="rounded-[26px] border border-[#dbe4f4] bg-white px-6 py-6 shadow-[0_8px_20px_-18px_rgba(17,43,89,0.3)] md:px-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/cases"
                className="inline-flex items-center gap-2 rounded-[12px] border border-[#d9deea] bg-white px-4 py-2.5 text-sm font-semibold text-[#173b72]"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Cases
              </Link>
              <CaseStatusBadge status={caseWorkspace.case.status} />
            </div>

            <h2 className="mt-4 font-heading text-[2.3rem] font-bold tracking-[-0.05em] text-[#173b72] md:text-[2.8rem]">
              {caseWorkspace.case.title}
            </h2>

            <p className="mt-4 max-w-4xl text-[16px] leading-8 text-[#62728f]">
              {truncateText(
                caseWorkspace.analysis.summary ||
                  "Your current case snapshot is ready to review.",
                220,
              )}
            </p>

            {usingCache ? (
              <div className="mt-5 rounded-[18px] border border-[#d9deea] bg-[#f7f9fe] px-4 py-3 text-sm text-[#62728f]">
                You are viewing a saved local copy from{" "}
                {savedAt ? formatDate(savedAt) : "a previous session"} while the secure
                case history reconnects.
              </div>
            ) : null}
          </div>

          <div className="w-full max-w-[420px] rounded-[22px] border border-[#dbe4f4] bg-[#fbfcff] p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef4ff] text-[#173b72]">
                <Edit3 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-heading text-[1.3rem] font-bold text-[#173b72]">
                  Case Management
                </h3>
                <p className="text-sm text-[#62728f]">
                  Keep the case title and status organized here.
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <input
                value={titleDraft}
                onChange={(event) => setTitleDraft(event.target.value)}
                className="w-full rounded-[16px] border border-[#d9deea] bg-white px-4 py-3 text-base font-semibold text-[#173b72] outline-none"
              />
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={
                  savingCase ||
                  !titleDraft.trim() ||
                  titleDraft.trim() === caseWorkspace.case.title
                }
                onClick={() =>
                  void applyCasePatch(
                    { title: titleDraft.trim() },
                    "Case title updated.",
                  )
                }
              >
                <Save className="h-4 w-4" />
                Save Title
              </Button>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Button
                type="button"
                variant="outline"
                disabled={savingCase || caseWorkspace.case.status === "RESOLVED"}
                onClick={() =>
                  void applyCasePatch(
                    { status: "RESOLVED" },
                    "Case marked as resolved.",
                    {
                      title: "Mark this case as resolved?",
                      text: "You can reopen it later if the situation changes again.",
                      confirmButtonText: "Mark Resolved",
                    },
                  )
                }
              >
                <CheckCircle2 className="h-4 w-4" />
                Resolve
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={savingCase || caseWorkspace.case.status === "ARCHIVED"}
                onClick={() =>
                  void applyCasePatch(
                    { status: "ARCHIVED" },
                    "Case archived.",
                    {
                      title: "Archive this case?",
                      text: "The case will stay in your history and can still be reopened later.",
                      confirmButtonText: "Archive Case",
                    },
                  )
                }
              >
                <Archive className="h-4 w-4" />
                Archive
              </Button>
              {(caseWorkspace.case.status === "ARCHIVED" ||
                caseWorkspace.case.status === "RESOLVED") ? (
                <Button
                  type="button"
                  variant="outline"
                  className="sm:col-span-2"
                  disabled={savingCase}
                  onClick={() =>
                    void applyCasePatch(
                      { status: "ACTIVE" },
                      "Case reopened.",
                    )
                  }
                >
                  Reopen Case
                </Button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div
            className={`rounded-[20px] border px-4 py-4 ${stabilityToneClass(
              caseWorkspace.analysis.stabilityScore,
            )}`}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em]">
              Current score
            </p>
            <p className="mt-2 font-heading text-4xl font-bold">
              {caseWorkspace.analysis.stabilityScore}
            </p>
          </div>
          <div
            className={`rounded-[20px] border px-4 py-4 ${riskToneClass(
              caseWorkspace.case.main_risk || caseWorkspace.analysis.overallRisk,
            )}`}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em]">
              Main risk
            </p>
            <p className="mt-2 text-base font-semibold">
              {caseWorkspace.case.main_risk || caseWorkspace.analysis.overallRisk || "Pending"}
            </p>
          </div>
          <div className={`rounded-[20px] border px-4 py-4 ${neutralToneClass()}`}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7c879e]">
              Last activity
            </p>
            <p className="mt-2 text-base font-semibold text-[#173b72]">
              {formatDate(caseWorkspace.case.last_activity_at)}
            </p>
          </div>
          <div className={`rounded-[20px] border px-4 py-4 ${neutralToneClass()}`}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7c879e]">
              Latest assessment
            </p>
            <p className="mt-2 text-base font-semibold text-[#173b72]">
              {formatDate(caseWorkspace.latestAssessment.created_at)}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 2xl:grid-cols-[1.15fr_0.85fr]">
        <article className="rounded-[24px] border border-[#dbe4f4] bg-white p-6 shadow-[0_8px_20px_-18px_rgba(17,43,89,0.3)]">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef4ff] text-[#173b72]">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-heading text-[1.8rem] font-bold text-[#173b72]">
                Situation Snapshot
              </h3>
              <p className="text-sm text-[#62728f]">
                A clear read of the current situation before taking action.
              </p>
            </div>
          </div>

          <p className="mt-5 text-[15px] leading-8 text-[#62728f]">
            {truncateText(initialSnapshot.assessment.situation_text, 520)}
          </p>

          <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className={`rounded-[18px] border px-4 py-4 ${neutralToneClass()}`}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7c879e]">
                Initial score
              </p>
              <p className="mt-2 font-heading text-4xl font-bold text-[#173b72]">
                {caseWorkspace.case.initial_stability_score ?? "--"}
              </p>
            </div>
            <div
              className={`rounded-[18px] border px-4 py-4 ${riskToneClass(
                initialSnapshot.analysis.housingRisk,
              )}`}
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em]">
                Housing
              </p>
              <p className="mt-2 text-base font-semibold">
                {initialSnapshot.analysis.housingRisk ?? "Pending"}
              </p>
            </div>
            <div
              className={`rounded-[18px] border px-4 py-4 ${riskToneClass(
                initialSnapshot.analysis.incomeRisk,
              )}`}
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em]">
                Income
              </p>
              <p className="mt-2 text-base font-semibold">
                {initialSnapshot.analysis.incomeRisk ?? "Pending"}
              </p>
            </div>
            <div
              className={`rounded-[18px] border px-4 py-4 ${riskToneClass(
                initialSnapshot.analysis.healthcareRisk,
              )}`}
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em]">
                Healthcare
              </p>
              <p className="mt-2 text-base font-semibold">
                {initialSnapshot.analysis.healthcareRisk ?? "Pending"}
              </p>
            </div>
          </div>
        </article>

        <article className="rounded-[24px] border border-[#dbe4f4] bg-white p-6 shadow-[0_8px_20px_-18px_rgba(17,43,89,0.3)]">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef4ff] text-[#173b72]">
              <ShieldPlus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-heading text-[1.55rem] font-bold text-[#173b72]">
                Support Options
              </h3>
              <p className="text-sm text-[#62728f]">
                Relevant resources linked directly to this case.
              </p>
            </div>
          </div>

          {visibleResources.length ? (
            <div className="mt-5 space-y-3">
              {visibleResources.slice(0, 4).map((resource, index) => (
                <div
                  key={`${resource.resourceId ?? resource.name}-${index}`}
                  className="rounded-[18px] border border-[#dbe4f4] bg-[#f7f9fe] px-4 py-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="break-words font-semibold text-[#173b72]">
                        {resource.name}
                      </p>
                      {resource.category ? (
                        <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8eaef5]">
                          {resource.category}
                        </p>
                      ) : null}
                    </div>
                    <span className="rounded-full bg-[#eef4ff] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#173b72]">
                      {resource.priority}
                    </span>
                  </div>
                  <p className="mt-2 break-words text-sm leading-7 text-[#62728f]">
                    {resource.reason}
                  </p>
                  {resource.contact ? (
                    <p className="mt-3 break-words text-sm font-medium text-[#173b72]">
                      {resource.contact}
                    </p>
                  ) : null}
                  {resource.eligibility ? (
                    <p className="mt-2 break-words text-sm text-[#62728f]">
                      {resource.eligibility}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          ) : resourceLoading ? (
            <div className="mt-5 rounded-[18px] border border-[#dbe4f4] bg-[#f7f9fe] px-4 py-4 text-sm text-[#62728f]">
              Matching support resources for this case...
            </div>
          ) : caseWorkspace.resourceInteractions.length ? (
            <div className="mt-5 space-y-3">
              {caseWorkspace.resourceInteractions.slice(0, 4).map((interaction, index) => (
                <div
                  key={`${interaction.id ?? interaction.resource_id}-${index}`}
                  className="rounded-[18px] border border-[#dbe4f4] bg-[#f7f9fe] px-4 py-4"
                >
                  <p className="font-semibold text-[#173b72]">
                    {interaction.resource?.name || interaction.resource?.title || "Tracked resource"}
                  </p>
                  <p className="mt-2 text-sm text-[#62728f]">
                    {interaction.status
                      ? `Current status: ${interaction.status}`
                      : "Saved for follow-up"}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-[18px] border border-[#dbe4f4] bg-[#f7f9fe] px-4 py-4 text-sm text-[#62728f]">
              Resource matches will appear here as soon as support options are available for this case.
            </div>
          )}
        </article>
      </section>

      <CaseRoadmapFlow
        caseId={caseId}
        priorities={caseWorkspace.priorities}
        roadmap={caseWorkspace.roadmap}
        stabilityScore={caseWorkspace.analysis.stabilityScore}
        onRoadmapChange={(roadmap) => {
          const nextPayload = {
            ...caseWorkspace,
            roadmap,
          } satisfies CaseWorkspacePayload;

          updateRoadmap(roadmap);
          applyWorkspace(nextPayload);
        }}
        onWorkspaceRefresh={({ analysis, assessment, priorities, roadmap, comparison }) => {
          const nextPayload = {
            ...caseWorkspace,
            latestAssessment: assessment,
            analysis,
            priorities,
            roadmap,
            comparison,
          } satisfies CaseWorkspacePayload;

          updateRoadmap(roadmap);
          applyWorkspace(nextPayload);
        }}
      />

      {frontendFeatures.enableReassessment ? (
        <section className="rounded-[24px] border border-[#dbe4f4] bg-white p-6 shadow-[0_8px_20px_-18px_rgba(17,43,89,0.3)]">
          <h3 className="font-heading text-[1.8rem] font-bold text-[#173b72]">
            Update This Case
          </h3>
          <p className="mt-3 text-[15px] leading-8 text-[#62728f]">
            Add a short update when the situation changes so the next review can
            compare the old and new snapshot clearly.
          </p>
          <textarea
            value={reassessmentChange}
            onChange={(event) => setReassessmentChange(event.target.value)}
            className="mt-5 min-h-32 w-full rounded-[18px] border border-[#d9deea] bg-[#fbfcff] px-4 py-4 text-sm leading-7 text-[#173b72] outline-none"
            placeholder="Describe what changed since the previous assessment."
          />
          <div className="mt-4">
            <Button
              type="button"
              disabled={reassessmentSubmitting || reassessmentChange.trim().length < 10}
              onClick={async () => {
                setReassessmentSubmitting(true);
                try {
                  const response = await createReassessment(caseId, {
                    whatChanged: reassessmentChange,
                  });
                  setComparison(response.data.comparison);
                  const reassessmentPriorities = Array.isArray(response.data.priorities)
                    ? response.data.priorities
                    : response.data.priorities.priorities;
                  const reassessmentRoadmap = Array.isArray(response.data.roadmap)
                    ? response.data.roadmap
                    : response.data.roadmap.roadmap;

                  applyWorkspace({
                    case: caseWorkspace.case,
                    initialSnapshot,
                    latestAssessment: response.data.assessment,
                    analysis: response.data.analysis,
                    priorities: reassessmentPriorities,
                    roadmap: reassessmentRoadmap,
                    simulations: caseWorkspace.simulations,
                    resourceInteractions: caseWorkspace.resourceInteractions,
                    resourceInteractionsAvailable:
                      caseWorkspace.resourceInteractionsAvailable,
                    comparison: response.data.comparison,
                  });
                  notify.success("Reassessment completed.");
                } catch (submitError) {
                  notify.error(
                    submitError instanceof Error
                      ? submitError.message
                      : "We couldn't complete the reassessment right now.",
                  );
                } finally {
                  setReassessmentSubmitting(false);
                }
              }}
            >
              {reassessmentSubmitting ? "Updating Case..." : "Create Reassessment"}
            </Button>
          </div>

          {comparison ? (
            <div className="mt-5 grid gap-4 xl:grid-cols-2">
              <div className="rounded-[18px] border border-[#dbe4f4] bg-[#f7f9fe] px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8eaef5]">
                  Stability Delta
                </p>
                <p className="mt-2 font-heading text-2xl font-bold text-[#173b72]">
                  {comparison.previousStabilityScore} to {comparison.currentStabilityScore}
                </p>
                <p className="mt-2 text-sm text-[#62728f]">{comparison.summary}</p>
              </div>
              <div className="rounded-[18px] border border-[#dbe4f4] bg-[#f7f9fe] px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8eaef5]">
                  Overall Risk
                </p>
                <p className="mt-2 text-sm font-semibold text-[#173b72]">
                  {comparison.previousOverallRisk} to {comparison.currentOverallRisk}
                </p>
              </div>
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
