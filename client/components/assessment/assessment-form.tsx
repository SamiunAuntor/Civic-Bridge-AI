"use client";

import { AlertTriangle, BrainCircuit, LoaderCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  createAssessment,
  screenAssessmentSafety,
  type CreateAssessmentBody,
  type SafetyScreeningResult,
} from "@/services/assessment-service";
import { fetchRecommendedResources } from "@/services/resource-service";
import { ApiError } from "@/lib/api-client";
import { notify } from "@/lib/feedback";
import { useAssessmentWorkspace } from "@/hooks/use-assessment-workspace";
import { frontendFeatures } from "@/lib/features";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { ResourceRecommendation } from "@/types/domain";

type IntakeProfile = NonNullable<CreateAssessmentBody["intakeProfile"]>;
type IntakeKey = keyof IntakeProfile;

const TOPIC_OPTIONS = [
  {
    key: "housing",
    label: "Housing only",
    description: "Rent pressure, eviction risk, unstable housing, or shelter access.",
    concerns: ["Housing or rent pressure"],
    sections: ["timePressure", "housingStatus", "incomeStatus", "supportLevel"],
  },
  {
    key: "income",
    label: "Income or work",
    description: "Job loss, hours cut, bills stacking up, or no reliable income.",
    concerns: ["Job loss or reduced income"],
    sections: ["timePressure", "incomeStatus", "essentialNeedsStatus", "supportLevel"],
  },
  {
    key: "essentials",
    label: "Food and essentials",
    description: "Food, transport, utilities, or daily needs are getting hard to cover.",
    concerns: ["Food or essential needs"],
    sections: ["timePressure", "essentialNeedsStatus", "incomeStatus", "supportLevel"],
  },
  {
    key: "healthcare",
    label: "Healthcare",
    description: "Medication, treatment, insurance, or urgent health access concerns.",
    concerns: ["Healthcare or medication access"],
    sections: ["timePressure", "healthcareStatus", "incomeStatus", "supportLevel"],
  },
  {
    key: "safety",
    label: "Safety",
    description: "Personal safety, immediate danger, or unsafe living conditions.",
    concerns: ["Personal safety concerns"],
    sections: ["timePressure", "safetyStatus", "housingStatus", "supportLevel"],
  },
  {
    key: "caregiving",
    label: "Dependents or caregiving",
    description: "Children, elders, or dependents are affected by the crisis too.",
    concerns: ["Caregiving or dependent support"],
    sections: ["timePressure", "supportLevel", "incomeStatus", "essentialNeedsStatus"],
  },
  {
    key: "benefits",
    label: "Benefits or paperwork",
    description: "Applications, paperwork, benefits, legal notices, or access barriers.",
    concerns: ["Legal, paperwork, or benefit access"],
    sections: ["timePressure", "incomeStatus", "housingStatus", "supportLevel"],
  },
  {
    key: "multi",
    label: "Multiple areas at once",
    description: "Several parts of life are breaking down together and need a broader review.",
    concerns: [
      "Housing or rent pressure",
      "Job loss or reduced income",
      "Food or essential needs",
      "Healthcare or medication access",
    ],
    sections: [
      "timePressure",
      "housingStatus",
      "incomeStatus",
      "essentialNeedsStatus",
      "healthcareStatus",
      "safetyStatus",
      "supportLevel",
    ],
  },
] as const;

