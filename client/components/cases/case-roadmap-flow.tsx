"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  CircleDashed,
  CircleOff,
  Clock3,
  Play,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { createReassessment } from "@/services/reassessment-service";
import { updateRoadmapTask } from "@/services/roadmap-service";
import { notify } from "@/lib/feedback";
import type {
  Assessment,
  Priority,
  ReassessmentComparison,
  RiskAnalysis,
  RoadmapItem,
} from "@/types/domain";

type RoadmapStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "BLOCKED";

function formatDate(value?: string | null) {
  if (!value) {
    return "No due date";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function deriveStatus(item: RoadmapItem): RoadmapStatus {
  return item.status ?? "NOT_STARTED";
}

function truncateText(value?: string | null, maxLength = 120) {
  if (!value) {
    return "";
  }

  const cleaned = value.replace(/\s+/g, " ").trim();
  return cleaned.length <= maxLength
    ? cleaned
    : `${cleaned.slice(0, maxLength).trimEnd()}...`;
}

function priorityTone(index: number) {
  if (index === 0) {
    return "border-[#f3d1cb] bg-[#fff5f2] text-[#bf4a34]";
  }

  if (index === 1) {
    return "border-[#f3e4b8] bg-[#fffaf0] text-[#9a6a00]";
  }

  return "border-[#dce5fb] bg-[#eef4ff] text-[#31538e]";
}

function statusMeta(status: RoadmapStatus) {
  if (status === "COMPLETED") {
    return {
      label: "Completed",
      classes: "border-[#d7ede4] bg-[#f1fbf6] text-[#2c7d5b]",
      icon: CheckCircle2,
    };
  }

  if (status === "IN_PROGRESS") {
    return {
      label: "In progress",
      classes: "border-[#dce5fb] bg-[#eef4ff] text-[#31538e]",
      icon: Play,
    };
  }

  if (status === "BLOCKED") {
    return {
      label: "Blocked",
      classes: "border-[#f3d1cb] bg-[#fff5f2] text-[#bf4a34]",
      icon: CircleOff,
    };
  }

  return {
    label: "Not started",
    classes: "border-[#d9deea] bg-[#f7f9fe] text-[#62728f]",
    icon: CircleDashed,
  };
}

function buildOptimisticRoadmap(
  roadmap: RoadmapItem[],
  roadmapId: string,
  patch: {
    status?: RoadmapStatus;
    userNote?: string | null;
    outcome?: string | null;
  },
) {
  return roadmap.map((item) => {
    if (item.id !== roadmapId) {
      return item;
    }

    const nextItem: RoadmapItem = { ...item };

    if (patch.status !== undefined) {
      nextItem.status = patch.status;

      if (patch.status === "IN_PROGRESS" && !nextItem.started_at) {
        nextItem.started_at = new Date().toISOString();
      }

      if (patch.status === "COMPLETED") {
        nextItem.completed_at = new Date().toISOString();
      }
    }

    if (patch.userNote !== undefined) {
      nextItem.user_note = patch.userNote;
    }

    if (patch.outcome !== undefined) {
      nextItem.outcome = patch.outcome;
    }

    return nextItem;
  });
}

export function CaseRoadmapFlow({
  caseId,
  priorities,
  roadmap,
  stabilityScore,
  onRoadmapChange,
  onWorkspaceRefresh,
}: {
  caseId: string;
  priorities: Priority[];
  roadmap: RoadmapItem[];
  stabilityScore: number;
  onRoadmapChange: (roadmap: RoadmapItem[]) => void;
  onWorkspaceRefresh: (payload: {
    analysis: RiskAnalysis;
    assessment: Assessment;
    priorities: Priority[];
    roadmap: RoadmapItem[];
    comparison: ReassessmentComparison | null;
  }) => void;
}) {
  const [localRoadmap, setLocalRoadmap] = useState(roadmap);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [draftNotes, setDraftNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    setLocalRoadmap(roadmap);
  }, [roadmap]);

  const actionableIndex = useMemo(
    () => localRoadmap.findIndex((item) => deriveStatus(item) !== "COMPLETED"),
    [localRoadmap],
  );

  async function applyUpdate(
    roadmapId: string,
    patch: {
      status?: RoadmapStatus;
      userNote?: string | null;
      outcome?: string | null;
    },
    successMessage: string,
  ) {
    const previousRoadmap = localRoadmap;
    const optimisticRoadmap = buildOptimisticRoadmap(previousRoadmap, roadmapId, patch);

    setPendingId(roadmapId);
    setLocalRoadmap(optimisticRoadmap);
    onRoadmapChange(optimisticRoadmap);

    try {
      const response = await updateRoadmapTask(roadmapId, patch);
      const syncedRoadmap = optimisticRoadmap.map((item) =>
        item.id === roadmapId ? { ...item, ...response.data } : item,
      );

      setLocalRoadmap(syncedRoadmap);
      onRoadmapChange(syncedRoadmap);
      notify.success(successMessage);

      if (patch.status === "COMPLETED") {
        const allCompleted = syncedRoadmap.every(
          (item) => deriveStatus(item) === "COMPLETED",
        );

        if (allCompleted && stabilityScore < 100) {
          try {
            const completedTask = syncedRoadmap.find((item) => item.id === roadmapId);
            const reassessment = await createReassessment(caseId, {
              whatChanged: `Completed roadmap step: ${completedTask?.task || "A case task"}.`,
              userNote:
                patch.outcome ||
                patch.userNote ||
                completedTask?.user_note ||
                completedTask?.task ||
                "Task completed",
            });

            const nextPriorities = Array.isArray(reassessment.data.priorities)
              ? reassessment.data.priorities
              : reassessment.data.priorities.priorities;
            const nextRoadmap = Array.isArray(reassessment.data.roadmap)
              ? reassessment.data.roadmap
              : reassessment.data.roadmap.roadmap;

            onWorkspaceRefresh({
              assessment: reassessment.data.assessment,
              analysis: reassessment.data.analysis,
              priorities: nextPriorities,
              roadmap: nextRoadmap,
              comparison: reassessment.data.comparison,
            });
            notify.success("A new roadmap was generated for the next stage.");
          } catch (reassessmentError) {
            notify.info(
              reassessmentError instanceof Error
                ? reassessmentError.message
                : "The step was saved, but the next roadmap could not be generated yet.",
            );
          }
        } else if (allCompleted) {
          notify.success("All roadmap steps are complete.");
        }
      }
    } catch (error) {
      setLocalRoadmap(previousRoadmap);
      onRoadmapChange(previousRoadmap);
      notify.error(
        error instanceof Error
          ? error.message
          : "We couldn't save that roadmap update.",
      );
    } finally {
      setPendingId(null);
    }
  }

  return (
    <section className="rounded-[24px] border border-[#dbe4f4] bg-white p-6 shadow-[0_8px_20px_-18px_rgba(17,43,89,0.3)]">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h3 className="font-heading text-[1.9rem] font-bold text-[#173b72]">
            Priority Roadmap
          </h3>
          <p className="mt-2 text-sm text-[#62728f]">
            Focus on the most urgent priorities first, then move through the steps in order.
          </p>
        </div>
        <div className="rounded-full bg-[#eef4ff] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#173b72]">
          {localRoadmap.filter((item) => deriveStatus(item) === "COMPLETED").length} of{" "}
          {localRoadmap.length} completed
        </div>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-3">
        {priorities.slice(0, 3).map((priority, index) => (
          <div
            key={`${priority.id ?? priority.title ?? "priority"}-${index}`}
            className={`rounded-[18px] border px-4 py-4 ${priorityTone(index)}`}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em]">
              Priority {index + 1}
            </p>
            <p className="mt-2 font-heading text-[1.15rem] font-bold">
              {priority.title}
            </p>
            <p className="mt-2 text-sm leading-7 opacity-90">
              {truncateText(priority.reasoning, 125)}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-7 space-y-5">
        {localRoadmap.map((item, index) => {
          const status = deriveStatus(item);
          const meta = statusMeta(status);
          const StatusIcon = meta.icon;
          const itemId = item.id ?? `${item.timeline}-${item.task}-${index}`;
          const isPending = pendingId === item.id;
          const isLocked = actionableIndex !== -1 && index > actionableIndex;
          const noteValue = draftNotes[itemId] ?? item.user_note ?? "";

          return (
            <article
              key={`${item.id ?? item.timeline}-${index}`}
              className={
                isLocked
                  ? "rounded-[20px] border border-[#dbe4f4] bg-[#fbfcff] p-5 opacity-70"
                  : "rounded-[20px] border border-[#dbe4f4] bg-white p-5"
              }
            >
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eef4ff] text-sm font-semibold text-[#173b72]">
                    {index + 1}
                  </div>
                  {index < localRoadmap.length - 1 ? (
                    <div className="mt-2 h-full min-h-16 w-px bg-[#dbe3f1]" />
                  ) : null}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8eaef5]">
                          {item.timeline}
                        </p>
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#f7f9fe] px-2.5 py-1 text-[11px] font-semibold text-[#62728f]">
                          <Clock3 className="h-3.5 w-3.5" />
                          {formatDate(item.due_at)}
                        </span>
                      </div>
                      <h4 className="mt-2 font-heading text-[1.4rem] font-bold text-[#173b72]">
                        {item.task}
                      </h4>
                    </div>

                    <div
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${meta.classes}`}
                    >
                      <StatusIcon className="h-4 w-4" />
                      {meta.label}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {isLocked ? (
                      <span className="rounded-full bg-[#f2f4f8] px-3 py-2 text-xs font-semibold text-[#62728f]">
                        Opens after the previous step is completed
                      </span>
                    ) : status === "NOT_STARTED" ? (
                      <Button
                        type="button"
                        disabled={!item.id || isPending}
                        onClick={() =>
                          item.id
                            ? void applyUpdate(
                                item.id,
                                { status: "IN_PROGRESS" },
                                "Step started.",
                              )
                            : null
                        }
                      >
                        <Play className="h-4 w-4" />
                        Start Step
                      </Button>
                    ) : status === "IN_PROGRESS" ? (
                      <>
                        <Button
                          type="button"
                          disabled={!item.id || isPending}
                          onClick={() =>
                            item.id
                              ? void applyUpdate(
                                  item.id,
                                  {
                                    status: "COMPLETED",
                                    outcome: noteValue.trim() || null,
                                  },
                                  "Step marked as completed.",
                                )
                              : null
                          }
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Mark Completed
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          disabled={!item.id || isPending}
                          onClick={() =>
                            item.id
                              ? void applyUpdate(
                                  item.id,
                                  { status: "BLOCKED" },
                                  "Step marked as blocked.",
                                )
                              : null
                          }
                        >
                          <CircleOff className="h-4 w-4" />
                          Mark Blocked
                        </Button>
                      </>
                    ) : status === "BLOCKED" ? (
                      <Button
                        type="button"
                        disabled={!item.id || isPending}
                        onClick={() =>
                          item.id
                            ? void applyUpdate(
                                item.id,
                                { status: "IN_PROGRESS" },
                                "Step moved back to in progress.",
                              )
                            : null
                        }
                      >
                        <Play className="h-4 w-4" />
                        Resume Step
                      </Button>
                    ) : (
                      <span className="rounded-full bg-[#f1fbf6] px-3 py-2 text-xs font-semibold text-[#2c7d5b]">
                        This step is complete
                      </span>
                    )}
                  </div>

                  {!isLocked ? (
                    <div className="mt-4">
                      <label className="text-sm font-semibold text-[#173b72]">
                        Private note
                      </label>
                      <textarea
                        value={noteValue}
                        disabled={!item.id || isPending}
                        onChange={(event) =>
                          setDraftNotes((current) => ({
                            ...current,
                            [itemId]: event.target.value,
                          }))
                        }
                        className="mt-2 min-h-24 w-full rounded-[16px] border border-[#d9deea] bg-[#fbfcff] px-3 py-3 text-sm leading-7 text-[#173b72] outline-none"
                        placeholder="Add a short private note or result for this step."
                      />
                      <div className="mt-3">
                        <Button
                          type="button"
                          variant="outline"
                          disabled={!item.id || isPending}
                          onClick={() =>
                            item.id
                              ? void applyUpdate(
                                  item.id,
                                  { userNote: noteValue.trim() || null },
                                  "Step note saved.",
                                )
                              : null
                          }
                        >
                          Save Note
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
