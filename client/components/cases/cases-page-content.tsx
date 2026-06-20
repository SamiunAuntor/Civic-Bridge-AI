"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FolderOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import { frontendFeatures } from "@/lib/features";
import { fetchCases } from "@/services/case-service";
import type { CaseRecord, CaseStatus } from "@/types/domain";
import { CaseStatusBadge } from "@/components/cases/case-status-badge";

const FILTERS: Array<{ label: string; value: CaseStatus | "ALL" }> = [
  { label: "All", value: "ALL" },
  { label: "Urgent", value: "URGENT" },
  { label: "Active", value: "ACTIVE" },
  { label: "Stable", value: "STABLE" },
  { label: "Resolved", value: "RESOLVED" },
];

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

function stabilityCardClass(score?: number | null) {
  if (typeof score !== "number") {
    return "border-[#dbe4f4] bg-[#f7f9fe] text-[#173b72]";
  }

  if (score < 40) {
    return "border-[#f3d1cb] bg-[#fff5f2] text-[#bf4a34]";
  }

  if (score < 70) {
    return "border-[#f3e4b8] bg-[#fffaf0] text-[#9a6a00]";
  }

  return "border-[#d7ede4] bg-[#f1fbf6] text-[#2c7d5b]";
}

function riskCardClass(risk?: string | null) {
  switch (risk) {
    case "HIGH":
      return "border-[#f3d1cb] bg-[#fff5f2] text-[#bf4a34]";
    case "MEDIUM":
      return "border-[#f3e4b8] bg-[#fffaf0] text-[#9a6a00]";
    case "LOW":
      return "border-[#d7ede4] bg-[#f1fbf6] text-[#2c7d5b]";
    default:
      return "border-[#dbe4f4] bg-[#f7f9fe] text-[#173b72]";
  }
}

function archiveCardClass(archivedAt?: string | null) {
  if (archivedAt) {
    return "border-[#d9deea] bg-[#f3f5fa] text-[#62728f]";
  }

  return "border-[#d7ede4] bg-[#f1fbf6] text-[#2c7d5b]";
}