const SINGLE_SELECT_SECTIONS = [
  {
    key: "timePressure",
    label: "How urgent is it?",
    options: [
      "Within 24 hours",
      "Within 1 to 3 days",
      "Within 1 to 2 weeks",
      "Within 3 to 4 weeks",
      "More than one month",
    ],
  },
  {
    key: "housingStatus",
    label: "Housing status",
    options: [
      "Housing is stable",
      "Housing costs are difficult",
      "Behind on rent or at risk",
      "Eviction notice or urgent warning",
      "No safe place to stay tonight",
    ],
  },
  {
    key: "incomeStatus",
    label: "Income status",
    options: [
      "Income is stable",
      "Income was reduced",
      "Recently lost income or work",
      "Using savings or temporary help",
      "No reliable income right now",
    ],
  },
  {
    key: "essentialNeedsStatus",
    label: "Basic needs",
    options: [
      "Food and bills are covered",
      "Covered, but very tight",
      "Under real pressure",
      "May lose access very soon",
      "Not fully covered right now",
    ],
  },
  {
    key: "healthcareStatus",
    label: "Healthcare status",
    options: [
      "Managed for now",
      "Delayed, but not urgent",
      "Medication or treatment is hard",
      "Urgent care is needed soon",
      "Immediate medical help is needed",
    ],
  },
  {
    key: "safetyStatus",
    label: "Personal safety",
    options: [
      "No current threat",
      "Concerned, but not immediate danger",
      "There is a real safety concern",
      "I feel unsafe right now",
      "Immediate danger right now",
    ],
  },
  {
    key: "supportLevel",
    label: "Available support",
    options: [
      "Strong support is available",
      "Some support is available",
      "Support is limited",
      "Very few options are available",
      "No reliable support right now",
    ],
  },
] as const satisfies ReadonlyArray<{
  key: Exclude<IntakeKey, "primaryConcerns" | "topic">;
  label: string;
  options: readonly string[];
}>;

const SECTION_LOOKUP = Object.fromEntries(
  SINGLE_SELECT_SECTIONS.map((section) => [section.key, section]),
) as Record<(typeof SINGLE_SELECT_SECTIONS)[number]["key"], (typeof SINGLE_SELECT_SECTIONS)[number]>;

const EMPTY_PROFILE: IntakeProfile = {
  topic: "",
  primaryConcerns: [],
  timePressure: "",
  housingStatus: "",
  incomeStatus: "",
  essentialNeedsStatus: "",
  healthcareStatus: "",
  safetyStatus: "",
  supportLevel: "",
};

function buildIntakeContextSummary(intakeProfile: IntakeProfile) {
  const lines = [
    intakeProfile.topic ? `Case topic: ${intakeProfile.topic}` : null,
    intakeProfile.primaryConcerns?.length
      ? `Primary concerns: ${intakeProfile.primaryConcerns.join(", ")}`
      : null,
    intakeProfile.timePressure ? `Time pressure: ${intakeProfile.timePressure}` : null,
    intakeProfile.housingStatus ? `Housing status: ${intakeProfile.housingStatus}` : null,
    intakeProfile.incomeStatus ? `Income status: ${intakeProfile.incomeStatus}` : null,
    intakeProfile.essentialNeedsStatus
      ? `Essential needs: ${intakeProfile.essentialNeedsStatus}`
      : null,
    intakeProfile.healthcareStatus
      ? `Healthcare status: ${intakeProfile.healthcareStatus}`
      : null,
    intakeProfile.safetyStatus ? `Safety status: ${intakeProfile.safetyStatus}` : null,
    intakeProfile.supportLevel ? `Support level: ${intakeProfile.supportLevel}` : null,
  ].filter(Boolean);

  return lines.length ? `\n\nStructured intake context:\n${lines.join("\n")}` : "";
}

function topicTitle(topicLabel: string, situation: string) {
  const summary = situation.trim().replace(/\s+/g, " ").slice(0, 56);

  if (!summary) {
    return topicLabel;
  }

  return `${topicLabel}: ${summary}`;
}

