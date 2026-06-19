"use client";

import {
  AlertTriangle,
  ArrowRight,
  BrainCircuit,
  LoaderCircle,
  Orbit,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { createAssessment } from "@/services/assessment-service";
import { fetchPriorities } from "@/services/priority-service";
import { fetchRecommendedResources } from "@/services/resource-service";
import { fetchRoadmap } from "@/services/roadmap-service";
import { createSimulation } from "@/services/simulation-service";
import { ApiError } from "@/lib/api-client";
import { notify } from "@/lib/feedback";
import { useAssessmentWorkspace } from "@/hooks/use-assessment-workspace";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import type { CreateAssessmentResult } from "@/services/assessment-service";
import type {
  Priority,
  ResourceRecommendation,
  RoadmapItem,
} from "@/types/domain";

export function AssessmentForm() {
  const {
    appendSimulation,
    setWorkspace,
    updatePriorities,
    updateResources,
    updateRoadmap,
  } = useAssessmentWorkspace();
  const [situation, setSituation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CreateAssessmentResult | null>(null);
  const [savedPriorities, setSavedPriorities] = useState<Priority[]>([]);
  const [savedRoadmap, setSavedRoadmap] = useState<RoadmapItem[]>([]);
  const [recommendedResources, setRecommendedResources] = useState<
    ResourceRecommendation[]
  >([]);
  const [followUpErrors, setFollowUpErrors] = useState<{
    priorities?: string;
    roadmap?: string;
    resources?: string;
  }>({});
  const [loadingFollowUps, setLoadingFollowUps] = useState(false);
  const [simulationDecision, setSimulationDecision] = useState("");
  const [simulationSubmitting, setSimulationSubmitting] = useState(false);
  const [simulationError, setSimulationError] = useState<string | null>(null);
  const [simulationResult, setSimulationResult] = useState<Awaited<
    ReturnType<typeof createSimulation>
  >["data"] | null>(null);

  function resetConnectedState() {
    setSavedPriorities([]);
    setSavedRoadmap([]);
    setRecommendedResources([]);
    setFollowUpErrors({});
    setSimulationDecision("");
    setSimulationError(null);
    setSimulationResult(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const loadingToastId = notify.loading("Creating your assessment...");
    setSubmitting(true);
    setError(null);
    resetConnectedState();

    try {
      const response = await createAssessment({ situation });
      const nextResult = response.data;

      setResult(nextResult);
      setSavedPriorities(nextResult.priorities.priorities);
      setSavedRoadmap(nextResult.roadmap.roadmap);
      setWorkspace({
        situation,
        assessment: nextResult.assessment,
        analysis: nextResult.analysis,
        priorities: nextResult.priorities.priorities,
        roadmap: nextResult.roadmap.roadmap,
        resources: [],
        simulations: [],
      });
      setLoadingFollowUps(true);

      const [prioritiesResult, roadmapResult, resourcesResult] =
        await Promise.allSettled([
          fetchPriorities(nextResult.assessment.id),
          fetchRoadmap(nextResult.assessment.id),
          fetchRecommendedResources({
            situation,
            analysis: {
              housingRisk: nextResult.analysis.housingRisk,
              incomeRisk: nextResult.analysis.incomeRisk,
              healthcareRisk: nextResult.analysis.healthcareRisk,
              overallRisk: nextResult.analysis.overallRisk,
            },
          }),
        ]);

      if (prioritiesResult.status === "fulfilled") {
        setSavedPriorities(prioritiesResult.value.data);
        updatePriorities(prioritiesResult.value.data);
      } else {
        setFollowUpErrors((current) => ({
          ...current,
          priorities: "Your assessment was saved, but the priority list could not be refreshed yet.",
        }));
      }

      if (roadmapResult.status === "fulfilled") {
        setSavedRoadmap(roadmapResult.value.data);
        updateRoadmap(roadmapResult.value.data);
      } else {
        setFollowUpErrors((current) => ({
          ...current,
          roadmap: "Your assessment was saved, but the roadmap could not be refreshed yet.",
        }));
      }

      if (resourcesResult.status === "fulfilled") {
        setRecommendedResources(resourcesResult.value.data.resources);
        updateResources(resourcesResult.value.data.resources);
      } else {
        setFollowUpErrors((current) => ({
          ...current,
          resources:
            "We couldn't load matched support resources yet.",
        }));
      }

      notify.dismiss(loadingToastId);
      notify.success("Your assessment is ready.");

      if (
        prioritiesResult.status !== "fulfilled" ||
        roadmapResult.status !== "fulfilled" ||
        resourcesResult.status !== "fulfilled"
      ) {
        notify.info(
          "Some supporting details are still catching up. You can continue reviewing your results.",
        );
      }
    } catch (submitError) {
      notify.dismiss(loadingToastId);
      setResult(null);
      if (submitError instanceof ApiError) {
        const message =
          submitError.status === 500
            ? "We couldn't complete your assessment right now. Please try again in a moment."
            : submitError.message;
        setError(message);
        notify.error(message);
      } else {
        const message = "Unable to submit the assessment right now.";
        setError(message);
        notify.error(message);
      }
    } finally {
      notify.dismiss(loadingToastId);
      setLoadingFollowUps(false);
      setSubmitting(false);
    }
  }

  async function handleSimulationSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!result) {
      return;
    }

    setSimulationSubmitting(true);
    setSimulationError(null);
    const loadingToastId = notify.loading("Comparing that option...");

    try {
      const response = await createSimulation({
        assessmentId: result.assessment.id,
        decision: simulationDecision,
      });

      setSimulationResult(response.data);
      appendSimulation(response.data.simulation);
      notify.dismiss(loadingToastId);
      notify.success("Simulation complete.");
    } catch (submitError) {
      notify.dismiss(loadingToastId);
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Unable to simulate that decision right now.";
      setSimulationError(message);
      notify.error(message);
    } finally {
      notify.dismiss(loadingToastId);
      setSimulationSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="p-6 md:p-7">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">
                Situation
              </label>
              <Textarea
                value={situation}
                onChange={(event) => setSituation(event.target.value)}
                placeholder="Explain what you're facing in natural language. Include urgency, financial pressure, housing concerns, healthcare issues, or other overlapping factors."
                rows={10}
              />
              <p className="mt-2 text-sm text-muted-foreground">
                Please enter at least 10 characters so we can assess the
                situation clearly.
              </p>
            </div>

            {error ? (
              <div className="rounded-2xl border border-danger/20 bg-danger-soft px-4 py-3 text-sm text-danger">
                {error}
              </div>
            ) : null}

            <Button type="submit" disabled={submitting || situation.trim().length < 10}>
              {submitting ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <BrainCircuit className="h-4 w-4" />
              )}
              Submit Assessment
            </Button>
          </form>
        </Card>

        <Card className="p-6 md:p-7">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-surface-strong text-danger">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-heading text-2xl font-bold text-foreground">
                What You&apos;ll Receive
              </h2>
              <p className="text-sm text-muted-foreground">
                After submission, Civic Bridge AI can help you with:
              </p>
            </div>
          </div>
          <ul className="space-y-3 text-sm leading-7 text-muted-foreground">
            <li>A clear stability score and concise risk summary</li>
            <li>Prioritized concerns that need attention first</li>
            <li>A roadmap of practical next steps</li>
            <li>Matched support resources based on your situation</li>
            <li>Decision comparisons to help you plan your next move</li>
          </ul>
        </Card>
      </div>

      {result ? (
        <section className="grid gap-5 xl:grid-cols-3">
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">Assessment</p>
            <h3 className="mt-2 font-heading text-xl font-bold">
              Stability Score
            </h3>
            <p className="mt-4 text-5xl font-bold text-primary">
              {result.analysis.stabilityScore}
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              {result.analysis.summary}
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">Saved Priorities</p>
              {loadingFollowUps ? (
                <span className="inline-flex items-center gap-2 text-xs font-semibold text-secondary">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  Syncing
                </span>
              ) : null}
            </div>
            <div className="mt-4 space-y-3">
              {savedPriorities.map((priority) => (
                <div
                  key={`${priority.id ?? priority.title ?? "priority"}-${priority.order ?? priority.priority_order ?? 0}`}
                  className="rounded-2xl border border-border/70 bg-surface px-4 py-3"
                >
                  <p className="font-semibold text-foreground">
                    {priority.title || "Priority item"}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {priority.reasoning || "No explanation was returned."}
                  </p>
                </div>
              ))}
            </div>
            {followUpErrors.priorities ? (
              <p className="mt-4 text-sm text-danger">{followUpErrors.priorities}</p>
            ) : null}
          </Card>

          <Card className="p-6">
            <p className="text-sm text-muted-foreground">Saved Roadmap</p>
            <div className="mt-4 space-y-3">
              {savedRoadmap.map((item, index) => (
                <div
                  key={`${item.id ?? "roadmap"}-${item.timeline ?? "timeline"}-${item.task ?? "task"}-${index}`}
                  className="rounded-2xl border border-border/70 bg-surface px-4 py-3"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
                    {item.timeline || "NEXT STEP"}
                  </p>
                  <p className="mt-1 font-medium text-foreground">
                    {item.task || "No roadmap task was returned."}
                  </p>
                </div>
              ))}
            </div>
            {followUpErrors.roadmap ? (
              <p className="mt-4 text-sm text-danger">{followUpErrors.roadmap}</p>
            ) : null}
          </Card>

          <Card className="p-6 xl:col-span-2">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-surface-strong text-primary">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-heading text-2xl font-bold text-foreground">
                  Recommended Resources
                </h3>
                <p className="text-sm text-muted-foreground">
                  Support options matched to your current situation
                </p>
              </div>
            </div>
            {recommendedResources.length ? (
              <div className="grid gap-4 md:grid-cols-2">
                {recommendedResources.map((resource, index) => (
                  <div
                    key={`${resource.name ?? "resource"}-${resource.priority ?? "priority"}-${index}`}
                    className="rounded-2xl border border-border/70 bg-surface px-4 py-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-foreground">
                        {resource.name || "Recommended Resource"}
                      </p>
                      <span className="rounded-full bg-[#eef4ff] px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                        {resource.priority || "MATCH"}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">
                      {resource.reason || "No explanation was returned."}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No resource matches yet"
                message="Resource suggestions will appear here once matching results are available."
              />
            )}
            {followUpErrors.resources ? (
              <p className="mt-4 text-sm text-danger">{followUpErrors.resources}</p>
            ) : null}
          </Card>

          <Card className="p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-surface-strong text-primary">
                <Orbit className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-heading text-2xl font-bold text-foreground">
                  Decision Simulation
                </h3>
                <p className="text-sm text-muted-foreground">
                  Compare possible next steps before you act
                </p>
              </div>
            </div>

            <form className="space-y-4" onSubmit={handleSimulationSubmit}>
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">
                  Proposed Decision
                </label>
                <Textarea
                  value={simulationDecision}
                  onChange={(event) => setSimulationDecision(event.target.value)}
                  placeholder="Example: Use my remaining savings to cover rent this week before applying for additional aid."
                  rows={5}
                />
              </div>

              {simulationError ? (
                <div className="rounded-2xl border border-danger/20 bg-danger-soft px-4 py-3 text-sm text-danger">
                  {simulationError}
                </div>
              ) : null}

              <Button
                type="submit"
                disabled={simulationSubmitting || simulationDecision.trim().length < 5}
              >
                {simulationSubmitting ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
                Simulate Decision
              </Button>
            </form>

            {simulationResult ? (
              <div className="mt-6 space-y-3">
                <div className="rounded-2xl border border-border/70 bg-surface px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
                    Summary
                  </p>
                  <p className="mt-2 text-sm leading-7 text-foreground">
                    {simulationResult.simulation.summary}
                  </p>
                </div>
                <div className="grid gap-3">
                  <div className="rounded-2xl border border-border/70 bg-surface px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
                      Housing Impact
                    </p>
                    <p className="mt-2 text-sm text-foreground">
                      {simulationResult.simulation.housingImpact ??
                        simulationResult.simulation.housing_impact}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-surface px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
                      Income Impact
                    </p>
                    <p className="mt-2 text-sm text-foreground">
                      {simulationResult.simulation.incomeImpact ??
                        simulationResult.simulation.income_impact}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-surface px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
                      Health Impact
                    </p>
                    <p className="mt-2 text-sm text-foreground">
                      {simulationResult.simulation.healthImpact ??
                        simulationResult.simulation.health_impact}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-surface px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
                      Recommended Action
                    </p>
                    <p className="mt-2 text-sm text-foreground">
                      {simulationResult.simulation.recommendedAction ??
                        simulationResult.simulation.recommended_action}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </Card>
        </section>
      ) : (
        <EmptyState
          title="No assessment result yet"
          message="Complete an assessment to view your score, priorities, roadmap, resource suggestions, and decision planning in one place."
        />
      )}
    </div>
  );
}