export function CasesPageContent() {
  const [items, setItems] = useState<CaseRecord[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<CaseStatus | "ALL">("ALL");
  const [refreshNonce, setRefreshNonce] = useState(0);

  const requestQuery = useMemo(
    () => ({
      page,
      limit: 8,
      archived: false,
      status: statusFilter === "ALL" ? undefined : statusFilter,
      sort: "updated_desc" as const,
    }),
    [page, statusFilter],
  );
  const validItems = items.filter(
    (item) => typeof item.id === "string" && item.id.length > 0,
  );

  useEffect(() => {
    if (!frontendFeatures.enableCaseHistory) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadCases() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetchCases(requestQuery);

        if (cancelled) {
          return;
        }

        setItems(response.data.items);
        setTotalPages(response.data.pagination.totalPages);
      } catch (loadError) {
        if (cancelled) {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "We couldn't load your saved cases right now.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadCases();

    return () => {
      cancelled = true;
    };
  }, [refreshNonce, requestQuery]);

  if (!frontendFeatures.enableCaseHistory) {
    return (
      <EmptyState
        title="Case history is unavailable right now"
        message="We couldn't open your saved cases until the secure history service is available again."
      />
    );
  }

  if (loading) {
    return <LoadingState title="Loading your case history" />;
  }

  if (error) {
    return (
      <ErrorState
        title="We couldn't load your saved cases"
        message={error}
        actionLabel="Try Again"
        onAction={() => setRefreshNonce((current) => current + 1)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <section className="overflow-x-auto rounded-[22px] border border-[#dbe4f4] bg-white p-5 shadow-[0_8px_20px_-18px_rgba(17,43,89,0.3)]">
        <div className="flex min-w-max items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => {
                  setPage(1);
                  setStatusFilter(filter.value);
                }}
                className={
                  statusFilter === filter.value
                    ? "rounded-full bg-[#173b72] px-4 py-2 text-sm font-semibold text-white"
                    : "rounded-full bg-[#eef4ff] px-4 py-2 text-sm font-semibold text-[#173b72]"
                }
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/assessments/new"
              className="inline-flex items-center justify-center gap-2 rounded-[12px] bg-[#173b72] px-4 py-3 text-sm font-semibold text-white"
            >
              Start New Case
            </Link>
          </div>
        </div>
      </section>

      {validItems.length ? (
        <>
          <section className="grid gap-4 xl:grid-cols-2">
            {validItems.map((item) => (
              <article
                key={item.id}
                className="rounded-[20px] border border-[#dbe4f4] bg-white p-5 shadow-[0_8px_20px_-18px_rgba(17,43,89,0.3)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-heading text-[1.35rem] font-bold text-[#173b72]">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm text-[#62728f]">
                      Created {formatDate(item.created_at)} and updated{" "}
                      {formatDate(item.last_activity_at)}.
                    </p>
                  </div>
                  <CaseStatusBadge status={item.status} />
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div
                    className={`rounded-[18px] border px-4 py-3 ${stabilityCardClass(item.latest_stability_score)}`}
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7c879e]">
                      Stability
                    </p>
                    <p className="mt-2 font-heading text-2xl font-bold">
                      {item.latest_stability_score ?? "--"}
                    </p>
                  </div>
                  <div
                    className={`rounded-[18px] border px-4 py-3 ${riskCardClass(item.main_risk)}`}
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7c879e]">
                      Main Risk
                    </p>
                    <p className="mt-2 text-sm font-semibold">
                      {item.main_risk ?? "To be reviewed"}
                    </p>
                  </div>
                  <div
                    className={`rounded-[18px] border px-4 py-3 ${archiveCardClass(item.archived_at)}`}
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7c879e]">
                      Archive
                    </p>
                    <p className="mt-2 text-sm font-semibold">
                      {item.archived_at ? "Archived" : "Active"}
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-[14px] leading-7 text-[#62728f]">
                  {item.summary || "Open this case to review the latest situation, priorities, roadmap, and simulations."}
                </p>

                <div className="mt-6 flex items-center justify-between gap-3">
                  <div className="inline-flex items-center gap-2 text-sm text-[#62728f]">
                    <FolderOpen className="h-4 w-4 text-[#173b72]" />
                    Workspace ready to reopen
                  </div>
                  <Link
                    href={`/cases/${item.id}`}
                    className="inline-flex items-center gap-2 rounded-[12px] bg-[#173b72] px-4 py-2.5 text-sm font-semibold text-white"
                  >
                    Open Workspace
                  </Link>
                </div>
              </article>
            ))}
          </section>

          <section className="flex items-center justify-between gap-4 rounded-[22px] border border-[#dbe4f4] bg-white px-5 py-4 shadow-[0_8px_20px_-18px_rgba(17,43,89,0.3)]">
            <p className="text-sm text-[#62728f]">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((current) => current - 1)}
              >
                Previous
              </Button>
              <Button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </Button>
            </div>
          </section>
        </>
      ) : (
        <section className="rounded-[22px] border border-[#dbe4f4] bg-white p-8 shadow-[0_8px_20px_-18px_rgba(17,43,89,0.3)]">
          <EmptyState
            title={statusFilter === "ALL" ? "No saved cases yet" : "No cases match this view"}
            message={
              statusFilter === "ALL"
                ? "Start a new case to create your first workspace and keep a durable history of your crisis navigation."
                : "Try another filter or include archived cases to see more results."
            }
            action={
              statusFilter === "ALL" ? (
                <Link
                  href="/assessments/new"
                  className="inline-flex items-center gap-2 rounded-[12px] bg-[#173b72] px-4 py-2.5 font-semibold text-white"
                >
                  Start New Case
                </Link>
              ) : undefined
            }
          />
        </section>
      )}
    </div>
  );
}