export function AssessmentForm() {
  const router = useRouter();
  const { setWorkspace } = useAssessmentWorkspace();
  const [situation, setSituation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [safetyResult, setSafetyResult] = useState<SafetyScreeningResult | null>(null);
  const [intakeProfile, setIntakeProfile] = useState<IntakeProfile>(EMPTY_PROFILE);

  useEffect(() => {
    setConsentAccepted(
      window.localStorage.getItem("civicbridge.ai-consent") === "accepted",
    );
  }, []);

  const selectedTopic = useMemo(
    () => TOPIC_OPTIONS.find((topic) => topic.label === intakeProfile.topic) ?? null,
    [intakeProfile.topic],
  );

  const activeSections = useMemo(() => {
    if (!selectedTopic) {
      return [SECTION_LOOKUP.timePressure, SECTION_LOOKUP.supportLevel];
    }

    return selectedTopic.sections.map((key) => SECTION_LOOKUP[key]);
  }, [selectedTopic]);

  function selectTopic(topicKey: (typeof TOPIC_OPTIONS)[number]["key"]) {
    const topic = TOPIC_OPTIONS.find((option) => option.key === topicKey);

    if (!topic) {
      return;
    }

    setIntakeProfile((current) => ({
      ...current,
      topic: topic.label,
      primaryConcerns: [...topic.concerns],
    }));
  }

  function updateField(key: Exclude<IntakeKey, "primaryConcerns">, value: string) {
    setIntakeProfile((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!intakeProfile.topic) {
      notify.error("Choose the case topic first so the intake stays focused.");
      return;
    }

    if (!consentAccepted) {
      notify.error("Please confirm the AI guidance notice before continuing.");
      return;
    }

    const loadingToastId = notify.loading("Opening your case workspace...");
    const intakeContext = buildIntakeContextSummary(intakeProfile);

    setSubmitting(true);
    setError(null);
    setSafetyResult(null);

    try {
      if (frontendFeatures.enableEmergencyScreening) {
        const screening = await screenAssessmentSafety({ situation });
        setSafetyResult(screening.data);

        if (screening.data.isUrgent) {
          notify.error(
            "Urgent safety concerns were detected. Please review the immediate guidance before continuing.",
          );
        }
      }

      const response = await createAssessment({
        situation,
        intakeProfile,
      });
      const nextResult = response.data;

      let recommendedResources: ResourceRecommendation[] = [];

      try {
        const resourcesResult = await fetchRecommendedResources({
          situation: `${situation}${intakeContext}`,
          analysis: {
            housingRisk: nextResult.analysis.housingRisk,
            incomeRisk: nextResult.analysis.incomeRisk,
            healthcareRisk: nextResult.analysis.healthcareRisk,
            overallRisk: nextResult.analysis.overallRisk,
          },
        });
        recommendedResources = resourcesResult.data.resources;
      } catch {
        notify.info(
          "Your case is ready. Resource suggestions will appear as soon as matching finishes.",
        );
      }

      setWorkspace(
        {
          situation,
          assessment: nextResult.assessment,
          analysis: nextResult.analysis,
          initialSnapshot: {
            assessment: nextResult.assessment,
            analysis: nextResult.analysis,
          },
          priorities: nextResult.priorities.priorities,
          roadmap: nextResult.roadmap.roadmap,
          resources: recommendedResources,
          simulations: [],
          currentCase: nextResult.caseId
            ? {
                id: nextResult.caseId,
                user_id: nextResult.assessment.user_id,
                title: topicTitle(intakeProfile.topic, situation),
                status:
                  nextResult.analysis.overallRisk === "HIGH"
                    ? "URGENT"
                    : nextResult.analysis.overallRisk === "LOW"
                      ? "STABLE"
                      : "ACTIVE",
                main_risk: nextResult.analysis.overallRisk,
                initial_stability_score: nextResult.analysis.stabilityScore,
                latest_stability_score: nextResult.analysis.stabilityScore,
                current_assessment_id: nextResult.assessment.id,
                last_activity_at: new Date().toISOString(),
              }
            : null,
          resourceInteractions: [],
          resourceInteractionsAvailable: frontendFeatures.enableResourceInteractions,
          comparison: null,
        },
        {
          selectedCaseId: nextResult.caseId ?? null,
        },
      );

      notify.dismiss(loadingToastId);
      notify.success("Your case workspace is ready.");

      if (nextResult.caseId) {
        router.push("/cases");
      } else {
        router.push("/dashboard");
      }
    } catch (submitError) {
      notify.dismiss(loadingToastId);

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
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-8">
        <section className="space-y-4">
          <p className="text-sm font-semibold text-[#173b72]">Case topic</p>
          <div className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-3">
            {TOPIC_OPTIONS.map((topic) => {
              const active = intakeProfile.topic === topic.label;

              return (
                <label
                  key={topic.key}
                  className={
                    active
                      ? "flex cursor-pointer gap-3 rounded-[18px] border border-[#173b72] bg-[#eef4ff] px-4 py-4"
                      : "flex cursor-pointer gap-3 rounded-[18px] border border-[#d9deea] bg-white px-4 py-4"
                  }
                >
                  <input
                    type="radio"
                    name="case-topic"
                    value={topic.key}
                    checked={active}
                    onChange={() => selectTopic(topic.key)}
                    className="mt-1 h-4 w-4 shrink-0 border-[#b7c5dc] text-[#173b72]"
                  />
                  <div>
                    <p className="text-sm font-semibold text-[#173b72]">{topic.label}</p>
                    <p className="mt-1 text-sm leading-6 text-[#62728f]">
                      {topic.description}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
        </section>

        <section className="space-y-6">
          {activeSections.map((section) => (
            <div key={section.key} className="space-y-3">
              <p className="text-sm font-semibold text-[#173b72]">{section.label}</p>
              <div className="grid gap-2 lg:grid-cols-2 2xl:grid-cols-3">
                {section.options.map((option) => {
                  const active = intakeProfile[section.key] === option;

                  return (
                    <label
                      key={option}
                      className={
                        active
                          ? "flex cursor-pointer items-start gap-3 rounded-[16px] border border-[#173b72] bg-[#eef4ff] px-4 py-3"
                          : "flex cursor-pointer items-start gap-3 rounded-[16px] border border-[#d9deea] bg-white px-4 py-3"
                      }
                    >
                      <input
                        type="radio"
                        name={section.key}
                        checked={active}
                        onChange={() => updateField(section.key, option)}
                        className="mt-1 h-4 w-4 shrink-0 border-[#b7c5dc] text-[#173b72]"
                      />
                      <span
                        className={
                          active
                            ? "text-sm font-semibold text-[#173b72]"
                            : "text-sm text-[#5f6f8a]"
                        }
                      >
                        {option}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </section>

        <section className="space-y-5 border-t border-[#dbe4f4] pt-7">
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#173b72]">
              Situation details
            </label>
            <Textarea
              value={situation}
              onChange={(event) => setSituation(event.target.value)}
              placeholder="What happened, what is urgent, what is at risk, and what decision are you struggling with right now?"
              rows={8}
            />
            <p className="mt-2 text-sm text-[#7b8aa3]">Minimum 10 characters.</p>
          </div>

          {safetyResult?.isUrgent ? (
            <div className="rounded-2xl border border-danger/20 bg-danger-soft px-4 py-4 text-sm text-danger">
              <p className="font-semibold">{safetyResult.message}</p>
              <p className="mt-2 leading-7">
                {safetyResult.recommendedImmediateAction}
              </p>
            </div>
          ) : null}

          {error ? (
            <div className="rounded-2xl border border-danger/20 bg-danger-soft px-4 py-3 text-sm text-danger">
              {error}
            </div>
          ) : null}

          <div className="rounded-2xl border border-[#dbe4f4] bg-[#f7f9fe] px-4 py-4">
            <label className="flex items-start gap-3 text-sm text-[#62728f]">
              <input
                type="checkbox"
                checked={consentAccepted}
                onChange={(event) => {
                  const checked = event.target.checked;
                  setConsentAccepted(checked);
                  if (checked) {
                    window.localStorage.setItem("civicbridge.ai-consent", "accepted");
                  } else {
                    window.localStorage.removeItem("civicbridge.ai-consent");
                  }
                }}
                className="mt-1 h-4 w-4 rounded border-[#cbd5e1]"
              />
              <span>
                I understand AI will help interpret this case and that the result is guidance, not emergency or professional advice.
              </span>
            </label>
          </div>

          <div className="rounded-2xl border border-[#f4ddd8] bg-[#fff5f2] px-4 py-4 text-sm text-[#bf4a34]">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <p className="leading-7">
                If there is immediate danger, severe health risk, or no safe place to stay tonight,
                contact emergency or local crisis support first.
              </p>
            </div>
          </div>

          <Button
            type="submit"
            disabled={submitting || situation.trim().length < 10 || !intakeProfile.topic}
            className="w-full"
          >
            {submitting ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <BrainCircuit className="h-4 w-4" />
            )}
            Start New Case
          </Button>
        </section>
      </div>
    </form>
  );
}
