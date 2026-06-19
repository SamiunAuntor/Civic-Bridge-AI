"use client";

import { AlertTriangle, BrainCircuit, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { createAssessment } from "@/services/assessment-service";
import { ApiError } from "@/lib/api-client";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import type { CreateAssessmentResult } from "@/services/assessment-service";

export function AssessmentForm() {
  const [situation, setSituation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CreateAssessmentResult | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await createAssessment({ situation });
      setResult(response.data);
    } catch (submitError) {
      if (submitError instanceof ApiError) {
        setError(
          submitError.status === 500
            ? "The backend assessment endpoint is currently unstable. The form is ready, but the known server blocker still needs to be resolved."
            : submitError.message,
        );
      } else {
        setError("Unable to submit the assessment right now.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[28px] border border-border/60 bg-panel p-6 shadow-soft md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-secondary">
              New Assessment
            </p>
            <h1 className="mt-3 font-heading text-4xl font-bold text-primary">
              Describe the situation
            </h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              The backend currently accepts one required field: `situation`.
              This UI is wired to the real endpoint and avoids mock flows.
            </p>
          </div>
          <div className="rounded-2xl border border-danger/20 bg-danger-soft px-4 py-3 text-sm text-danger">
            Assessment creation is connected, but backend success is not
            guaranteed until the known server blocker is fixed.
          </div>
        </div>
      </section>

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
                The backend validator currently requires at least 10
                characters.
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
                Integration Notes
              </h2>
              <p className="text-sm text-muted-foreground">
                What this foundation is ready for
              </p>
            </div>
          </div>
          <ul className="space-y-3 text-sm leading-7 text-muted-foreground">
            <li>Authenticated `POST /api/assessments` submission</li>
            <li>Typed response handling for assessment, analysis, priorities, and roadmap</li>
            <li>Graceful server-error messaging while the backend bug remains unresolved</li>
            <li>Layout and components designed so Stitch result screens can be dropped in next</li>
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
            <p className="text-sm text-muted-foreground">Top Priorities</p>
            <div className="mt-4 space-y-3">
              {result.priorities.priorities.map((priority) => (
                <div
                  key={`${priority.title}-${priority.order ?? priority.priority_order}`}
                  className="rounded-2xl border border-border/70 bg-surface px-4 py-3"
                >
                  <p className="font-semibold text-foreground">{priority.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {priority.reasoning}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <p className="text-sm text-muted-foreground">Roadmap</p>
            <div className="mt-4 space-y-3">
              {result.roadmap.roadmap.map((item) => (
                <div
                  key={`${item.timeline}-${item.task}`}
                  className="rounded-2xl border border-border/70 bg-surface px-4 py-3"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
                    {item.timeline}
                  </p>
                  <p className="mt-1 font-medium text-foreground">{item.task}</p>
                </div>
              ))}
            </div>
          </Card>
        </section>
      ) : (
        <EmptyState
          title="No assessment result yet"
          message="Submit the form when the backend is ready, and the result pane can render immediately without more frontend restructuring."
        />
      )}
    </div>
  );
}
