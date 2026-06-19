"use client";

import { ErrorState } from "@/components/ui/error-state";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="Something went wrong"
      message={error.message || "An unexpected error interrupted the page."}
      actionLabel="Try again"
      onAction={reset}
      fullScreen
    />
  );
}
